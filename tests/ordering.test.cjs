const test=require('node:test'),assert=require('node:assert/strict'),Core=require('../app.js');
test('latest uses actual publication instant, not editorial date or intro priority',()=>{
 const rows=[{id:'a',date:'2026-11-02',published_at:'2026-10-19T09:00:00Z'},{id:'b',date:'2026-10-01',published_at:'2026-10-19T10:00:00Z',is_intro:true}];
 assert.deepEqual(rows.toSorted(Core.compareLatest).map(x=>x.id),['b','a']);assert.equal(rows[1].published_at,'2026-10-19T10:00:00Z');
});
test('historical order puts intro before daily even when intro published later',()=>{const rows=[{id:'daily',published_at:'2026-10-18T07:00:00Z'},{id:'intro',kind:'introduction',published_at:'2026-10-19T19:00:00Z'}];assert.deepEqual(rows.toSorted(Core.compareHistory).map(x=>x.id),['intro','daily']);});
test('legacy introductory identifiers are recognized without rewriting timestamp',()=>assert.equal(Core.isIntro({id:'ibat:2026-10-19:introduction'}),true));
test('producer history collection takes priority over preview alias and latest pages',()=>{
 const key='episodes/channel/ibat',m={collections:{[key]:{pages:['latest'],history_pages:['old-preview']},'episodes/history/channel/ibat':{pages:['history0','history1']}}};
 assert.deepEqual(Core.collectionPaths(m,key,'oldest'),['history0','history1']);assert.deepEqual(Core.collectionPaths(m,key,'latest'),['latest']);
 delete m.collections['episodes/history/channel/ibat'];assert.deepEqual(Core.collectionPaths(m,key,'oldest'),['old-preview']);
 delete m.collections[key].history_pages;assert.deepEqual(Core.collectionPaths(m,key,'oldest'),['latest']);
 m.collections[key].pages.push('latest1');assert.equal(Core.collectionPaths(m,key,'oldest'),null);
});
test('history follows editorial chronology while latest follows actual publication',()=>{
 const a={id:'early-edition',date:'2026-10-17',published_at:'2026-10-20T09:00:00Z'},b={id:'later-edition',date:'2026-10-18',published_at:'2026-10-19T09:00:00Z'};
 assert.ok(Core.compareHistory(a,b)<0);assert.ok(Core.compareLatest(a,b)<0);
});
test('global ordering spans page boundaries at build time',()=>{
 const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{orderedCollections}=require('../scripts/build-preview.cjs');
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'morgonpod-order-')),out=path.join(root,'out');fs.mkdirSync(path.join(root,'catalog'),{recursive:true});fs.mkdirSync(path.join(out,'catalog'),{recursive:true});
 const rows=Array.from({length:201},(_,i)=>({id:'e'+i,channel:'c',date:'2026-10-19',published_at:new Date(1700000000000+i*60000).toISOString(),is_intro:i===200,detail:'catalog/e'+i+'.json'}));
 const pages=[];for(let i=0;i<rows.length;i+=24){const file='catalog/p'+i+'.json';pages.push(file);fs.writeFileSync(path.join(root,file),JSON.stringify({items:rows.slice(i,i+24)}));}for(const r of rows)fs.writeFileSync(path.join(root,r.detail),'{}');
 fs.writeFileSync(path.join(root,'catalog/manifest.json'),JSON.stringify({channels:[{id:'c'}],collections:{episodes:{count:201,pages}}}));
 const m=orderedCollections(root,out),read=p=>JSON.parse(fs.readFileSync(path.join(out,p))).items;assert.equal(read(m.collections.episodes.pages[0])[0].id,'e200');assert.equal(read(m.collections.episodes.history_pages[0])[0].id,'e200');assert.equal(read(m.collections.episodes.history_pages[0])[1].id,'e0');assert.equal(m.collections.episodes.pages.length,9);fs.rmSync(root,{recursive:true});
});
