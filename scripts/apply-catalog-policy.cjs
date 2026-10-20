/* Idempotent projection only. Source records and media remain recoverable. */
const fs=require('node:fs'),path=require('node:path');
function apply(root){
 const read=p=>JSON.parse(fs.readFileSync(path.join(root,p)));
 const write=(p,x)=>fs.writeFileSync(path.join(root,p),JSON.stringify(x)+'\n');
 const policy=read('catalog-policy.json'),manifest=read('catalog/manifest.json');
 const ids=new Set(manifest.collections.episodes.pages.flatMap(p=>read(p).items.map(e=>e.id)));
 const mapping=Object.fromEntries(Object.entries(policy.superseded).filter(([old,replacement])=>ids.has(replacement)));
 const active=x=>!mapping[x.episode_id||x.id];
 for(const c of Object.values(manifest.collections)){
  const rows=c.pages.flatMap(p=>read(p).items).filter(active);
  const oldPages=[...c.pages];c.count=rows.length;c.pages=[];
  for(let i=0;i<rows.length;i+=manifest.page_size){const p=oldPages[i/manifest.page_size];write(p,{items:rows.slice(i,i+manifest.page_size)});c.pages.push(p);}
  for(const p of oldPages.filter(p=>!c.pages.includes(p)))write(p,{items:[]});
  if(c.latest&&!active(c.latest))c.latest=rows[0]||null;
 }
 // Search buckets are rebuilt in place including now-empty terms, so stale rows
 // cannot survive an idempotent run or a producer's refreshed search shard.
 for(const file of fs.readdirSync(path.join(root,'catalog/search'))){
  const p='catalog/search/'+file,data=read(p);
  for(const key of Object.keys(data))data[key]=data[key].filter(active);
  write(p,data);
 }
 for(const [id,replacement_id] of Object.entries(mapping)){
  const h=require('node:crypto').createHash('sha256').update(id).digest('hex').slice(0,24),p='catalog/episodes/'+h+'.json';
  if(fs.existsSync(path.join(root,p)))write(p,{...read(p),catalog_status:'superseded',replacement_id});
 }
 for(const file of fs.readdirSync(path.join(root,'catalog/articles'))){
  const p='catalog/articles/'+file,a=read(p);if(mapping[a.episode_id])write(p,{...a,catalog_status:'superseded',replacement_id:mapping[a.episode_id]});
 }
 manifest.superseded=mapping;manifest.catalog_policy_release=policy.release;
 write('catalog/manifest.json',manifest);return manifest;
}
module.exports={apply};if(require.main===module){const m=apply(path.resolve(__dirname,'..'));console.log(m.collections.episodes.count+' active episodes, '+m.collections.articles.count+' active articles');}
