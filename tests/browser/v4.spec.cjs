const {test,expect}=require('@playwright/test');test.use({serviceWorkers:'block'});
const polishArt=require('../../channel-art-manifest.js').styles.filter(s=>s.id!=='v3');
for(const count of [1,2])test('partial morning preserves '+count+' deliveries and reports missing channels',async({page})=>{
 await require('./morning-fixture.cjs').morningFixture(page,count);
 await page.goto('/idag.html');
 await expect(page.locator('.morning-strip a')).toHaveCount(count);
 await expect(page.locator('#morning-editions .edition-status').last()).toContainText('inväntar publicering');
 await page.getByRole('button',{name:'Spela bevakningen',exact:true}).click();
 await expect.poll(()=>page.locator('#audio').evaluate(a=>a.currentTime)).toBeGreaterThan(0);
 await expect(page.locator('.queue-title')).toHaveCount(count-1);
});
test('large channel covers use wide artwork and channel metadata follows its context',async({page})=>{
 async function sharpHero(){const hero=page.locator('.channel-hero img');await expect(hero).toBeVisible();await expect.poll(()=>hero.evaluate(im=>im.complete&&im.naturalWidth>0)).toBe(true);const image=await hero.evaluate(im=>({src:im.currentSrc,required:im.getBoundingClientRect().width*devicePixelRatio}));if(image.required>400)expect(image.src).not.toContain('-small.webp');}
 await page.goto('/kanal.html?id=ibat');await sharpHero();
 await page.locator('#nav').getByRole('link',{name:'Mer',exact:true}).click();await page.getByRole('link',{name:'Designlaboratorium',exact:true}).click();await page.locator('[name="art-style"][value="'+polishArt[0].id+'"]').check();await expect(page.locator('#art-status')).toContainText('Vald bildstil: '+polishArt[0].name);
 await page.getByRole('link',{name:'Kanaler',exact:true}).click();await page.locator('.channel-card').filter({hasText:'IBAT - Informationsförsörjning'}).click();await sharpHero();
 const ownChannel=page.locator('.channel-main .episode .channel-name').first();await expect(ownChannel).toHaveText('IBAT - Informationsförsörjning');await expect(ownChannel).toBeHidden();
 await page.goto('/lyssna.html');await expect(page.locator('.episode .channel-name').first()).toBeVisible();
});
test('style names are concise and search counts keep one persistent live region',async({page})=>{
 await page.goto('/designlaboratorium.html');
 for(const style of polishArt)await expect(page.locator('[name="art-style"][value="'+style.id+'"]')).toHaveAccessibleName('STIL '+String(style.number).padStart(2,'0')+' '+style.name);
 await page.goto('/utforska.html');const status=page.locator('#search-status');await expect(status).toHaveAttribute('role','status');await expect(status).toHaveAttribute('aria-live','polite');await status.evaluate(e=>e.dataset.testIdentity='persistent-search-status');
 await page.getByRole('searchbox').fill('AI');await page.getByRole('button',{name:'Sök',exact:true}).click();await expect(status).toHaveText(/^\d+ träffar$/);
 await page.locator('#search-channel').selectOption('ai_brottsbekampning');await expect(status).toHaveAttribute('data-test-identity','persistent-search-status');await expect(status).toHaveText(/^\d+ träffar$/);
 await page.getByRole('searchbox').fill('qzxjv4ingenuniktraff');await page.getByRole('button',{name:'Sök',exact:true}).click();await expect(status).toHaveText('0 träffar');await expect(status).toHaveAttribute('data-test-identity','persistent-search-status');
});
test('knowledge entry points, four visible mobile editions, readable intermediate widths',async({page},info)=>{
 test.setTimeout(60000); // Five full viewport navigations plus channel tabs in WebKit.
 await require('./morning-fixture.cjs').morningFixture(page);
 await page.goto('/kanal.html?id=lagstiftning');await expect(page.locator('.channel-type')).toHaveText('Kunskapskanal');await expect(page.getByRole('link',{name:'Börja här: uppstartsavsnittet'})).toBeVisible();
 await page.getByRole('link',{name:'Grundkurser',exact:true}).click();await expect(page.locator('.tabs [aria-current="page"]')).toHaveText('Grundkurser');
 await page.getByRole('link',{name:'Avsnitt',exact:true}).click();const catalog=await(await page.request.get('/catalog/manifest.json')).json();const paths=catalog.collections['episodes/channel/lagstiftning'].pages;const first=await(await page.request.get('/'+paths[0])).json();const active=first.items.filter(e=>!catalog.superseded?.[e.id]).sort(require('../../app.js').compareLatest);await expect(page.locator('.episode')).toHaveCount(Math.min(24,active.length));expect(await page.locator('.episode').evaluateAll(nodes=>nodes.map(n=>n.dataset.id))).toEqual(active.slice(0,24).map(e=>e.id));await page.getByRole('link',{name:'Om kanalen',exact:true}).click();await expect(page.locator('#channel-content')).toContainText('Ingen återkommande nyhetsutgåva');
 for(const width of [320,393,768,1024,1450]){await page.setViewportSize({width,height:900});await page.goto('/idag.html',{waitUntil:'domcontentloaded'});await expect(page.locator('.morning-strip a')).toHaveCount(4);expect(await page.locator('.morning-strip').evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
 await page.screenshot({path:'docs/evidence/'+info.project.name+'-v4-home.png'});
});
test('search refinements preserve exact playback result context',async({page})=>{
 await page.goto('/utforska.html');await page.getByRole('searchbox').fill('AI');await page.getByRole('button',{name:'Sök',exact:true}).click();await expect(page.locator('#search-status')).toContainText('träffar');await page.locator('#search-channel').selectOption('ai_brottsbekampning');await page.locator('#search-content').selectOption('introduction');await page.locator('#search-duration').selectOption('long');await expect(page.locator('#results .episode')).toHaveCount(1);await expect(page.locator('#results .episode')).toContainText('Uppstart');
 await page.locator('#results [data-play]').click();await expect(page.locator('#player')).toBeVisible();await page.locator('#queue-toggle').click();await expect(page.locator('.queue-title')).toHaveCount(0);
});
test('filtered archive queue does not admit unrelated content from a later page',async({page})=>{
 const m=await(await page.request.get('/catalog/manifest.json')).json();m.collections['episodes/channel/lagstiftning']={count:3,pages:['catalog/lists/filter/0.json','catalog/lists/filter/1.json']};
 await page.route('**/catalog/manifest.json',r=>r.fulfill({json:m}));const base={channel:'lagstiftning',date:'2026-10-21',audio:'episodes/test.mp3',duration_seconds:180};
 await page.route('**/catalog/lists/filter/0.json',r=>r.fulfill({json:{items:[{...base,id:'course-1',title:'Grundkurs ett',kind:'course'}]}}));await page.route('**/catalog/lists/filter/1.json',r=>r.fulfill({json:{items:[{...base,id:'unrelated',title:'Bevakning',kind:'daily'},{...base,id:'course-2',title:'Grundkurs två',kind:'course'}]}}));
 await page.goto('/kanal.html?id=lagstiftning&tab=courses&sort=latest');await expect(page.locator('.episode')).toHaveCount(1);await page.locator('[data-play]').click();await page.locator('#queue-toggle').click();await page.getByRole('button',{name:'Hämta fler avsnitt',exact:true}).click();await expect(page.locator('.queue-title')).toHaveCount(1);await expect(page.locator('.queue-title')).toContainText('Grundkurs två');await expect(page.locator('#queue-panel')).not.toContainText('Bevakning');
});
