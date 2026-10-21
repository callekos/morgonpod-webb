/* Metadata only. Audio belongs to the application's single HTMLMediaElement. */
(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;else root.PlaybackQueue=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
  'use strict';
  const copy=x=>x==null?null:JSON.parse(JSON.stringify(x));
  const valid=x=>x&&typeof x.id==='string'&&x.id.length>0;
  const metadata=x=>Object.fromEntries(['id','title','channel','date','published_at','duration_seconds','audio','is_intro','kind','content_type','episode_order'].filter(k=>x[k]!==undefined).map(k=>[k,x[k]]));
  const unique=rows=>[...new Map((rows||[]).filter(x=>valid(x)&&Queue.accept(x)).map(x=>[x.id,metadata(x)])).values()];
  const latest=(a,b)=>(Date.parse(b.published_at||b.date)||0)-(Date.parse(a.published_at||a.date)||0)||a.id.localeCompare(b.id);
  // Serializable cursors let the queue continue after navigation and reload.
  async function read(source,fetchPage,compare=latest,limit=24){
    const next=copy(source);
    if(!next)return {items:[],source:null};
    if(next.kind==='pages'){
      if(next.page>=next.paths.length)return {items:[],source:null};
      const data=await fetchPage(next.paths[next.page]);
      if(!Array.isArray(data.items))throw Error('Invalid page');
      next.page++;
      return {items:unique(data.items).filter(e=>Queue.matches(e,next.filter)).sort(compare),source:next.page<next.paths.length?next:null};
    }
    if(next.kind!=='merge')throw Error('Invalid source');
    const items=[];
    for(let n=0;n<limit;n++){
      await Promise.all(next.streams.map(async s=>{
        while(!s.buffer.length&&s.page<s.paths.length){
          const data=await fetchPage(s.paths[s.page]);
          if(!Array.isArray(data.items))throw Error('Invalid page');
          s.buffer=unique(data.items).filter(e=>Queue.matches(e,next.filter)).sort(compare);s.page++;
        }
      }));
      const heads=next.streams.filter(s=>s.buffer.length).sort((a,b)=>compare(a.buffer[0],b.buffer[0]));
      if(!heads.length)break;
      items.push(heads[0].buffer.shift());
    }
    return {items:unique(items),source:next.streams.some(s=>s.buffer.length||s.page<s.paths.length)?next:null};
  }
  class Queue {
    constructor(fetchPage){this.fetchPage=fetchPage;this.items=[];this.index=0;this.source=null;this.excluded=[];this.label='';this.version=0;this.pending=null;}
    get current(){return this.items[this.index]||null;}
    get hasNext(){return this.index+1<this.items.length||!!this.source;}
    start(rows,id,source=null,label='Avsnitt'){
      this.version++;this.pending=null;const list=unique(rows),at=list.findIndex(x=>x.id===id);
      this.items=at<0?[]:list.slice(at);this.index=0;this.source=copy(source);if(this.source?.kind==='merge')this.source.streams.forEach(s=>s.buffer=unique(s.buffer));this.excluded=list.slice(0,Math.max(0,at)).map(x=>x.id);this.label=label;
      return this.current;
    }
    async more(){
      if(!this.source)return;
      if(this.pending)return this.pending;
      const version=this.version,source=copy(this.source);
      const pending=(async()=>{
        const result=await read(source,this.fetchPage,source.order==='oldest'?Queue.history:Queue.latest);
        if(version!==this.version)return;
        const seen=new Set([...this.items.map(x=>x.id),...this.excluded]);
        this.items.push(...result.items.filter(x=>!seen.has(x.id)));this.source=result.source;
      })();
      this.pending=pending;
      try{await pending;}finally{if(this.pending===pending)this.pending=null;}
    }
    async next(){
      const version=this.version;
      while(this.index+1>=this.items.length&&this.source){await this.more();if(version!==this.version)return null;}
      if(this.index+1>=this.items.length)return null;
      return this.items[++this.index];
    }
    previous(){return this.index>0?this.items[--this.index]:null;}
    select(index){if(Number.isInteger(index)&&index>=0&&index<this.items.length){this.version++;this.pending=null;this.index=index;return this.current;}return null;}
    remove(index){if(index<=this.index||index>=this.items.length)return false;this.excluded.push(this.items[index].id);this.items.splice(index,1);return true;}
    move(from,to){if(from<=this.index||to<=this.index||from>=this.items.length||to>=this.items.length)return false;this.items.splice(to,0,this.items.splice(from,1)[0]);return true;}
    clearUpcoming(){this.version++;this.pending=null;this.items=this.items.slice(0,this.index+1);this.source=null;}
    snapshot(position=0,rate=1){return {schema:1,items:this.items,index:this.index,source:copy(this.source),excluded:this.excluded,label:this.label,position:Number.isFinite(position)?Math.max(0,position):0,rate:[1,1.25,1.5,1.75,2].includes(rate)?rate:1};}
    restore(value){
      const sourceOK=s=>!s||s.kind==='pages'&&Array.isArray(s.paths)&&s.paths.length<=10000&&s.paths.every(p=>typeof p==='string'&&/^catalog\/lists\/[\w./-]+\.json$/.test(p)&&!p.includes('..'))&&Number.isInteger(s.page)&&s.page>=0&&s.page<=s.paths.length||s?.kind==='merge'&&Array.isArray(s.streams)&&s.streams.length<=100&&s.streams.every(x=>sourceOK({...x,kind:'pages'})&&Array.isArray(x.buffer)&&x.buffer.every(valid));
      if(!value||value.schema!==1||!Array.isArray(value.items)||value.items.length>10000||!value.items.every(valid)||!Number.isInteger(value.index)||value.index<0||value.index>=value.items.length||!sourceOK(value.source))return false;
      this.version++;if(unique(value.items).length!==value.items.length)return false;this.items=unique(value.items);this.index=value.index;
      this.source=copy(value.source);this.excluded=Array.isArray(value.excluded)?value.excluded.filter(x=>typeof x==='string').slice(0,10000):[];this.label=String(value.label||'Sparad kö').slice(0,200);return true;
    }
  }
  Queue.accept=()=>true;Queue.matches=()=>true;Queue.latest=latest;
  Queue.history=(a,b)=>Number(b.is_intro===true||b.kind==='introduction'||/:introduction$/.test(b.id))-Number(a.is_intro===true||a.kind==='introduction'||/:introduction$/.test(a.id))||((Number.isFinite(a.episode_order)&&Number.isFinite(b.episode_order))?a.episode_order-b.episode_order:(Date.parse(a.date)||0)-(Date.parse(b.date)||0))||-latest(a,b);
  return {Queue,read,latest};
});
