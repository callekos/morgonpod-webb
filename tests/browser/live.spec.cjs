// Read-only checks of the deployed Pages site. No production or Telegram writes.
const {test,expect}=require('@playwright/test');
const expectedApp=require('node:fs').readFileSync(require('node:path').join(__dirname,'../../index.html'),'utf8').match(/<script src="(app\.js[^"]*)"/)[1];
const channelCount=async page=>(await(await page.request.get('catalog/manifest.json')).json()).channels.length;
test('published six flows, themes, real audio and canonical channel identity',async({page},info)=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('idag.html');await expect(page.locator('.morning-brief')).toBeVisible();
 await expect(page.locator('script[src*="app.js"]')).toHaveAttribute('src',expectedApp);
 await page.getByRole('link',{name:'Kanaler',exact:true}).click();await expect(page.locator('.channel-card')).toHaveCount(await channelCount(page));
 await page.locator('.channel-card').filter({hasText:'IBAT'}).click();await expect(page.getByRole('heading',{name:'IBAT - Informationsförsörjning',exact:true})).toBeVisible();
 await page.locator('#archive-sort').selectOption('oldest');await expect(page.locator('.episode').first()).toContainText('Avsnitt 1 / Uppstart');
 await page.locator('summary').first().click();await page.getByRole('link',{name:/Öppna stor spelare/}).click();await page.locator('#big-play').click();
 await expect.poll(()=>page.locator('#audio').evaluate(e=>e.currentTime)).toBeGreaterThan(0);const source=await page.locator('#audio').getAttribute('src');
 await page.getByRole('button',{name:'Ändra hastighet'}).click();await expect(page.locator('#audio')).toHaveJSProperty('playbackRate',1.25);
 await page.getByRole('link',{name:'Artiklar',exact:true}).click();await page.locator('.article-card').first().click();await expect(page.locator('.reading h1')).toBeVisible();
 await expect(page.locator('#audio')).toHaveAttribute('src',source);await expect(page.locator('.reading a[target="_blank"]').first()).toBeVisible();
 await page.locator('#nav').getByRole('link',{name:'Sök',exact:true}).click();await page.getByRole('searchbox').fill('IBAT');await page.getByRole('button',{name:'Sök',exact:true}).click();await page.getByRole('button',{name:'Kanaler',exact:true}).click();await expect(page.locator('#results .channel-card')).toHaveCount(1);
 await page.locator('#nav').getByRole('link',{name:'Mer',exact:true}).click();await page.getByLabel('Mörkt läge',{exact:true}).check();await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await page.getByLabel('Ljust läge',{exact:true}).check();await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await page.getByLabel('Följ systemet',{exact:true}).check();await page.emulateMedia({colorScheme:'dark'});await expect(page.locator('body')).toHaveCSS('background-color','rgb(7, 23, 32)');
 const position=await page.locator('#audio').evaluate(a=>a.currentTime);await page.getByRole('link',{name:'Designlaboratorium',exact:true}).click();await page.locator('[name="art-style"]').first().check();await expect(page.locator('#art-status')).toContainText('Vald bildstil:');await expect(page.locator('#player-image')).toHaveAttribute('src',/assets\/design-lab\//);await expect(page.locator('#audio')).toHaveAttribute('src',source);await expect.poll(()=>page.locator('#audio').evaluate(a=>a.currentTime)).toBeGreaterThan(position);await expect(page.locator('#audio')).toHaveJSProperty('paused',false);await page.getByRole('button',{name:'Återställ till standard',exact:true}).click();await expect(page.locator('#player-image')).toHaveAttribute('src',/assets\/design-lab\/06-film\//);await page.locator('#nav').getByRole('link',{name:'Mer',exact:true}).click();
 await page.reload();await expect(page.getByLabel('Följ systemet',{exact:true})).toBeChecked();
 expect(errors).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 await page.screenshot({path:'playwright-report/'+info.project.name+'-published.png'});
});


