/* Deterministic static packaging. Reads producer files; writes only the output directory. */
const fs=require('node:fs'),path=require('node:path'),Core=require('../app.js');
function orderedCollections(root,out){
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'catalog/manifest.json')));const memo=new Map();let missing=0;
 for(const [key,c] of Object.entries(manifest.collections)){
  const rows=c.pages.flatMap(p=>JSON.parse(fs.readFileSync(path.join(root,p))).items).map(row=>{
   if(!memo.has(row.detail)){const d=Core.safePath(row.detail)?JSON.parse(fs.readFileSync(path.join(root,row.detail))):{};memo.set(row.detail,d);}
   const d=memo.get(row.detail);return {...row,published_at:row.published_at||d.published_at,kind:row.kind||d.kind,is_intro:Core.isIntro({...d,...row}),episode_order:row.episode_order??d.episode_order};
  });
  if(key==='episodes')missing=rows.filter(x=>!x.published_at).length;
  const historical=key.startsWith('episodes/history/');
  const latest=rows.toSorted(Core.compareLatest);c.latest=latest[0]||null;c.pages=writePages(key,historical?rows.toSorted(Core.compareHistory):latest);
  if(key.startsWith('episodes')&&!historical){
   const historyKey=key.startsWith('episodes/channel/')?key.replace('episodes/channel/','episodes/history/channel/'):key+'/history';
   c.history_pages=writePages(historyKey,rows.toSorted(Core.compareHistory));
   if(historyKey.startsWith('episodes/history/channel/')&&!manifest.collections[historyKey])manifest.collections[historyKey]={count:rows.length,pages:c.history_pages};
  }
 }
 manifest.publication_metadata={missing_episode_timestamps:missing};
 manifest.channels=manifest.channels.map(c=>c.id==='ibat'?{...c,name:'IBAT - Informationsförsörjning'}:c);
 fs.writeFileSync(path.join(out,'catalog/manifest.json'),JSON.stringify(manifest));
 function writePages(key,rows){const pages=[];for(let i=0;i<rows.length;i+=24){const p='catalog/lists/'+key+'/'+(i/24)+'.json';fs.mkdirSync(path.dirname(path.join(out,p)),{recursive:true});fs.writeFileSync(path.join(out,p),JSON.stringify({items:rows.slice(i,i+24)}));pages.push(p);}return pages;}
 return manifest;
}
function build(root,out){
 if(path.resolve(root)===path.resolve(out))throw Error('Output must differ from source');fs.mkdirSync(out,{recursive:true});
 for(const name of fs.readdirSync(root))if(/\.html$/.test(name)||['app.js','style.css','sw.js','manifest.webmanifest','icon.svg','cover.svg','analytics-config.json','stats.json','assets','catalog','episodes'].includes(name))fs.cpSync(path.join(root,name),path.join(out,name),{recursive:true});
 return orderedCollections(root,out);
}
module.exports={build,orderedCollections};
if(require.main===module){const m=build(path.resolve(__dirname,'..'),path.resolve(process.argv[2]||'dist'));console.log('Static preview built, '+m.publication_metadata.missing_episode_timestamps+' episodes without publication timestamps.');}
