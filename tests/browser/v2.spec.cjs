const {test,expect}=require('@playwright/test');
async function capture(page,path){await page.waitForLoadState('networkidle');await page.evaluate(()=>window.scrollTo(0,0));await expect.poll(()=>page.locator('img.cover').evaluateAll(images=>images.filter(im=>{const r=im.getBoundingClientRect();return r.top<innerHeight&&r.bottom>0;}).every(im=>im.complete&&im.naturalWidth>0))).toBe(true);await page.locator('img.cover').evaluateAll(async images=>{await Promise.all(images.filter(im=>{const r=im.getBoundingClientRect();return r.top<innerHeight&&r.bottom>0;}).map(im=>im.decode()));});await page.screenshot({path,scale:'css'});}
test('V2 channel identity, tabs and all appearance modes',async({page},info)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/kanaler.html');await expect(page.locator('.channel-card')).toHaveCount(5);await expect(page.getByRole('heading',{name:'Kanaler',exact:true})).toBeVisible();
 await page.getByRole('searchbox').fill('IBAT');await expect(page.locator('.channel-card')).toHaveCount(1);await page.locator('.channel-card').click();
 await expect(page.getByRole('heading',{name:'IBAT - Informationsförsörjning',exact:true})).toBeVisible();
 await page.getByRole('link',{name:'Om kanalen',exact:true}).click();await expect(page.getByRole('heading',{name:'Vad bevakas?'})).toBeVisible();
 await page.getByRole('link',{name:'Avsnitt',exact:true}).click();await page.locator('#archive-sort').selectOption('oldest');await expect(page.locator('.episode').first()).toContainText('Avsnitt 1 / Uppstart');
 await page.getByRole('link',{name:'Mer',exact:true}).click();await page.getByLabel('Mörkt läge',{exact:true}).check();await expect(page.locator('html')).toHaveAttribute('data-theme','dark');await page.screenshot({path:'docs/evidence/'+info.project.name+'-appearance-dark.png'});
 await page.reload();await expect(page.getByLabel('Mörkt läge',{exact:true})).toBeChecked();await page.getByRole('link',{name:'Kanaler',exact:true}).click();await page.locator('.channel-card').filter({hasText:'Sjöområdet'}).click();await expect(page.locator('.channel-hero')).toBeVisible();await capture(page,'docs/evidence/'+info.project.name+'-channel-dark.png');await page.getByRole('link',{name:'Mer',exact:true}).click();await page.getByLabel('Ljust läge',{exact:true}).check();await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await page.getByLabel('Följ systemet',{exact:true}).check();await page.emulateMedia({colorScheme:'dark'});await expect(page.locator('body')).toHaveCSS('background-color','rgb(7, 23, 32)');
 expect(errors).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});
test('V2 six flows, real audio and responsive visual evidence',async({page},info)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/idag.html');await expect(page.locator('.hero')).toBeVisible();
 await capture(page,'docs/evidence/'+info.project.name+'-today.png');
 await page.getByRole('link',{name:'Kanaler',exact:true}).click();await expect(page.locator('.channel-card')).toHaveCount(5);await capture(page,'docs/evidence/'+info.project.name+'-channels.png');
 await page.locator('.channel-card').filter({hasText:'Sjöområdet'}).click();await expect(page.getByRole('heading',{name:'Sjöområdet',exact:true})).toBeVisible();await capture(page,'docs/evidence/'+info.project.name+'-channel-light.png');
 await page.locator('summary').first().click();await page.getByRole('link',{name:/Öppna stor spelare/}).click();await expect(page.locator('#big-play')).toBeVisible();await page.locator('#big-play').click();
 await expect(page.locator('#player')).toHaveJSProperty('hidden',false);await expect.poll(()=>page.locator('#audio').evaluate(e=>e.currentTime)).toBeGreaterThan(0).catch(async error=>{console.log('MEDIA_DIAG',await page.locator('#audio').evaluate(a=>({src:a.currentSrc,error:a.error&&{code:a.error.code,message:a.error.message},ready:a.readyState,network:a.networkState,paused:a.paused,duration:a.duration})));throw error;});const src=await page.locator('#audio').getAttribute('src');
 await page.getByRole('button',{name:'Ändra hastighet'}).click();await expect(page.locator('#big-speed')).toHaveText('1.25×');await expect(page.locator('#audio')).toHaveJSProperty('playbackRate',1.25);
 await capture(page,'docs/evidence/'+info.project.name+'-player.png');
 await page.getByRole('link',{name:'Artiklar',exact:true}).click();await expect(page.locator('#audio')).toHaveAttribute('src',src);await page.locator('.article-card').first().click();await expect(page.locator('.reading h1')).toBeVisible();await expect(page.locator('.reading-cover')).toBeVisible();await capture(page,'docs/evidence/'+info.project.name+'-article.png');
 await page.locator('#nav').getByRole('link',{name:'Sök',exact:true}).click();await page.getByRole('searchbox').fill('IBAT');await page.getByRole('button',{name:'Sök',exact:true}).click();await page.getByRole('button',{name:'Kanaler',exact:true}).click();await expect(page.locator('#results .channel-card')).toHaveCount(1);
 await capture(page,'docs/evidence/'+info.project.name+'-search.png');expect(errors).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});

