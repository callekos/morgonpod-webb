const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const Art=require('../channel-art.js'),manifest=require('../channel-art-manifest.js');
test('only complete eight-channel styles can become selectable',()=>{
 const broken=structuredClone(manifest.styles[0]);delete broken.channels.kek.square;
 const api=Art.create({styles:[manifest.styles[0],{...broken,id:'broken'}]});
 assert.equal(api.styles.length,1);assert.equal(api.select('broken'),false);
});
test('local choice persists independently from theme and resets without affecting playback storage',()=>{
 const data=new Map([['morgonpod-theme','dark'],['morgonpod-playback','unchanged']]);const storage={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};
 const api=Art.create(manifest,storage),style=api.styles.find(s=>s.id!=='v3');assert.equal(api.selected,'06-film');assert.ok(api.select(style.id));assert.equal(Art.create(manifest,storage).selected,style.id);
 assert.equal(data.get('morgonpod-theme'),'dark');assert.equal(data.get('morgonpod-playback'),'unchanged');api.select('v3');assert.equal(Art.create(manifest,storage).selected,'v3');api.reset();assert.equal(data.has(Art.KEY),false);assert.equal(api.selected,'06-film');
});
test('unavailable storage uses film and unknown channels get neutral art',()=>{
 const api=Art.create(manifest,{getItem(){throw Error('blocked');},setItem(){throw Error('blocked');},removeItem(){throw Error('blocked');}});assert.equal(api.selected,'06-film');assert.ok(api.resolve('unknown').src==='cover.svg');assert.equal(api.select('nonexistent'),false);
});
test('each ready series contains distinct originals, derivatives and an eight-channel preview',()=>{
 const allOriginals=[];
 for(const style of manifest.styles){assert.ok(Art.complete(style));const hashes=[];
  for(const id of Art.CHANNELS){for(const size of ['small','wide','square']){const path=style.channels[id][size].split('?')[0];assert.ok(fs.existsSync(path));assert.ok(fs.statSync(path).size>100,'Nonempty export: '+path);}
   if(style.id!=='v3'){const source='assets/design-lab/'+style.id+'/'+id+'-master.webp';assert.ok(fs.existsSync(source));const bytes=fs.readFileSync(source);assert.ok(bytes.length>100,'Nonempty master: '+source);assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');hashes.push(crypto.createHash('sha256').update(bytes).digest('hex'));}
  }
  if(style.id!=='v3'){assert.equal(new Set(hashes).size,8);allOriginals.push(...hashes);assert.ok(fs.existsSync(style.preview));}
 }
 assert.equal(new Set(allOriginals).size,allOriginals.length,'Every experimental channel image must have its own original');
 assert.equal(allOriginals.length,manifest.styles.filter(s=>s.id!=='v3').length*8);
});
test('classification retains existing identities and accepts Mediesvepet growth',()=>{
 const core=require('../app.js'),channels=JSON.parse(fs.readFileSync('catalog/manifest.json')).channels;const groups=core.channelGroups(channels);const hasMedia=channels.some(c=>c.id==='mediesvepet');assert.deepEqual(groups[0].channels.map(c=>c.id),[...(hasMedia?['mediesvepet']:[]),'ibat','vald','sjoomradet','kek']);assert.equal(groups[1].channels.length,4);assert.equal(new Set(groups.flatMap(g=>g.channels.map(c=>c.id))).size,hasMedia?9:8);
});
test('valid explicit V3 and all twenty saved choices survive the new default',()=>{
 for(const style of manifest.styles){const data=new Map([[Art.KEY,style.id]]);const storage={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};const api=Art.create(manifest,storage);assert.equal(api.selected,style.id);api.reset();assert.equal(api.selected,'06-film');assert.equal(data.has(Art.KEY),false);}
});
test('register growth and order never depend on publication timestamps or episode kinds',()=>{
 const core=require('../app.js');for(const [a,b] of [[0,10],[1,5],[4,4],[5,1],[10,0]]){const channels=[...Array.from({length:a},(_,i)=>({id:'m'+i,channel_type:'monitoring',display_order:i})),...Array.from({length:b},(_,i)=>({id:'k'+i,channel_type:'knowledge',display_order:i}))].reverse();const groups=core.channelGroups(channels);assert.deepEqual(groups.map(g=>g.channels.length),[a,b]);assert.equal(new Set(groups.flatMap(g=>g.channels.map(c=>c.id))).size,a+b);assert.equal(groups[0].channels[0]?.id,a?'m0':undefined);}
});

