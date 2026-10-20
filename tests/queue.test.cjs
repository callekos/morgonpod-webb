const {test}=require('node:test'),assert=require('node:assert/strict');
const {Queue,read,latest}=require('../playback-queue.js');
const row=(id,channel='a',published_at='2026-10-20T07:00:00Z')=>({id,channel,published_at,title:id,audio:'episodes/test/'+id+'.mp3'});
test('same selected episode gets distinct ordered queues from latest, channel and filtered search',()=>{
 const selected=row('chosen'),other=row('other','b'),older=row('older');
 const q=new Queue();q.start([selected,other,older],'chosen',null,'Senaste');assert.deepEqual(q.items.map(x=>x.id),['chosen','other','older']);
 q.start([selected,older],'chosen',null,'Kanal');assert.deepEqual(q.items.map(x=>x.id),['chosen','older']);
 q.start([other,selected],'chosen',null,'Sök');assert.deepEqual(q.items.map(x=>x.id),['chosen']);assert.equal(q.hasNext,false);
});
test('removing, reordering, previous and end never loop or remove current',async()=>{
 const q=new Queue();q.start(['a','b','c','d'].map(x=>row(x)),'a');assert.equal(q.remove(0),false);assert.equal(q.move(2,0),false);assert.equal(q.move(3,1),true);assert.deepEqual(q.items.map(x=>x.id),['a','d','b','c']);q.remove(2);assert.equal((await q.next()).id,'d');assert.equal(q.previous().id,'a');await q.next();await q.next();assert.equal(await q.next(),null);assert.equal(q.current.id,'c');q.clearUpcoming();assert.equal(q.hasNext,false);
});
test('metadata is requested one page at the boundary, deduplicated and retryable after failure',async()=>{
 const calls=[];let fail=true;const q=new Queue(async p=>{calls.push(p);if(fail)throw Error('offline');return {items:[row('a'),row('b')]};});
 q.start([row('a')],'a',{kind:'pages',paths:['catalog/lists/episodes/1.json'],page:0});assert.equal(calls.length,0);
 await assert.rejects(q.next());assert.equal(q.current.id,'a');assert.equal(q.source.page,0);fail=false;assert.equal((await q.next()).id,'b');assert.equal(calls.length,2);assert.equal(q.hasNext,false);
});
test('new manual selection cancels an in-flight metadata continuation',async()=>{
 let resolve;const q=new Queue(()=>new Promise(r=>resolve=r));q.start([row('a')],'a',{kind:'pages',paths:['catalog/lists/x.json'],page:0});const pending=q.next();q.start([row('new')],'new');resolve({items:[row('old')]});assert.equal(await pending,null);assert.equal(q.current.id,'new');assert.equal(q.items.length,1);
});
test('reload preserves position, rate, source and edits without autoplay',()=>{
 const q=new Queue();q.start(['a','b','c'].map(x=>row(x)),'a',{kind:'pages',paths:['catalog/lists/x.json'],page:0},'Kanal');q.remove(1);const saved=JSON.parse(JSON.stringify(q.snapshot(73,1.5))),next=new Queue();assert.equal(next.restore(saved),true);assert.deepEqual(next.items.map(x=>x.id),['a','c']);assert.equal(saved.position,73);assert.equal(saved.rate,1.5);assert.equal(next.source.page,0);assert.equal(next.restore({...saved,source:{kind:'pages',paths:['https://evil.test/file'],page:0}}),false);assert.equal(next.restore({...saved,index:500}),false);
});
test('publication instants and historical intro priority are independent',async()=>{
 const intro={...row('intro','a','2026-10-20T09:00:00Z'),is_intro:true,date:'2026-10-01'},daily={...row('daily','a','2026-10-20T10:00:00Z'),date:'2026-10-02'};assert.deepEqual([intro,daily].sort(latest).map(x=>x.id),['daily','intro']);assert.deepEqual([daily,intro].sort(Queue.history).map(x=>x.id),['intro','daily']);
});
test('20 channel merge retrieves bounded heads and globally orders across page boundaries',async()=>{
 const loaded=[],streams=Array.from({length:20},(_,i)=>({paths:[0,1,2,3,4,5,6,7,8].map(n=>'catalog/lists/c'+i+'/'+n+'.json'),page:0,buffer:[]}));
 const fetch=async path=>{loaded.push(path);const [,c,n]=path.match(/c(\d+)\/(\d+)/);return {items:Array.from({length:24},(_,j)=>row(c+'-'+n+'-'+j,c,new Date(Date.UTC(2026,9,20,10)-Number(c)*1000-(Number(n)*24+j)*100000).toISOString()))};};
 let result=await read({kind:'merge',streams},fetch,latest,24);assert.equal(result.items.length,24);assert.equal(loaded.length,20);assert.deepEqual(result.items,[...result.items].sort(latest));assert.equal(result.source.streams.length,20);result=await read(result.source,fetch,latest,24);assert.equal(result.items.length,24);assert.ok(loaded.length<40);assert.ok(loaded.length<180);
});
test('concurrent load-more coalesces and clear cancels late append',async()=>{
 let resolve,count=0;const q=new Queue(()=>{count++;return new Promise(r=>resolve=r);});q.start([row('a')],'a',{kind:'pages',paths:['catalog/lists/x.json'],page:0});const a=q.more(),b=q.more();assert.equal(count,1);q.clearUpcoming();resolve({items:[row('b')]});await Promise.all([a,b]);assert.deepEqual(q.items.map(x=>x.id),['a']);assert.equal(q.source,null);
});
