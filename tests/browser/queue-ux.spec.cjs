const {test,expect}=require('@playwright/test');
const channelCount=async page=>(await(await page.request.get('catalog/manifest.json')).json()).channels.length;
test.use({serviceWorkers:'block'});
// Short PCM fixture verifies real media transitions without fetching production audio.
function wav(){const n=8000*20,b=Buffer.alloc(44+n*2);b.write('RIFF');b.writeUInt32LE(36+n*2,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(8000,24);b.writeUInt32LE(16000,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(n*2,40);return b;}
const rows=Array.from({length:50},(_,i)=>({id:'e'+i,channel:i%2?'vald':'ibat',title:'Avsnitt '+i,date:'2026-10-20',published_at:new Date(Date.UTC(2026,9,20,10)-i*1000).toISOString(),audio:'episodes/fixture/e'+i+'.wav',duration_seconds:20,tags:['Testämne'],type:'episodes'}));
async function fixture(page){
 const loaded=[];const collections={episodes:{count:50,pages:[0,1,2].map(n=>'catalog/lists/episodes/'+n+'.json')},'episodes/channel/ibat':{count:25,pages:[0,1].map(n=>'catalog/lists/episodes/channel/ibat/'+n+'.json')}};
 await page.route('**/catalog/manifest.json',r=>r.fulfill({json:{channels:[{id:'ibat',name:'IBAT - Informationsförsörjning'},{id:'vald',name:'Våld'}],topics:[],search_buckets:[],collections}}));
 await page.route('**/catalog/lists/**',r=>{const path=new URL(r.request().url()).pathname;loaded.push(path);const n=Number(path.split('/').pop().replace('.json',''));r.fulfill({json:{items:(path.includes('/channel/')?rows.filter(x=>x.channel==='ibat'):rows).slice(n*24,n*24+24)}});});
 await page.route('**/episodes/fixture/*.wav',r=>{const body=wav(),range=r.request().headers().range,match=range?.match(/bytes=(\d+)-(\d*)/);if(match){const start=Number(match[1]),end=match[2]?Math.min(Number(match[2]),body.length-1):body.length-1;return r.fulfill({status:206,contentType:'audio/wav',headers:{'Accept-Ranges':'bytes','Content-Range':'bytes '+start+'-'+end+'/'+body.length},body:body.subarray(start,end+1)});}return r.fulfill({contentType:'audio/wav',headers:{'Accept-Ranges':'bytes'},body});});
 await page.route('**/catalog/episodes/*.json',r=>r.fulfill({json:{...rows[0],description:'Testbeskrivning',articles:[]}}));
 return loaded;
}
test('context, edits, single audio, navigation and local resume',async({page},info)=>{
 const loaded=await fixture(page);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/lyssna.html');await expect(page.locator('.episode')).toHaveCount(24);expect(loaded).toHaveLength(1);
 await page.locator('[data-play="e0"]').click();await expect.poll(()=>page.locator('#audio').evaluate(a=>a.currentTime)).toBeGreaterThan(0);await page.locator('#play-pause').click();
 await page.locator('#queue-toggle').click();await expect(page.locator('.queue-title').first()).toContainText('Avsnitt 1');await page.waitForLoadState('networkidle');await page.screenshot({path:'docs/evidence/'+info.project.name+'-queue.png',scale:'css'});await page.getByRole('button',{name:'Flytta ned Avsnitt 1',exact:true}).click();await expect(page.locator('.queue-title').first()).toContainText('Avsnitt 2');await page.getByRole('button',{name:'Ta bort Avsnitt 2',exact:true}).click();await expect(page.locator('.queue-title').first()).toContainText('Avsnitt 1');
 await page.getByRole('button',{name:'Stäng kön'}).click();const src=await page.locator('#audio').getAttribute('src');
 await page.getByRole('link',{name:'Kanaler',exact:true}).click();await expect(page.locator('#audio')).toHaveAttribute('src',src);await expect(page.locator('audio')).toHaveCount(1);
 await page.locator('.channel-card').filter({hasText:'IBAT'}).click();await page.locator('[data-play="e0"]').click();await page.locator('#play-pause').click();await page.locator('#queue-toggle').click();await expect(page.locator('.queue-title').first()).toContainText('Avsnitt 2');await expect(page.locator('.queue-panel')).not.toContainText('Avsnitt 1Våld');
 await page.getByRole('button',{name:'Stäng kön'}).click();await page.evaluate(()=>{const a=document.querySelector('#audio');a.currentTime=1;});await expect.poll(()=>page.locator('#audio').evaluate(a=>a.currentTime)).toBeGreaterThanOrEqual(0.9);await expect(page.locator('#audio')).toHaveJSProperty('seeking',false);
 await page.reload();await expect(page.locator('#player')).toBeVisible();await expect(page.locator('#audio')).toHaveJSProperty('paused',true);await expect.poll(()=>page.locator('#audio').evaluate(a=>a.currentTime)).toBeGreaterThanOrEqual(0.9);
 await page.locator('#queue-toggle').click();await expect(page.locator('.queue-title').first()).toContainText('Avsnitt 2');expect(errors).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});
test('natural ended advances once, final item stops, unavailable audio does not loop',async({page})=>{
 await fixture(page);await page.goto('/lyssna.html');await page.locator('[data-play="e0"]').click();await expect.poll(()=>page.locator('#audio').evaluate(a=>a.currentTime)).toBeGreaterThan(0);await page.locator('#audio').evaluate(a=>{a.currentTime=a.duration-0.35;});
 await expect.poll(()=>page.locator('#audio').getAttribute('src'),{timeout:8000}).toContain('e1.wav');await page.locator('#play-pause').click();
 await page.locator('#queue-toggle').click();await page.getByRole('button',{name:'Töm kommande kö'}).click();await page.getByRole('button',{name:'Stäng kön'}).click();await page.locator('#play-pause').click();await expect.poll(()=>page.locator('#audio').evaluate(a=>a.currentTime)).toBeGreaterThan(0);await page.locator('#audio').evaluate(a=>{a.currentTime=a.duration-0.35;});await expect.poll(()=>page.locator('#player-status').textContent(),{timeout:8000}).toContain('avslutad');await expect(page.locator('#audio')).toHaveJSProperty('paused',true);
 await page.route('**/episodes/fixture/e0.wav',r=>r.fulfill({status:404}));await page.locator('[data-play="e0"]').click();await expect(page.locator('#player-status')).toContainText('kunde inte spelas');await expect(page.locator('#audio')).toHaveAttribute('src','episodes/fixture/e0.wav');
 await page.locator('#queue-toggle').click();await expect(page.locator('.queue-title').first()).toContainText('Avsnitt 1');await page.getByRole('button',{name:'Stäng kön'}).click();await page.unroute('**/episodes/fixture/e0.wav');await page.locator('#play-pause').click();await expect.poll(()=>page.locator('#audio').evaluate(a=>a.currentTime)).toBeGreaterThan(0);
});
test('queue continues beyond loaded page and autoplay block offers manual play',async({page})=>{
 const loaded=await fixture(page);await page.goto('/lyssna.html');await page.locator('[data-play="e23"]').click();await page.locator('#play-pause').click();expect(loaded).toHaveLength(1);
 await page.evaluate(()=>{HTMLMediaElement.prototype.play=function(){return Promise.reject(new DOMException('blocked','NotAllowedError'));};});
 // Compact mobile keeps transport minimal; expand to reach previous/next.
 if(await page.locator('#queue-next').isVisible()===false)await page.locator('#player-toggle').click();
 await page.locator('#queue-next').click();await expect(page.locator('#audio')).toHaveAttribute('src','episodes/fixture/e24.wav');await expect(page.locator('#player-status')).toContainText('Tryck på Spela');expect(loaded.filter(x=>x.endsWith('/1.json'))).toHaveLength(1);await expect(page.locator('#queue-previous')).toBeEnabled();
});
test('approved UX keeps titles, two mobile columns, categories off cards and article audio early',async({page},info)=>{
 await page.goto('/kanaler.html');await expect(page.locator('.channel-card').first().locator('small')).toHaveCount(0);await expect(page.locator('.channel-card')).toHaveCount(await channelCount(page));expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 if(info.project.name.includes('iphone'))await expect(page.locator('.channel-directory')).toHaveCSS('grid-template-columns',/\d+(\.\d+)?px \d+(\.\d+)?px$/);
 await page.goto('/idag.html');await expect(page.locator('.home-channels .search-channel-description')).toHaveCount(0);await expect(page.locator('.home-episodes .row-title strong').first()).toBeVisible();await expect(page.locator('.home-episodes .item-meta').first()).toBeVisible();
 await page.getByRole('link',{name:'Artiklar',exact:true}).click();await page.locator('.article-card').first().click();await expect(page.locator('.article-audio')).toBeVisible();await expect(page.getByText('Illustrativ kanalbild',{exact:true})).toBeVisible();await expect(page.locator('#nav a[aria-current]')).toHaveText('Artiklar');
 await page.screenshot({path:'docs/evidence/'+info.project.name+'-ux-article.png'});
});
test('search playback follows the current result order and type filter',async({page})=>{
 await fixture(page);const crypto=require('node:crypto'),bucket=crypto.createHash('sha256').update('testord').digest('hex').slice(0,2);
 await page.route('**/catalog/manifest.json',r=>r.fulfill({json:{channels:[{id:'ibat',name:'IBAT - Informationsförsörjning'},{id:'vald',name:'Våld'}],topics:[],search_buckets:[bucket,crypto.createHash('sha256').update('annatord').digest('hex').slice(0,2)],collections:{}}}));
 await page.route('**/catalog/search/*.json',r=>r.fulfill({json:{testord:[rows[8],rows[2],rows[5]],annatord:[rows[8],rows[2]]}}));
 await page.goto('/utforska.html');await page.getByRole('searchbox').fill('testord');await page.getByRole('button',{name:'Sök',exact:true}).click();await page.getByRole('button',{name:'Avsnitt',exact:true}).click();await expect(page.locator('.episode')).toHaveCount(3);await expect(page.locator('.episode').first()).toHaveAttribute('data-id','e2');
 await page.locator('[data-play="e2"]').click();await page.locator('#play-pause').click();await page.locator('#queue-toggle').click();await expect(page.locator('.queue-title')).toHaveCount(2);await expect(page.locator('.queue-title').first()).toContainText('Avsnitt 5');await expect(page.locator('.queue-title').last()).toContainText('Avsnitt 8');await page.getByRole('button',{name:'Stäng kön'}).click();await page.locator('#play-pause').click();await page.getByRole('searchbox').fill('annatord');await page.getByRole('button',{name:'Sök',exact:true}).click();await expect(page.locator('.episode')).toHaveCount(2);await page.locator('[data-play="e2"]').click();await expect(page.locator('#audio')).toHaveJSProperty('paused',false);await page.locator('#queue-toggle').click();await expect(page.locator('.queue-title')).toHaveCount(1);await expect(page.locator('.queue-title')).toContainText('Avsnitt 8');
});
test('empty exact-word search offers a bounded clickable complete-word suggestion',async({page})=>{
 await fixture(page);const hash=x=>require('node:crypto').createHash('sha256').update(x).digest('hex').slice(0,2);
 await page.route('**/catalog/manifest.json',r=>r.fulfill({json:{channels:[{id:'ibat',name:'IBAT - Informationsförsörjning'}],topics:[],search_buckets:[hash('fastighet'),hash('fastighetsstopp')],collections:{}}}));
 await page.route('**/search-hints.json',r=>r.fulfill({json:{fastighet:['fastighetsstopp']}}));
 await page.route('**/catalog/search/*.json',r=>r.fulfill({json:{fastighetsstopp:[rows[4]]}}));
 await page.goto('/utforska.html');await page.getByRole('searchbox').fill('fastighet');await page.getByRole('button',{name:'Sök',exact:true}).click();await page.getByRole('button',{name:'fastighetsstopp',exact:true}).click();await expect(page.locator('.episode')).toHaveCount(1);await expect(page.locator('.episode')).toHaveAttribute('data-id','e4');
});
