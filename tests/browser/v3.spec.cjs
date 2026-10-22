const {test,expect}=require('@playwright/test');
const crypto=require('node:crypto');test.use({serviceWorkers:'block'});
test('V3 four sections, eight distinct images, themes and bounded morning playlist',async({page},info)=>{
 const errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
 await page.goto('/idag.html');await expect(page.locator('.home-channels .channel-card')).toHaveCount(8);
 expect(await page.locator('.morning-home section[aria-labelledby]').evaluateAll(nodes=>nodes.map(n=>n.querySelector('h1,h2').textContent))).toEqual(['Dagens bevakning','Bevakningskanaler','Kunskapskanaler','Senast publicerat']);
 await expect(page.locator('[data-group=knowledge] .channel-card')).toHaveCount(4);const paths=await page.locator('.home-channels img').evaluateAll(images=>images.map(im=>im.getAttribute('src').split('?')[0]));expect(new Set(paths).size).toBe(8);
 const manifest=await(await page.request.get('/catalog/manifest.json')).json();expect(manifest.collections.episodes.count).toBeGreaterThanOrEqual(25);expect(Object.keys(manifest.superseded)).toHaveLength(5);
 const rows=(await Promise.all(manifest.collections.episodes.pages.map(p=>page.request.get('/'+p).then(r=>r.json())))).flatMap(p=>p.items);expect(rows.filter(e=>e.id.startsWith('WORK_LIBRARY_2026_10:'))).toHaveLength(25-Object.keys(manifest.withdrawn||{}).filter(id=>id.startsWith('WORK_LIBRARY_2026_10:')).length);
 // Complete home article loading before deliberate document navigation; WebKit
 // otherwise reports cancelled same-origin list fetches as access-control errors.
 await expect(page.locator('.home-articles .article-card').first()).toBeVisible();
 // Source lists may retain retired records; verify the client hides those IDs.
 const active=rows.filter(e=>!manifest.superseded[e.id]);expect(active.length).toBeGreaterThan(0);
 await page.goto('/lyssna.html');await expect(page.locator('.episode').first()).toBeVisible();const visible=await page.locator('.episode').evaluateAll(nodes=>nodes.map(n=>n.dataset.id));expect(visible.length).toBeGreaterThan(0);expect(visible.every(id=>active.some(e=>e.id===id))).toBe(true);expect(visible.some(id=>manifest.superseded[id])).toBe(false);await page.goto('/idag.html');await expect(page.locator('.morning-strip a').first()).toBeVisible();
 const actual=await page.locator('.morning-strip a').count();expect(actual).toBeGreaterThan(0);expect(actual).toBeLessThanOrEqual(manifest.channels.filter(c=>c.channel_type==='monitoring').length);
 await page.getByRole('button',{name:'Spela bevakningen',exact:true}).click();await expect(page.locator('#player')).toBeVisible();await expect.poll(()=>page.locator('#audio').evaluate(a=>a.currentTime)).toBeGreaterThan(0);await page.locator('#play-pause').click();
 await page.locator('#queue-toggle').click();await expect(page.locator('.queue-title')).toHaveCount(actual-1);await page.getByRole('button',{name:'Stäng kön'}).click();
 await page.getByRole('link',{name:'Mer',exact:true}).click();await page.getByLabel('Mörkt läge',{exact:true}).check();await page.getByRole('link',{name:'Idag',exact:true}).click();await expect(page.locator('.morning-brief')).toBeVisible();await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:'docs/evidence/'+info.project.name+'-v3-dark.png',fullPage:true,scale:'css'});
 await page.getByRole('link',{name:'Mer',exact:true}).click();await page.getByLabel('Ljust läge',{exact:true}).check();await page.getByRole('link',{name:'Idag',exact:true}).click();for(const image of await page.locator('.home-channels img').all()){await image.scrollIntoViewIfNeeded();await expect.poll(()=>image.evaluate(im=>im.complete&&im.naturalWidth>0)).toBe(true);}await expect.poll(()=>page.locator('.home-channels img').evaluateAll(images=>images.every(im=>im.complete&&im.naturalWidth>0))).toBe(true);await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:'docs/evidence/'+info.project.name+'-v3-full.png',fullPage:true,scale:'css'});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();expect(errors).toEqual([]);expect(requests.some(p=>p.endsWith('episodes.json')||p.endsWith('story_index.json'))).toBe(false);
});
test('V3 ordinary next-day arrival replaces fallback, special does not join morning queue',async({page})=>{
 await page.clock.setFixedTime(new Date('2026-10-21T06:00:00Z'));
 const m=await(await page.request.get('/catalog/manifest.json')).json();
 const channels=m.channels.filter(c=>c.channel_type==='monitoring').map(c=>c.id);for(const c of channels)m.collections['episodes/ordinary/channel/'+c]={count:2,pages:['catalog/lists/episodes/ordinary/channel/'+c+'/0.json']};
 await page.route('**/catalog/manifest.json',r=>r.fulfill({json:m}));
 await page.route('**/catalog/lists/episodes/ordinary/channel/**',r=>{const c=r.request().url().split('/').at(-2);if(c==='lagstiftning')return r.continue();return r.fulfill({json:{items:[{id:'WORK_SPECIALS_2026_10_21:'+c+':1',channel:c,kind:'special',date:'2026-10-21'},{id:c+':2026-10-21:daily',channel:c,kind:'daily',date:'2026-10-21',title:'Ny ordinarie '+c,duration_seconds:180,audio:'episodes/test.mp3'}]}});});
 await page.goto('/idag.html');await expect(page.locator('.morning-strip a')).toHaveCount(channels.length);await expect(page.locator('#brief-action')).toContainText(channels.length+' avsnitt');await expect(page.locator('#morning-editions')).not.toContainText('Senaste tillgängliga');expect((await page.locator('.morning-strip a').evaluateAll(nodes=>nodes.map(n=>n.href))).every(u=>u.includes('2026-10-21%3Adaily'))).toBeTruthy();
});
test('V3 retired episode and article deep links explain successor',async({page})=>{
 const m=await(await page.request.get('/catalog/manifest.json')).json(),id=Object.keys(m.superseded)[0];
 await page.goto('/avsnitt.html?id='+encodeURIComponent(id));await expect(page.getByRole('heading',{name:'Avsnittet har ersatts'})).toBeVisible();await expect(page.getByRole('link',{name:'Öppna den nya utgåvan'})).toHaveAttribute('href','avsnitt.html?id='+encodeURIComponent(m.superseded[id]));
 const hash=crypto.createHash('sha256').update('retired-test').digest('hex').slice(0,24);await page.route('**/catalog/articles/'+hash+'.json',r=>r.fulfill({json:{id:'retired-test',episode_id:id,catalog_status:'superseded',replacement_id:m.superseded[id]}}));await page.goto('/artikel.html?id=retired-test');await expect(page.getByRole('heading',{name:'Artikeln hör till ett ersatt avsnitt'})).toBeVisible();
});
test('V3 homepage intermediate widths keep titles visible and avoid nested card grids',async({page})=>{
 for(const width of [320,768,820,1024,1450]){
  await page.setViewportSize({width,height:1024});await page.goto('/idag.html');await expect(page.locator('.home-episodes .row-title strong').first()).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();await expect(page.locator('.home-episodes .episode-list')).toHaveCSS('display','block');
 }
});

