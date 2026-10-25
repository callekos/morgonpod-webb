const test=require('node:test'),assert=require('node:assert/strict'),Core=require('../app.js');
const note={kind:'update',at:'2026-10-25T10:00:00Z',text:'Senare uppgift <script>farlig()</script>',source_url:'https://example.org/update',audio_status:'original_not_regenerated'};
const article=()=>({id:'a1',episode_id:'ibat:2026-10-22:daily',published_at:'2026-10-22T06:00:00Z',editorial_notes:[note],history:[{id:'a1',episode_id:'ibat:2026-10-22:daily',revision:1,body:'Ursprunglig text.',context:'Ursprungligt sammanhang.'}]});
test('legacy articles have no invented update or audio warning',()=>assert.equal(Core.articleChanges({}),''));
test('dated note, safe source, audio disclosure and original history are rendered',()=>{
 const html=Core.articleChanges(article());assert.match(html,/Uppdatering/);assert.match(html,/datetime="2026-10-25T10:00:00Z"/);assert.match(html,/25 oktober 2026/);assert.match(html,/https:\/\/example.org\/update/);assert.match(html,/Ljudet återger artikelns tidigare version/);assert.match(html,/Tidigare artikelversioner/);assert.match(html,/Ursprunglig text/);assert.doesNotMatch(html,/<script>/);assert.match(html,/&lt;script&gt;/);
});
test('correction and later update remain distinct',()=>{const a=article();a.editorial_notes=[{...note,kind:'correction'}];assert.match(Core.articleChanges(a),/Rättelse/);});
test('bad URLs, credentials, dates and note types cannot become valid notes',()=>{
 for(const patch of [{source_url:'javascript:alert(1)'},{source_url:'https://name:secret@example.org/'},{at:'invalid'},{kind:'rewrite'}]){const a=article();a.editorial_notes=[{...note,...patch}];const html=Core.articleChanges(a);assert.match(html,/kunde inte visas fullständigt/);assert.doesNotMatch(html,/href=/);}
});
test('history from another article or episode is never shown',()=>{const a=article();a.history=[{id:'other',episode_id:a.episode_id,body:'Hemlig annan text'}];assert.doesNotMatch(Core.articleChanges(a),/Hemlig annan text|Tidigare artikelversioner/);});
