const {test,expect}=require('@playwright/test');
test.use({serviceWorkers:'block'});
const registry=(n,type)=>Array.from({length:n},(_,i)=>({id:type+i,name:(type==='monitoring'?'Bevakning ':'Kunskap ')+i,description:'Testkanal',channel_type:type,display_order:i}));
for(const n of [0,1,4,5,10])test('registry groups handle '+n+' channels each, growth and shared URL state',async({page})=>{
 const channels=[...registry(n,'monitoring'),...registry(n,'knowledge')].reverse();
 await page.context().route('**/catalog/manifest.json',r=>r.fulfill({json:{channels,collections:{},topics:[],search_buckets:[]}}));
 await page.goto('/idag.html');
 for(const type of ['monitoring','knowledge']){
  const group=page.locator('.channel-group[data-group='+type+']');await expect(group.locator('.channel-card')).toHaveCount(Math.min(n,4));
  expect(await group.locator('.channel-card').evaluateAll(nodes=>nodes.map(n=>new URL(n.href).searchParams.get('id')))).toEqual(Array.from({length:Math.min(n,4)},(_,i)=>type+i));
  await expect(group.locator('.group-all')).toHaveCount(n>4?1:0);
 }
 if(n>4){await page.getByRole('link',{name:'Visa alla kunskapskanaler',exact:true}).click();await expect(page).toHaveURL(/group=knowledge/);await expect(page.locator('.channel-card')).toHaveCount(n);await expect(page.locator('.channel-group')).toHaveCount(1);
  await page.reload();await expect(page.locator('.channel-card')).toHaveCount(n);await page.getByRole('link',{name:'Alla',exact:true}).click();await expect(page.locator('.channel-card')).toHaveCount(n*2);await page.goBack();await expect(page.locator('.channel-card')).toHaveCount(n);await expect(page).toHaveURL(/group=knowledge/);
  const href=page.url(),shared=await page.context().newPage();await shared.goto(href);await expect(shared.locator('.channel-card')).toHaveCount(n);await shared.close();
 }
});
test('monitoring grid and descriptive knowledge lists preserve desktop parity, large text and keyboard',async({page},info)=>{
 for(const width of [320,393,768,1450]){
  await page.setViewportSize({width,height:1000});await page.goto('/idag.html');await expect(page.locator('.home-channel-groups .channel-card')).toHaveCount(8);
  const groups=await page.locator('.home-channel-groups .channel-group').evaluateAll(nodes=>nodes.map(n=>{const b=n.getBoundingClientRect();return {x:b.x,y:b.y,width:b.width};}));
  expect(await page.locator('.home-channels').first().evaluate(n=>getComputedStyle(n).gridTemplateColumns.split(' ').length)).toBe(2);
  expect(await page.locator('[data-group=knowledge] .descriptive-channels').evaluate(n=>getComputedStyle(n).gridTemplateColumns.split(' ').length)).toBe(1);
  if(width===1450){expect(groups[0].y).toBe(groups[1].y);expect(groups[0].width).toBeCloseTo(groups[1].width,0);}else expect(groups[1].y).toBeGreaterThan(groups[0].y);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 await page.setViewportSize({width:320,height:1000});await page.evaluate(()=>document.documentElement.style.fontSize='200%');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.locator('[data-group=knowledge] .channel-card').first().focus();await page.keyboard.press('Enter');await expect(page.locator('.channel-hero')).toBeVisible();
 await page.goto('/idag.html');await page.screenshot({path:'docs/evidence/'+info.project.name+'-groups-28.png',fullPage:true});
});
test('numbered approved title is identical in archive, detail, saved queue, player and search',async({page})=>{
 const manifest=await(await page.request.get('/catalog/manifest.json')).json();const data=await(await page.request.get('/'+manifest.collections['episodes/ordinary/channel/ibat'].pages[0])).json();const row=data.items.find(x=>!manifest.superseded[x.id]);
 expect(row.title).toMatch(/^Avsnitt \d+: .+/);expect(row.title).not.toMatch(/V\.\d/);
 await page.goto('/kanal.html?id=ibat');await expect(page.locator('[data-id="'+row.id+'"] .row-title strong')).toHaveText(row.title);
 await page.goto('/avsnitt.html?id='+encodeURIComponent(row.id));await expect(page.locator('.full-player h2')).toHaveText(row.title);await page.locator('#big-play').click();await expect(page.locator('#player-title')).toHaveText(row.title);
 await page.locator('#big-play').click();await page.evaluate(()=>{const state=JSON.parse(localStorage.getItem('morgonpod-playback'));for(const item of state.items)item.title='Onsdag V.43';localStorage.setItem('morgonpod-playback',JSON.stringify(state));});await page.reload();await expect(page.locator('#player-title')).toHaveText(row.title);
 await page.goto('/utforska.html');await page.getByRole('searchbox').fill(row.content_headline.split(' ')[0]);await page.getByRole('button',{name:'Sök',exact:true}).click();await expect(page.locator('[data-id="'+row.id+'"] .row-title strong')).toHaveText(row.title);
});

test('Mediesvepet leads monitoring presentation and other channel preferences survive',async({page},info)=>{
 const monitoring=['mediesvepet','ibat','vald','sjoomradet','kek'];
 const catalog=await(await page.request.get('/catalog/manifest.json')).json();
 const knowledge=catalog.channels.filter(c=>c.channel_type==='knowledge').sort((a,b)=>a.display_order-b.display_order||a.id.localeCompare(b.id)).map(c=>c.id);
 await page.addInitScript(()=>{localStorage.setItem('morgonpod-theme','dark');localStorage.setItem('order-preservation-probe','keep');});
 for(const width of [320,1450]){
  await page.setViewportSize({width,height:1000});
  for(const route of ['/kanaler.html','/idag.html']){
   await page.goto(route);const home=route==='/idag.html';
   await expect(page.locator('[data-group=monitoring] .channel-card')).toHaveCount(home?4:5);
   const ids=group=>page.locator('[data-group='+group+'] .channel-card').evaluateAll(nodes=>nodes.map(n=>new URL(n.href).searchParams.get('id')));
   expect(await ids('monitoring')).toEqual(home?monitoring.slice(0,4):monitoring);
   await page.screenshot({path:'docs/evidence/'+info.project.name+'-media-order-'+(home?'home':'directory')+'-'+width+'.png',fullPage:true});
   expect(await ids('knowledge')).toEqual(home?knowledge.slice(0,4):knowledge);
   expect(await page.evaluate(()=>[localStorage.getItem('morgonpod-theme'),localStorage.getItem('order-preservation-probe')])).toEqual(['dark','keep']);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
 }
});
