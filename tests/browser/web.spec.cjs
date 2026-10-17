const {test,expect}=require('@playwright/test');
test('navigation, expandable episodes, bounded requests and persistent player',async({page})=>{
 const requests=[];page.on('request',r=>requests.push(r.url()));
 await page.goto('/idag.html');await expect(page.getByRole('heading',{name:'Senaste poddavsnitten'})).toBeVisible();
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
test('large archive loads one page, then the next page without full archive fetch',async({page})=>{
 const channels=Array.from({length:30},(_,i)=>({id:'c'+i,name:'Testkanal '+i}));
 const manifest={channels,topics:[],search_buckets:[],collections:{episodes:{count:6000,pages:Array.from({length:250},(_,i)=>'catalog/lists/episodes/'+i+'.json')},articles:{count:24000,pages:Array.from({length:1000},(_,i)=>'catalog/lists/articles/'+i+'.json')}}};
 const loaded=[];
 await page.route('**/catalog/manifest.json',r=>r.fulfill({json:manifest}));
 await page.route('**/catalog/lists/**',r=>{loaded.push(r.request().url());const article=r.request().url().includes('/articles/');const n=Number(r.request().url().split('/').pop().replace('.json',''));r.fulfill({json:{items:Array.from({length:24},(_,i)=>({id:'synthetic-'+(n*24+i),channel:'c'+i%30,date:'2026-10-17',title:'Syntetiskt test '+(n*24+i),summary:'Endast testdata',duration_seconds:600}))}});});
 await page.goto('/lyssna.html');await expect(page.locator('summary')).toHaveCount(24);await expect(page.locator('option')).toHaveCount(31);expect(loaded.length).toBe(1);
 await page.getByRole('button',{name:'Visa fler',exact:true}).click();await expect(page.locator('summary')).toHaveCount(48);expect(loaded.length).toBe(2);
 await page.getByRole('link',{name:'Artiklar',exact:true}).click();await expect(page.locator('.article-card')).toHaveCount(24);expect(loaded.length).toBe(3);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});
test('article detail keeps sources, assessment and open questions separate',async({page})=>{
 await page.route('**/catalog/articles/*.json',r=>r.fulfill({json:{id:'test-only',channel:'kek',date:'2026-10-17',title:'Syntetisk testartikel',summary:'Enbart testunderlag',body:'Första stycket.\nAndra stycket.',assessment:'Syntetisk bedömning',open_questions:['Syntetisk fråga?'],sources:[{url:'https://example.org/source',title:'Testkälla'}],episode_id:'e',episode_title:'Testavsnitt',topic_labels:['Test'],previous_reporting:[]}}));
 await page.goto('/artikel.html?id=test-only');await expect(page.getByRole('heading',{name:'Syntetisk testartikel'})).toBeVisible();await expect(page.getByRole('heading',{name:'Öppna frågor'})).toBeVisible();await expect(page.getByRole('link',{name:'Testkälla'})).toHaveAttribute('href','https://example.org/source');await expect(page.locator('.prose p')).toHaveCount(2);
});

test('homepage picks one latest episode per channel and can expand',async({page})=>{
 const channels=Array.from({length:10},(_,i)=>({id:'c'+i,name:'Kanal '+i}));
 const collections={};
 for(let i=0;i<10;i++)collections['episodes/channel/c'+i]={count:3,pages:['catalog/lists/episodes/channel/c'+i+'/0.json']};
 const manifest={channels,topics:[],search_buckets:[],collections};
 await page.route('**/catalog/manifest.json',route=>route.fulfill({json:manifest}));
 await page.route('**/catalog/lists/episodes/channel/**',route=>{
  const i=Number(route.request().url().match(/channel\\/c(\\d+)\\//)[1]);
  route.fulfill({json:{items:[{id:'latest-'+i,channel:'c'+i,date:'2026-10-17',title:'Senast i kanal '+i},{id:'older-'+i,channel:'c'+i,date:'2026-10-16',title:'Äldre'}]}});
 });
 await page.goto('/idag.html');
 await expect(page.locator('details.episode')).toHaveCount(8);
 await expect(page.getByText('Äldre',{exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:/Visa fler kanaler/}).first().click();
 await expect(page.locator('details.episode')).toHaveCount(10);
});
test('player can minimize and restore without stopping audio',async({page})=>{
 await page.goto('/lyssna.html');
 await page.locator('summary').first().click();
 await page.getByRole('button',{name:'Spela avsnittet'}).click();
 await expect(page.locator('#player')).toBeVisible();
 const source=await page.locator('#audio').getAttribute('src');
 await page.locator('#player-toggle').click();
 await expect(page.locator('#player')).toHaveClass(/compact/);
 await expect(page.locator('#audio')).toHaveAttribute('src',source);
 await page.locator('#player-toggle').click();
 await expect(page.locator('#player')).not.toHaveClass(/compact/);
});
