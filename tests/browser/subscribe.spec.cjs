const {test,expect}=require('@playwright/test');
const {subscriptionCheck}=require('./subscription-check.cjs');
test('subscription stays reachable, reuses Telegram and keeps playback',subscriptionCheck);
test('320px and large text keep subscription and navigation usable',async({page},info)=>{
 await page.setViewportSize({width:320,height:740});await page.goto('idag.html');
 await page.evaluate(()=>document.documentElement.style.fontSize='200%');
 // Simulate browser text enlargement on the header's explicitly sized typography too.
 await page.addStyleTag({content:'.header{font-size:30px}.header>.brand{font-size:42px}.header .subscribe-button{font-size:30px}'});
 await page.evaluate(()=>scrollTo(0,900));const button=page.locator('.header .subscribe-button');await expect(button).toBeInViewport();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const box=await button.boundingBox();expect(box.height).toBeGreaterThanOrEqual(44);expect(box.width).toBeGreaterThanOrEqual(44);
 await button.focus();await expect(button).toBeFocused();await page.keyboard.press('Enter');await expect(page.locator('h1')).toHaveText('Prenumerera på Morgonpodden');
 await expect(page.locator('#view')).toBeFocused();await page.keyboard.press('Tab');await expect(page.getByRole('link',{name:'Öppna Morgonpodden i Telegram'})).toBeFocused();
 await page.screenshot({path:'test-results/'+info.project.name+'-subscribe-320.png',fullPage:true});
});

test('clean header and matching directory headings',async({page})=>{
 let heading;
 for(const route of ['kanaler','artiklar']){
  await page.goto(route+'.html');await expect(page.locator('.page-heading h1')).toHaveText(route==='kanaler'?'Kanaler':'Artiklar');
  await expect(page.locator('.header a[aria-label="Sök"]')).toHaveCount(0);
  await expect(page.locator('#nav a[href="utforska.html"]')).toBeVisible();
  await expect(page.locator('#channel-query')).toHaveCount(0);
  const styles=await page.locator('.page-heading').evaluate(el=>[el,el.querySelector('h1'),el.querySelector('p')].map(e=>{const s=getComputedStyle(e);return [s.fontFamily,s.fontSize,s.fontWeight,s.lineHeight,s.margin]}));
  if(heading)expect(styles).toEqual(heading);heading=styles;
  const right=await page.locator('.header').evaluate(el=>el.getBoundingClientRect().right-parseFloat(getComputedStyle(el).paddingRight));
  const button=await page.locator('.header .subscribe-button').boundingBox();expect(Math.abs(button.x+button.width-right)).toBeLessThan(2);
 }
});
