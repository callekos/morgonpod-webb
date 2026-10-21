const {test,expect}=require('@playwright/test');
test.use({serviceWorkers:'block'});
test('twenty styles support large text, narrow screens, keyboard and reduced motion',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:320,height:800});
 await page.goto('/designlaboratorium.html');await expect(page.locator('[name="art-style"]')).toHaveCount(20);
 await page.evaluate(()=>document.documentElement.style.fontSize='200%');expect(await page.evaluate(()=>innerWidth)).toBe(320);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const choice=page.locator('[name="art-style"][value="20-magazine"]');await choice.focus();await page.keyboard.press('Space');await expect(choice).toBeChecked();await expect(page.locator('#art-status')).toContainText('Modern tidskriftsillustration');
 await page.getByRole('button',{name:'Återställ till ordinarie design',exact:true}).focus();await page.keyboard.press('Enter');await expect(page.locator('#art-status')).toContainText('Ordinarie design V3');
 await page.getByRole('link',{name:'Idag',exact:true}).click();await expect(page.locator('.home-channels .channel-card')).toHaveCount(8);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
