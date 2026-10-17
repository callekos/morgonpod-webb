const {test,expect}=require('@playwright/test');
test('navigation, expandable episodes, bounded requests and persistent player',async({page})=>{
 const requests=[];page.on('request',r=>requests.push(r.url()));
 await page.goto('/idag.html');await expect(page.getByRole('heading',{name:'God morgon.'})).toBeVisible();
 await page.getByRole('link',{name:'Lyssna',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Lyssna',exact:true})).toBeVisible();
 await page.locator('summary').first().click();await expect(page.getByRole('heading',{name:'Om avsnittet'})).toBeVisible();
 await page.getByRole('button',{name:'Spela avsnittet'}).click();await expect(page.locator('#player')).toBeVisible();
 const src=await page.locator('#audio').getAttribute('src');
 await page.getByRole('link',{name:'Artiklar',exact:true}).click();await expect(page.getByRole('heading',{name:'Artiklar',exact:true})).toBeVisible();
 await expect(page.locator('#audio')).toHaveAttribute('src',src);
 expect(requests.some(x=>x.includes('story_index.json')||x.endsWith('/episodes.json'))).toBeFalsy();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});
test('search, channel filtering, empty articles and statistics are honest',async({page})=>{
 await page.goto('/utforska.html');await page.getByRole('searchbox').fill('Uppstartsavsnitt');await page.getByRole('button',{name:'Sök',exact:true}).click();await expect(page.locator('summary')).toHaveCount(2);
 await page.goto('/lyssna.html');await page.getByRole('combobox').selectOption('sjoomradet');await page.getByRole('button',{name:'Visa',exact:true}).click();await expect(page.getByText('Inget publicerat innehåll i detta urval ännu.')).toBeVisible();
 await page.goto('/statistik.html');await expect(page.getByText('Ingen insamlad statistik ännu.',{exact:false})).toBeVisible();
});
