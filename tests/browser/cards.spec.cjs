const {test,expect}=require('@playwright/test');
test('home and directory use distinct approved channel cards',require('./cards-check.cjs').cardsCheck);
test('withdrawn weekly episode and linked article are clear, preserved specials remain discoverable',async({page})=>{
 const id='WORK_LIBRARY_2026_10:lagstiftning:replacement_ordinary:2';
 await page.goto('/avsnitt.html?id='+encodeURIComponent(id));await expect(page.locator('h1')).toHaveText('Avsnittet är avpublicerat');await expect(page.locator('#big-play')).toHaveCount(0);
 await page.goto('/artikel.html?id=work-lagstiftning_ordinary-article-1');await expect(page.locator('h1')).toHaveText('Artikeln är avpublicerad');
 await page.goto('/kanal.html?id=lagstiftning');await expect(page.locator('.episode')).toHaveCount(6);await expect(page.locator('.episode').filter({hasText:'Veckoöversikt'})).toHaveCount(0);await expect(page.locator('[data-id="WORK_LIBRARY_2026_10:lagstiftning:intro:1"]')).toHaveCount(1);
 await page.getByRole('link',{name:'Fördjupningar',exact:true}).click();await expect(page.locator('.episode')).toHaveCount(5);
 await page.goto('/utforska.html');await page.getByRole('searchbox').fill('Veckoöversikt');await page.getByRole('button',{name:'Sök',exact:true}).click();await expect(page.locator('[data-id="'+id+'"]')).toHaveCount(0);
 await page.evaluate(id=>localStorage.setItem('morgonpod-playback',JSON.stringify({schema:1,items:[{id,channel:'lagstiftning',title:'Old week'}],index:0,source:null,position:20})),id);
 await page.reload();await expect(page.getByRole('status').filter({hasText:'avpublicerat avsnitt'})).toBeVisible();await expect(page.locator('#audio')).not.toHaveAttribute('src',/morgonpod/);
});
