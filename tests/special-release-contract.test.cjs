const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const episodeId=e=>e.id||[e.channel??'ibat',e.date??'',e.kind??'daily'].join(':');

test('all active catalog pages have exact counts and omit superseded identities',()=>{
 const manifest=read('catalog/manifest.json');
 const policy=read('catalog-policy.json');
 const entries=read('episodes.json').episodes;
 const ids=new Set(entries.map(episodeId));
 const expected=Object.fromEntries(Object.entries(policy.superseded).filter(([,replacement])=>ids.has(replacement)));
 assert.deepEqual(manifest.superseded,expected);
 for(const [key,collection] of Object.entries(manifest.collections)){
  const rows=collection.pages.flatMap(p=>read(p).items);
  assert.equal(rows.length,collection.count,key);
  assert.equal(new Set(rows.map(r=>r.id)).size,rows.length,key);
  for(const row of rows)assert.ok(!expected[row.episode_id||row.id],key+': '+row.id);
 }
 for(const bucket of manifest.search_buckets){
  for(const rows of Object.values(read('catalog/search/'+bucket+'.json'))){
   for(const row of rows)assert.ok(!expected[row.episode_id||row.id],row.id);
  }
 }
 const active=manifest.collections.episodes.pages.flatMap(p=>read(p).items);
 assert.equal(active.length,entries.filter(e=>!expected[episodeId(e)]).length);
 for(const channel of manifest.channels){
  const collection=manifest.collections['episodes/channel/'+channel.id];
  assert.equal(collection?.count||0,active.filter(e=>e.channel===channel.id).length);
 }
});
