const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const Art=require('../channel-art.js'),manifest=require('../channel-art-manifest.js');
test('only complete eight-channel styles can become selectable',()=>{
 const broken=structuredClone(manifest.styles[0]);delete broken.channels.kek.square;
 const api=Art.create({styles:[manifest.styles[0],{...broken,id:'broken'}]});
 assert.equal(api.styles.length,1);assert.equal(api.select('broken'),false);
});
test('local choice persists independently from theme and resets without affecting playback storage',()=>{
 const data=new Map([['morgonpod-theme','dark'],['morgonpod-playback','unchanged']]);const storage={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};
 const api=Art.create(manifest,storage),style=api.styles.find(s=>s.id!=='v3');assert.equal(api.selected,'v3');assert.ok(api.select(style.id));assert.equal(Art.create(manifest,storage).selected,style.id);
 assert.equal(data.get('morgonpod-theme'),'dark');assert.equal(data.get('morgonpod-playback'),'unchanged');api.select('v3');assert.equal(data.has(Art.KEY),false);
});
test('unknown style and unavailable storage safely use V3',()=>{
 const api=Art.create(manifest,{getItem(){throw Error('blocked');},setItem(){throw Error('blocked');},removeItem(){throw Error('blocked');}});assert.equal(api.selected,'v3');assert.ok(api.resolve('unknown').src.includes('/ibat.webp'));assert.equal(api.select('nonexistent'),false);
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
test('classification retains eight identities with exactly four daily and four knowledge channels',()=>{
 const core=require('../app.js');assert.deepEqual(core.dailyChannels,['ibat','vald','sjoomradet','kek']);assert.ok(core.knowledgeChannels.includes('lagstiftning'));assert.equal(new Set([...core.dailyChannels,...core.knowledgeChannels]).size,8);
});
