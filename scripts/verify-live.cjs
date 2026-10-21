// Wait for Pages to serve the verified frontend, not a previous cached revision.
const fs=require('node:fs'),crypto=require('node:crypto');
const base='https://callekos.github.io/morgonpod-webb/';
const digest=value=>crypto.createHash('sha256').update(value).digest('hex');
const art=require('../channel-art-manifest.js');
const paths=[...new Set(['playback-queue.js','app.js','channel-art.js','channel-art-manifest.js','style.css','sw.js','idag.html','prenumerera.html','kanal.html','designlaboratorium.html',...art.styles.flatMap(style=>[style.preview,...Object.values(style.channels).flatMap(c=>[c.small,c.wide,c.square])]).filter(Boolean).map(p=>p.split('?')[0])])];
(async()=>{
 let last;
 for(let attempt=0;attempt<20;attempt++){
  try{
   for(let offset=0;offset<paths.length;offset+=8)await Promise.all(paths.slice(offset,offset+8).map(async path=>{
    const response=await fetch(base+path+'?verify='+Date.now(),{signal:AbortSignal.timeout(15000)});
    if(!response.ok)throw Error(path+': HTTP '+response.status);
    if(digest(Buffer.from(await response.arrayBuffer()))!==digest(fs.readFileSync(path)))throw Error(path+': previous deployment');
   }));
   const manifest=await fetch(base+'catalog/manifest.json?verify='+Date.now()).then(r=>r.json());
   if(!manifest.collections.episodes?.count)throw Error('No episodes in deployed catalog');
   if(Object.keys(manifest.superseded||{}).length!==5)throw Error('Retirement policy absent');
   console.log('Verified exact frontend bytes on Pages; '+manifest.collections.episodes.count+' published episodes retained.');return;
  }catch(error){last=error;console.log('Pages not ready: '+error.message);if(attempt<19)await new Promise(resolve=>setTimeout(resolve,15000));}
 }
 throw last;
})().catch(error=>{console.error(error);process.exitCode=1;});

