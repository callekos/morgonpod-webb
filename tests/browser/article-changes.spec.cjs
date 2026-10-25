const {test,expect}=require('@playwright/test');
test.use({serviceWorkers:'block'});
test('article shows dated correction and later update with original text and source links',async({page},info)=>{
 const article={id:'notes-fixture',episode_id:'ibat:2026-10-22:daily',channel:'ibat',title:'Syntetisk historikartikel',summary:'Den ursprungliga sammanfattningen.',body:'Den ursprungliga artikeltexten.',published_at:'2026-10-22T06:00:00Z',sources:[],editorial_notes:[
  {kind:'correction',at:'2026-10-24T09:00:00Z',text:'En felaktig uppgift har rättats.',source_url:'https://example.org/correction',audio_status:'original_not_regenerated'},
  {kind:'update',at:'2026-10-25T10:00:00Z',text:'En separat senare utveckling.',source_url:'https://example.org/update',audio_status:'original_not_regenerated'}],history:[{id:'notes-fixture',episode_id:'ibat:2026-10-22:daily',revision:1,body:'Den tidigare formuleringen före rättelsen.'}]};
 await page.route('**/catalog/articles/*.json',r=>r.fulfill({json:article}));
 await page.goto('/artikel.html?id=notes-fixture');
 await expect(page.getByRole('heading',{name:'Syntetisk historikartikel'})).toBeVisible();
 await expect(page.locator('.prose')).toHaveText('Den ursprungliga artikeltexten.');
 await expect(page.locator('.editorial-note')).toHaveCount(2);
 await expect(page.locator('.editorial-note').first().getByRole('heading')).toContainText('Rättelse');
 await expect(page.locator('.editorial-note').last().getByRole('heading')).toContainText('Uppdatering');
 await expect(page.getByRole('link',{name:'Källa till uppdatering',exact:true})).toHaveAttribute('href','https://example.org/update');
 await expect(page.locator('.article-changes time').last()).toHaveAttribute('datetime','2026-10-25T10:00:00Z');
 await expect(page.locator('.article-changes')).toContainText('Ljudet återger artikelns tidigare version.');
 await page.getByText('Tidigare artikelversioner',{exact:true}).click();
 await expect(page.locator('.article-history')).toContainText('Den tidigare formuleringen före rättelsen.');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 await page.screenshot({path:'docs/evidence/article-notes-'+info.project.name+'.png',fullPage:true});
});
