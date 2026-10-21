const {test,expect}=require('@playwright/test');test.use({serviceWorkers:'block'});
test('knowledge entry points, four visible mobile editions, readable intermediate widths',async({page},info)=>{
 await page.goto('/kanal.html?id=lagstiftning');await expect(page.locator('.channel-type')).toHaveText('Kunskapskanal');await expect(page.getByRole('link',{name:'Börja här: uppstartsavsnittet'})).toBeVisible();
 await page.getByRole('link',{name:'Grundkurser',exact:true}).click();await expect(page.locator('#channel-content')).toContainText('Inga publicerade avsnitt av den här typen ännu');
 await page.getByRole('link',{name:'Avsnitt',exact:true}).click();await expect(page.locator('.episode')).toHaveCount(2);await page.getByRole('link',{name:'Om kanalen',exact:true}).click();await expect(page.locator('#channel-content')).toContainText('Ingen återkommande nyhetsutgåva');
 for(const width of [320,393,768,1024,1450]){await page.setViewportSize({width,height:900});await page.goto('/idag.html');await expect(page.locator('.morning-strip a')).toHaveCount(4);expect(await page.locator('.morning-strip').evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
 await page.screenshot({path:'docs/evidence/'+info.project.name+'-v4-home.png'});
});
test('search refinements preserve exact playback result context',async({page})=>{
 await page.goto('/utforska.html');await page.getByRole('searchbox').fill('AI');await page.getByRole('button',{name:'Sök',exact:true}).click();await expect(page.locator('#results')).toContainText('träffar');await page.locator('#search-channel').selectOption('ai_brottsbekampning');await page.locator('#search-content').selectOption('introduction');await page.locator('#search-duration').selectOption('long');await expect(page.locator('#results .episode')).toHaveCount(1);await expect(page.locator('#results .episode')).toContainText('Uppstart');
 await page.locator('#results [data-play]').click();await expect(page.locator('#player')).toBeVisible();await page.locator('#queue-toggle').click();await expect(page.locator('.queue-title')).toHaveCount(0);
});
test('filtered archive queue does not admit unrelated content from a later page',async({page})=>{
 const m=await(await page.request.get('/catalog/manifest.json')).json();m.collections['episodes/channel/lagstiftning']={count:3,pages:['catalog/lists/filter/0.json','catalog/lists/filter/1.json']};
 await page.route('**/catalog/manifest.json',r=>r.fulfill({json:m}));const base={channel:'lagstiftning',date:'2026-10-21',audio:'episodes/test.mp3',duration_seconds:180};
 await page.route('**/catalog/lists/filter/0.json',r=>r.fulfill({json:{items:[{...base,id:'course-1',title:'Grundkurs ett',kind:'course'}]}}));await page.route('**/catalog/lists/filter/1.json',r=>r.fulfill({json:{items:[{...base,id:'unrelated',title:'Bevakning',kind:'daily'},{...base,id:'course-2',title:'Grundkurs två',kind:'course'}]}}));
 await page.goto('/kanal.html?id=lagstiftning&tab=courses&sort=latest');await expect(page.locator('.episode')).toHaveCount(1);await page.locator('[data-play]').click();await page.locator('#queue-toggle').click();await page.getByRole('button',{name:'Hämta fler avsnitt',exact:true}).click();await expect(page.locator('.queue-title')).toHaveCount(1);await expect(page.locator('.queue-title')).toContainText('Grundkurs två');await expect(page.locator('#queue-panel')).not.toContainText('Bevakning');
});
