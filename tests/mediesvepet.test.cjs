const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const Core=require('../app.js'),Art=require('../channel-art.js'),manifest=require('../channel-art-manifest.js');
test('media backfill sorts by reference date while preserving actual publication',()=>{
 const rows=[{id:'new',channel:'mediesvepet',date:'2026-10-22',published_at:'2026-10-22T12:00:00Z'},{id:'old',channel:'mediesvepet',date:'2026-10-16',published_at:'2026-10-22T14:00:00Z'}];
 assert.deepEqual(rows.toSorted(Core.compareLatest).map(e=>e.id),['new','old']);
 assert.equal(rows[1].published_at,'2026-10-22T14:00:00Z');
});
test('new monitoring channel retains its own identity in every saved art style',()=>{
 const api=Art.create(manifest);
 for(const style of manifest.styles){for(const square of [false,true]){
  const image=api.resolve('mediesvepet',square,style.id);
  assert.match(image.src,/assets\/channels\/mediesvepet/);
  assert.ok(fs.statSync(image.src.split('?')[0]).size>1000);
 }}
 assert.equal(api.styles.length,21);
});
test('media joins monitoring independently of knowledge channels',()=>{
 const groups=Core.channelGroups([{id:'mediesvepet',channel_type:'monitoring',display_order:4},{id:'lagstiftning',channel_type:'knowledge',display_order:4}]);
 assert.deepEqual(groups.map(g=>g.channels.map(c=>c.id)),[['mediesvepet'],['lagstiftning']]);
});