test('published groups, film default, shared filters and approved episode titles',async({page})=>{
 const manifest=await(await page.request.get('catalog/manifest.json')).json();
 await page.goto('idag.html');await expect(page.locator('.home-channel-groups .channel-group')).toHaveCount(2);
 for(const type of ['monitoring','knowledge']){
  const expected=manifest.channels.filter(c=>c.channel_type===type);const group=page.locator('.home-channel-groups [data-group='+type+']');
  await expect(group.locator('.channel-card')).toHaveCount(Math.min(expected.length,4));await expect(group.locator('.group-all')).toHaveCount(expected.length>4?1:0);
  expect(await group.locator('img').evaluateAll(nodes=>nodes.every(n=>n.getAttribute('src').includes('/06-film/')&&!n.getAttribute('src').includes('-master')))).toBe(true);
 }
 await page.goto('kanaler.html?group=knowledge');await expect(page.locator('.channel-card')).toHaveCount(manifest.channels.filter(c=>c.channel_type==='knowledge').length);await expect(page.locator('.channel-group')).toHaveCount(1);await page.reload();await expect(page.locator('[data-group=knowledge]')).toBeVisible();
 await page.getByRole('link',{name:'Bevakningskanaler',exact:true}).click();await expect(page).toHaveURL(/group=monitoring/);await page.goBack();await expect(page).toHaveURL(/group=knowledge/);
 const data=await(await page.request.get(manifest.collections['episodes/ordinary/channel/ibat'].pages[0])).json();const row=data.items.find(e=>!manifest.superseded[e.id]);expect(row.title).toMatch(/^Avsnitt \d+: .+/);
 await page.goto('avsnitt.html?id='+encodeURIComponent(row.id));await expect(page.locator('.full-player h2')).toHaveText(row.title);await expect(page.locator('.full-player p').first()).not.toBeEmpty();await expect(page.locator('.episode-info .article-card')).toHaveCount(row.article_count);
 expect(Number.isInteger(row.article_count)&&row.article_count>=0).toBe(true);
 // Keep a positive article-rendering check even when today's approved edition is brief.
 const articleRow=data.items.find(e=>!manifest.superseded[e.id]&&e.article_count>0);
 expect(articleRow).toBeTruthy();
 await page.goto('avsnitt.html?id='+encodeURIComponent(articleRow.id));
 await expect(page.locator('.full-player h2')).toHaveText(articleRow.title);
 await expect(page.locator('.episode-info .article-card')).toHaveCount(articleRow.article_count);
 await expect(page.locator('.episode-info .article-card').first()).toBeVisible();
});

test('published subscription is reachable while scrolling and preserves real audio',require('./subscription-check.cjs').subscriptionCheck);

test('existing Telegram invitation exposes the matching join handoff',async({request},info)=>{
 test.skip(info.project.name!=='desktop','One independent HTTP check of the shared invitation is sufficient');
 const response=await request.get('https://t.me/+jlPUjsmjlE03NDFk');expect(response.ok()).toBe(true);
 const html=await response.text();expect(html).toMatch(/<title>Telegram:/);expect(html).toContain('class="tgme_action_button"');expect(html).not.toMatch(/invite link (has expired|is invalid)/i);expect(html).toMatch(/tg:\/\/join\?invite=jlPUjsmjlE03NDFk/);
});
test('published home and directory retain distinct descriptive card formats',require('./cards-check.cjs').cardsCheck);
test('published withdrawal retains source files, intro and all specials',async({page})=>{
 const manifest=await(await page.request.get('catalog/manifest.json')).json();const id='WORK_LIBRARY_2026_10:lagstiftning:replacement_ordinary:2';expect(manifest.withdrawn[id]).toBeTruthy();expect(Object.keys(manifest.superseded)).toHaveLength(5);expect(manifest.collections['episodes/topic/specialavsnitt'].count).toBe(15);expect(manifest.collections['episodes/channel/lagstiftning'].count).toBe(6);
 await page.goto('avsnitt.html?id='+encodeURIComponent(id));await expect(page.locator('h1')).toHaveText('Avsnittet är avpublicerat');await page.goto('artikel.html?id=work-lagstiftning_ordinary-article-1');await expect(page.locator('h1')).toHaveText('Artikeln är avpublicerad');
 await page.goto('kanal.html?id=lagstiftning');await expect(page.locator('.episode')).toHaveCount(6);await expect(page.locator('.episode').filter({hasText:'Veckoöversikt'})).toHaveCount(0);
});

test('published Mediesvepet cover keeps its own film motif in narrow and wide layouts',async({page},info)=>{
 for(const width of [320,1450]){
  await page.setViewportSize({width,height:1000});
  for(const [label,route] of [['channel','kanal.html?id=mediesvepet'],['directory','kanaler.html?group=monitoring'],['home','idag.html']]){
   await page.goto(route);await expect(page.locator('#view')).not.toContainText('Hämtar innehåll…');
   const covers=page.locator('#view img[data-art-channel="mediesvepet"]:visible');
   if(label!=='home')expect(await covers.count()).toBeGreaterThan(0);
   for(const im of await covers.all()){
    await im.scrollIntoViewIfNeeded();await expect(im).toHaveAttribute('src',/assets\/design-lab\/06-film\/mediesvepet(?:-small|-square)?\.webp/);
    await expect.poll(()=>im.evaluate(el=>el.complete&&el.naturalWidth>0)).toBe(true);
   }
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   await page.screenshot({path:'docs/evidence/'+info.project.name+'-media-cover-'+label+'-'+width+'.png',fullPage:true});
  }
 }
});
