const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {apply}=require('../scripts/apply-catalog-policy.cjs'),Core=require('../app.js'),{Queue}=require('../playback-queue.js');
const policy=require('../catalog-policy.json');
test('release policy is exact, idempotent, retains future arrivals and source media',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'catalog-policy-'));
 const write=(p,x)=>{fs.mkdirSync(path.dirname(path.join(root,p)),{recursive:true});fs.writeFileSync(path.join(root,p),JSON.stringify(x));};
 const pairs=Object.entries(policy.superseded),old=pairs.map(([id])=>({id})),replacement=pairs.map(([,id])=>({id})),fresh={id:'ibat:2026-10-21:daily'},special={id:'WORK_SPECIALS_2026_10_21:sjoomradet:1'};
 const rows=[...old,...replacement,fresh,special];
 write('catalog-policy.json',policy);write('episodes.json',{episodes:rows});write('catalog/lists/episodes/0.json',{items:rows});write('catalog/lists/articles/0.json',{items:rows.map(e=>({id:'article-'+e.id,episode_id:e.id}))});
 write('catalog/manifest.json',{page_size:24,collections:{episodes:{count:12,pages:['catalog/lists/episodes/0.json']},articles:{count:12,pages:['catalog/lists/articles/0.json']}},channels:[]});
 write('catalog/search/aa.json',{test:rows.map(e=>({...e,type:'episodes'}))});fs.mkdirSync(path.join(root,'catalog/episodes'));fs.mkdirSync(path.join(root,'catalog/articles'));write('episodes/audio.mp3',{original:true});
 const before=fs.readFileSync(path.join(root,'episodes/audio.mp3'));let m=apply(root);assert.equal(m.collections.episodes.count,7);assert.equal(m.collections.articles.count,7);assert.equal(Object.keys(m.superseded).length,5);assert.deepEqual(fs.readFileSync(path.join(root,'episodes/audio.mp3')),before);
 assert.equal(JSON.parse(fs.readFileSync(path.join(root,'episodes.json'))).episodes.length,12);assert.equal(JSON.parse(fs.readFileSync(path.join(root,'catalog/search/aa.json'))).test.length,7);
 assert.deepEqual(apply(root),m);const visible=JSON.parse(fs.readFileSync(path.join(root,'catalog/lists/episodes/0.json'))).items;assert.ok(visible.some(e=>e.id===fresh.id));assert.ok(visible.some(e=>e.id===special.id));
 // Rollback restores original active projection from retained source records.
 write('catalog-policy.json',{...policy,superseded:{}});write('catalog/lists/episodes/0.json',{items:rows});m=apply(root);assert.equal(m.collections.episodes.count,12);fs.rmSync(root,{recursive:true});
});
test('missing replacement never hides original',()=>{
 const ids=new Set(['ibat:2026-10-20:daily']);const active=Object.fromEntries(Object.entries(policy.superseded).filter(([,replacement])=>ids.has(replacement)));assert.deepEqual(active,{});
});
test('saved queue with retired current item is rejected and new queues omit retired rows',()=>{
 const old=Queue.accept;Queue.accept=e=>!policy.superseded[e.id];const q=new Queue();const retired=Object.keys(policy.superseded)[0];
 q.start([{id:retired},{id:'ibat:2026-10-21:daily'}],'ibat:2026-10-21:daily');assert.equal(q.items.length,1);
 assert.equal(q.restore({schema:1,items:[{id:retired}],index:0,source:null}),false);Queue.accept=old;
});
test('same publication time uses editorial channel order and keeps intro first only in history',()=>{
 const stamp='2026-10-20T20:49:08Z',rows=[{id:'intro',channel:'ibat',is_intro:true,episode_order:1,published_at:stamp},{id:'special3',channel:'ibat',episode_order:3,published_at:stamp},{id:'special2',channel:'ibat',episode_order:2,published_at:stamp},{id:'sjo',channel:'sjoomradet',published_at:stamp}];
 assert.deepEqual([...rows].sort(Core.compareLatest).map(e=>e.id),['special3','special2','sjo','intro']);assert.equal([...rows].sort(Core.compareHistory)[0].id,'intro');assert.equal(rows[0].published_at,stamp);
});
