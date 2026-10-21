const {test,expect}=require('@playwright/test');const axe=require('axe-core');test.use({serviceWorkers:'block'});
test('automated WCAG checks for five main routes in light and dark themes',async({page})=>{
 test.setTimeout(120000);
 for(const colorScheme of ['light','dark'])for(const route of ['idag.html','kanaler.html','kanal.html?id=lagstiftning','designlaboratorium.html','utforska.html']){
  await page.emulateMedia({colorScheme});await page.goto('/'+route);await expect(page.locator('#view h1')).toBeVisible();
  if(route.startsWith('idag')||route.startsWith('kanal.html'))await expect(page.locator('.episode').first()).toBeVisible();
  await page.addScriptTag({content:axe.source});const violations=await page.evaluate(async()=>{const result=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return result.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)}));});
  expect(violations,route+' '+colorScheme).toEqual([]);
 }
});
test('keyboard playback and expansion are independent accessible controls',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/idag.html');await expect(page.locator('.home-episodes .episode').first()).toBeVisible();
 await expect(page.locator('summary button')).toHaveCount(0);const row=page.locator('.home-episodes .episode-shell').first();await row.locator('.direct-play').press('Enter');await expect.poll(()=>page.locator('#audio').evaluate(a=>a.currentTime)).toBeGreaterThan(0);await expect(row.locator('details')).not.toHaveAttribute('open','');
 const source=await page.locator('#audio').getAttribute('src');await row.locator('summary').press('Enter');await expect(row.locator('details')).toHaveAttribute('open','');await expect(row.locator('.episode-body')).toHaveCSS('animation-name','none');await expect(page.locator('#audio')).toHaveAttribute('src',source);await expect(page.locator('#audio')).toHaveJSProperty('paused',false);await page.locator('#play-pause').click();
});
