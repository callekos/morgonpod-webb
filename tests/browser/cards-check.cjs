const {expect}=require('@playwright/test');
exports.cardsCheck=async({page},info)=>{
 const manifest=await(await page.request.get('catalog/manifest.json')).json();
 const checkList=async (group,count=4)=>{
  const cards=group.locator('.knowledge-card');await expect(cards).toHaveCount(count);
  const positions=await cards.evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect(),im=n.querySelector('img').getBoundingClientRect(),copy=n.querySelector('div').getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,im:im.width,copyX:copy.x};}));
  for(let i=0;i<positions.length;i++){expect(positions[i].x).toBeCloseTo(positions[0].x,0);expect(positions[i].im).toBeLessThan(positions[i].w/2);if(i)expect(positions[i].y).toBeGreaterThan(positions[i-1].y);}
  for(const card of await cards.all()){await expect(card.locator('h3')).not.toBeEmpty();await expect(card.locator('p')).not.toBeEmpty();await expect(card).toContainText('Öppna kanalen');await expect(card.locator('img')).toHaveCSS('border-bottom-width','0px');await expect(card.locator('h3 .icon')).toHaveCount(0);}
 };
 for(const width of [320,393,768,1450]){
  await page.setViewportSize({width,height:1000});await page.goto('idag.html');await expect(page.locator('[data-group=monitoring] .channel-card')).toHaveCount(4);await expect(page.locator('[data-group=monitoring] .knowledge-card')).toHaveCount(0);
  await expect.poll(()=>page.locator('[data-group=monitoring] .home-channels').evaluate(n=>getComputedStyle(n).gridTemplateColumns.split(' ').length)).toBe(2);
  await checkList(page.locator('[data-group=knowledge]'));await page.locator('#nav').getByRole('link',{name:'Kanaler',exact:true}).click();for(const type of ['monitoring','knowledge'])await checkList(page.locator('[data-group='+type+']'),manifest.channels.filter(c=>c.channel_type===type).length);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);if(width===320||width===1450)await page.screenshot({path:'docs/evidence/'+info.project.name+'-cards-39-'+width+'.png',fullPage:true});
 }
 await page.setViewportSize({width:320,height:1000});await page.evaluate(()=>document.documentElement.style.fontSize='200%');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.locator('[data-group=knowledge] .channel-card').first().focus();await page.keyboard.press('Enter');await expect(page.locator('.channel-hero')).toBeVisible();await page.goBack();await expect(page.locator('.descriptive-channels')).toHaveCount(2);
 await page.screenshot({path:'docs/evidence/'+info.project.name+'-cards-39.png',fullPage:true});
};

