// Read-only checks of the deployed Pages site. No production or Telegram writes.
const {test,expect}=require('@playwright/test');
test('published six flows, themes, real audio and canonical channel identity',async({page},info)=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('idag.html');await expect(page.locator('.hero')).toBeVisible();
 await expect(page.locator('script[src*="app.js"]')).toHaveAttribute('src',/v2-queue-ux1/);
 await page.getByRole('link',{name:'Kanaler',exact:true}).click();await expect(page.locator('.channel-card')).toHaveCount(5);
 await page.locator('.channel-card').filter({hasText:'IBAT'}).click();await expect(page.getByRole('heading',{name:'IBAT - Informationsförsörjning',exact:true})).toBeVisible();
 await page.locator('#archive-sort').selectOption('oldest');await expect(page.locator('.episode').first()).toContainText('Avsnitt 1 / Uppstart');
 await page.locator('summary').first().click();await page.getByRole('link',{name:/Öppna stor spelare/}).click();await page.locator('#big-play').click();
 await expect.poll(()=>page.locator('#audio').evaluate(e=>e.currentTime)).toBeGreaterThan(0);const source=await page.locator('#audio').getAttribute('src');
 await page.getByRole('button',{name:'Ändra hastighet'}).click();await expect(page.locator('#audio')).toHaveJSProperty('playbackRate',1.25);
 await page.getByRole('link',{name:'Artiklar',exact:true}).click();await page.locator('.article-card').first().click();await expect(page.locator('.reading h1')).toBeVisible();
 await expect(page.locator('#audio')).toHaveAttribute('src',source);await expect(page.locator('.reading a[target="_blank"]').first()).toBeVisible();
 await page.locator('#nav').getByRole('link',{name:'Sök',exact:true}).click();await page.getByRole('searchbox').fill('IBAT');await page.getByRole('button',{name:'Sök',exact:true}).click();await page.getByRole('button',{name:'Kanaler',exact:true}).click();await expect(page.locator('#results .channel-card')).toHaveCount(1);
 await page.getByRole('link',{name:'Mer',exact:true}).click();await page.getByLabel('Mörkt läge',{exact:true}).check();await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await page.getByLabel('Ljust läge',{exact:true}).check();await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await page.getByLabel('Följ systemet',{exact:true}).check();await page.emulateMedia({colorScheme:'dark'});await expect(page.locator('body')).toHaveCSS('background-color','rgb(7, 23, 32)');
 await page.reload();await expect(page.getByLabel('Följ systemet',{exact:true})).toBeChecked();
 expect(errors).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 await page.screenshot({path:'playwright-report/'+info.project.name+'-published.png'});
});

