const {test,expect}=require('@playwright/test');const manifest=require('../../channel-art-manifest.js');test.use({serviceWorkers:'block'});
const styles=manifest.styles.filter(s=>s.id!=='v3');test.setTimeout(Math.max(30000,styles.length*15000));
test('ordinary visitors load only default film derivatives and no production originals',async({page})=>{
 const imageRequests=[];page.on('request',r=>{if(r.resourceType()==='image')imageRequests.push(r.url());});
 await page.goto('/idag.html');await expect(page.locator('.home-channels img').first()).toBeVisible();
 await page.getByRole('link',{name:'Kanaler',exact:true}).click();const catalog=await(await page.request.get('/catalog/manifest.json')).json();await expect(page.locator('.channel-card')).toHaveCount(catalog.channels.length);
 expect(imageRequests.filter(u=>u.includes('/design-lab/')).every(u=>u.includes('/06-film/'))).toBe(true);
 await page.getByRole('link',{name:'Mer',exact:true}).click();await page.getByRole('link',{name:'Designlaboratorium',exact:true}).click();
 await expect(page.locator('[name="art-style"]')).toHaveCount(styles.length);
 expect(imageRequests.filter(u=>u.includes('/design-lab/')).every(u=>u.endsWith('/preview.webp')||u.includes('/06-film/'))).toBe(true);
 expect(imageRequests.some(u=>u.includes('-master.webp'))).toBe(false);
});
test('laboratory keeps audio, queue, navigation, theme and saved style',async({page},info)=>{
 await require('./morning-fixture.cjs').morningFixture(page);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/idag.html');await expect(page.locator('[data-group=knowledge] .channel-card')).toHaveCount(4);
 await expect(page.locator('.morning-strip a')).not.toHaveCount(0);expect(await page.locator('.morning-strip a').evaluateAll(nodes=>nodes.every(a=>!a.href.includes('lagstiftning')))).toBe(true);
 await page.getByRole('button',{name:'Spela bevakningen',exact:true}).click();await expect.poll(()=>page.locator('#audio').evaluate(a=>a.currentTime)).toBeGreaterThan(0);
 const queueTitles=await page.locator('.queue-title').allTextContents();expect(queueTitles.length).toBeGreaterThan(0);
 const before=await page.locator('#audio').evaluate(a=>{a.dataset.identity='persistent-audio';a.dataset.pauseCount='0';a.addEventListener('pause',()=>a.dataset.pauseCount=String(Number(a.dataset.pauseCount)+1));return {src:a.currentSrc,time:a.currentTime};});
 await page.getByRole('link',{name:'Mer',exact:true}).click();await page.getByLabel('Mörkt läge',{exact:true}).check();await page.getByRole('link',{name:'Designlaboratorium',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Designlaboratorium'})).toBeVisible();await expect(page.locator('[name="art-style"]')).toHaveCount(styles.length);
 for(const style of styles){const radio=page.locator('[name="art-style"][value="'+style.id+'"]');await radio.scrollIntoViewIfNeeded();const scrollBefore=await page.evaluate(()=>scrollY);const queueBefore=await page.evaluate(()=>{const {position,...state}=JSON.parse(localStorage.getItem('morgonpod-playback'));return state;});await radio.evaluate(el=>el.click());await expect(page.locator('#art-status')).toContainText('Vald bildstil: '+style.name);await expect(page.locator('#player-image')).toHaveAttribute('src',new RegExp('/'+style.id+'/'));
  const state=await page.locator('#audio').evaluate(a=>({src:a.currentSrc,time:a.currentTime,paused:a.paused,pauses:a.dataset.pauseCount,id:a.dataset.identity}));expect(state.src).toBe(before.src);expect(state.time).toBeGreaterThan(before.time);expect(state.paused).toBe(false);expect(state.pauses).toBe('0');expect(state.id).toBe('persistent-audio');expect(await page.evaluate(()=>scrollY)).toBe(scrollBefore);expect(await page.evaluate(()=>{const {position,...state}=JSON.parse(localStorage.getItem('morgonpod-playback'));return state;})).toEqual(queueBefore);expect(await page.locator('.queue-title').allTextContents()).toEqual(queueTitles);expect(await page.locator('#queue-panel img').evaluateAll((nodes,id)=>nodes.every(im=>im.dataset.artChannel==='mediesvepet'?im.getAttribute('src').startsWith('assets/channels/mediesvepet'):im.getAttribute('src').includes('/'+id+'/')),style.id)).toBe(true);
 }
 await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:'docs/evidence/'+info.project.name+'-designlab.png',fullPage:true});
 await page.getByRole('link',{name:'Idag',exact:true}).click();await expect(page.locator('.home-channels img').first()).toHaveAttribute('src',new RegExp('/'+styles.at(-1).id+'/'));await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await page.locator('#play-pause').click();await page.reload();await expect(page.locator('.home-channels img').first()).toHaveAttribute('src',new RegExp('/'+styles.at(-1).id+'/'));await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await page.getByRole('link',{name:'Mer',exact:true}).click();await page.getByRole('link',{name:'Designlaboratorium',exact:true}).click();await page.getByRole('button',{name:'Återställ till standard',exact:true}).click();await expect(page.locator('#art-status')).toContainText('Vald bildstil: Analog filmfotografi');await expect(page.locator('#player-image')).toHaveAttribute('src',/assets\/design-lab\/06-film\//);expect(errors).toEqual([]);
});
test('every ready style reaches channel, article, episode, search, archive and queue surfaces',async({page})=>{
 for(const style of styles){
  await page.goto('/designlaboratorium.html');await page.locator('[name="art-style"][value="'+style.id+'"]').check();await expect(page.locator('#art-status')).toContainText('Vald bildstil: '+style.name);
  for(const route of ['/kanaler.html','/kanal.html?id=lagstiftning','/lyssna.html','/artiklar.html']){await page.goto(route);await expect(page.locator('img[data-art-channel]').first()).toBeVisible();expect(await page.locator('img[data-art-channel]').evaluateAll((nodes,id)=>nodes.every(im=>im.dataset.artChannel==='mediesvepet'?im.getAttribute('src').startsWith('assets/channels/mediesvepet'):im.getAttribute('src').includes('/'+id+'/')),style.id)).toBe(true);}
  const article=await page.locator('.article-card').first().getAttribute('href');await page.goto('/'+article);const reading=page.locator('.reading-cover');await expect(reading).toHaveAttribute('src',(await reading.getAttribute('data-art-channel'))==='mediesvepet'?/assets\/channels\/mediesvepet/:new RegExp('/'+style.id+'/'));
  await page.getByRole('link',{name:'Lyssna på tillhörande avsnitt'}).click();const large=page.locator('.large-cover');await expect(large).toHaveAttribute('src',(await large.getAttribute('data-art-channel'))==='mediesvepet'?/assets\/channels\/mediesvepet/:new RegExp('/'+style.id+'/'));
  await page.goto('/utforska.html');await page.getByRole('searchbox').fill('informationsförsörjning');await page.getByRole('button',{name:'Sök',exact:true}).click();await expect(page.locator('#results img').first()).toHaveAttribute('src',new RegExp('/'+style.id+'/'));
 }
});
test('failed series preload preserves earlier choice and broken selected image falls back to V3',async({page})=>{
 const style=styles[0];await page.route('**/assets/design-lab/'+style.id+'/*-small.webp',r=>r.abort());await page.goto('/designlaboratorium.html');await page.locator('[name="art-style"]').first().click();await expect(page.locator('#art-status')).toContainText('kunde inte hämtas');await expect(page.locator('[name="art-style"]').first()).not.toBeChecked();
 await page.goto('/kanaler.html');await expect(page.locator('.channel-card img').first()).toHaveAttribute('src',/assets\/design-lab\/06-film\//);
 await page.unroute('**/assets/design-lab/'+style.id+'/*-small.webp');await page.goto('/designlaboratorium.html');await page.locator('[name="art-style"]').first().check();await expect(page.locator('#art-status')).toContainText('Vald bildstil: '+style.name);
 await page.route('**/assets/design-lab/'+style.id+'/*',r=>r.abort());await page.goto('/kanal.html?id=ibat');await expect(page.locator('.channel-hero img')).toHaveAttribute('src',/^assets\/channels\//);
});

