const {test,expect}=require('@playwright/test');
const channelCount=async page=>(await(await page.request.get('catalog/manifest.json')).json()).channels.length;
test.use({serviceWorkers:'block'});
test('producer history is paginated independently and intro stays first',async({page})=>{
 const rows=Array.from({length:49},(_,i)=>({id:'daily-'+i,channel:'ibat',date:'2026-10-'+String(i%20+1).padStart(2,'0'),title:'Historiskt avsnitt '+i,episode_order:20261000+i}));
 rows.unshift({id:'intro',channel:'ibat',title:'Uppstartsavsnitt',is_intro:true,episode_order:1,date:'2026-10-19',published_at:'2026-10-19T23:00:00+02:00'});
 const paths=[0,1,2].map(i=>'catalog/lists/episodes/history/channel/ibat/'+i+'.json'),loaded=[];
 const manifest={channels:[{id:'ibat',name:'IBAT - Informationsförsörjning',channel_type:'monitoring',display_order:0}],topics:[],search_buckets:[],collections:{'episodes/channel/ibat':{count:50,pages:['catalog/lists/episodes/channel/ibat/0.json']},'episodes/history/channel/ibat':{count:50,pages:paths}}};
 await page.route('**/catalog/manifest.json',r=>r.fulfill({json:manifest}));
 await page.route('**/catalog/lists/**',r=>{const path=new URL(r.request().url()).pathname.slice(1);loaded.push(path);const n=paths.indexOf(path);return r.fulfill({json:{items:n<0?[rows[49]]:rows.slice(n*24,n*24+24)}});});
 await page.goto('/kanal.html?id=ibat&sort=oldest');await expect(page.locator('.episode')).toHaveCount(24);await expect(page.locator('.episode').first()).toHaveAttribute('data-id','intro');
 await expect(page.locator('.episode').first().locator('time')).toHaveAttribute('datetime','2026-10-19T23:00:00+02:00');
 expect(loaded).toEqual([paths[0]]);
 await page.getByRole('button',{name:'Visa fler',exact:true}).click();await expect(page.locator('.episode')).toHaveCount(48);
 await page.getByRole('button',{name:'Visa fler',exact:true}).click();await expect(page.locator('.episode')).toHaveCount(50);await expect(page.getByRole('button',{name:'Visa fler',exact:true})).toBeHidden();expect(loaded).toEqual(paths);
 await page.locator('#archive-sort').selectOption('latest');await expect(page.locator('.episode').first()).toHaveAttribute('data-id','daily-48');
});
test('homepage finds newest publication across 20 producer channels without latest hints',async({page})=>{
 const channels=Array.from({length:20},(_,i)=>({id:'c'+i,name:'Kanal '+i})),collections={},loaded=[];
 channels.forEach(c=>collections['episodes/channel/'+c.id]={count:200,pages:Array.from({length:9},(_,i)=>'catalog/lists/episodes/channel/'+c.id+'/'+i+'.json')});
 await page.route('**/catalog/manifest.json',r=>r.fulfill({json:{channels,collections,topics:[],search_buckets:[]}}));
 await page.route('**/catalog/lists/**',r=>{loaded.push(r.request().url());const n=Number(r.request().url().match(/channel\/c(\d+)\//)[1]);r.fulfill({json:{items:[{id:'latest-'+n,channel:'c'+n,date:'2026-10-01',published_at:new Date(Date.UTC(2026,9,20,7,n)).toISOString(),title:'Ny publicering '+n}]}});});
 await page.goto('/idag.html');await expect(page.locator('.home-episodes .episode')).toHaveCount(6);await expect(page.locator('.home-episodes .episode').first()).toContainText('Kanal 19');
 expect(loaded).toHaveLength(20);expect(loaded.every(url=>url.endsWith('/0.json'))).toBeTruthy();
 for(let i=0;i<3;i++)await page.getByRole('button',{name:/Visa fler kanaler/}).click();await expect(page.locator('.episode')).toHaveCount(20);
 expect(await page.locator('.episode').evaluateAll(nodes=>nodes.map(n=>n.dataset.id))).toEqual(Array.from({length:20},(_,i)=>'latest-'+(19-i)));expect(loaded).toHaveLength(20);
});
test('tablet and intermediate widths keep navigation and archives reachable',async({page})=>{
 for(const width of [650,820,1024]){
  await page.setViewportSize({width,height:900});await page.goto('/kanaler.html');await expect(page.locator('.channel-card')).toHaveCount(await channelCount(page));
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  await page.locator('.channel-card').filter({hasText:'Sjöområdet'}).click();await expect(page.locator('#archive-sort')).toBeVisible();await expect(page.locator('.episode').first()).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 }
});

