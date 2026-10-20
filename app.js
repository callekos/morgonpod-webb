/* Morgonpod: one application, one persistent audio element, bounded archive requests. */
const Core = {
  escape: value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
  safePath: value => typeof value === 'string' && /^(catalog|episodes)\/[\w./-]+$/.test(value) && !value.includes('..'),
  listened: (elapsed, delta, playing) => elapsed + (playing && delta > 0 && delta < 2 ? delta : 0),
  isIntro: e => e.is_intro === true || e.kind === 'introduction' || /:introduction$/.test(e.id || ''),
  published: e => Date.parse(e.published_at || e.date || '') || 0,
  compareLatest: (a,b) => Core.published(b)-Core.published(a) || String(a.id).localeCompare(String(b.id)),
  compareHistory: (a,b) => Number(Core.isIntro(b))-Number(Core.isIntro(a)) || ((Number.isFinite(a.episode_order)&&Number.isFinite(b.episode_order)) ? a.episode_order-b.episode_order : (Date.parse(a.date)||Core.published(a))-(Date.parse(b.date)||Core.published(b))) || Core.published(a)-Core.published(b) || String(a.id).localeCompare(String(b.id)),
  collectionPaths: (manifest,key,order) => {
    const data=manifest.collections[key]||{pages:[]};
    if(order!=='oldest')return data.pages;
    // Producer contract since 20 October. The preview's older alias is retained.
    const history=manifest.collections[key.replace(/^episodes\/channel\//,'episodes/history/channel/')];
    if(key.startsWith('episodes/channel/')&&history?.pages)return history.pages;
    if(data.history_pages)return data.history_pages;
    // A single legacy page can be sorted completely. Never fake global episode
    // chronology by sorting/reversing only one page of a large old archive.
    if(key.startsWith('episodes')&&data.pages.length>1)return null;
    return [...data.pages].reverse();
  },
  ranking: rows => (Array.isArray(rows) ? rows : []).filter(x => Number.isFinite(x.count) && x.count > 0).sort((a,b)=>b.count-a.count).slice(0,10)
};
if (typeof module !== 'undefined') module.exports = Core;
if (typeof document !== 'undefined') (async () => {
  'use strict';
  const $ = s => document.querySelector(s), esc = Core.escape, main = $('#view'), audio = $('#audio');
  let manifest, currentEpisode, routeToken = 0, elapsed = 0, previousTime = 0, previousWall = performance.now(), config = {};
  const latestRows=new Map(), contexts=new Map();
  let contextNumber=0,detailContext=null;
  const registerContext=(target,rows,source,label)=>{const id=target.dataset.context||String(++contextNumber);target.dataset.context=id;contexts.set(id,{rows:[...rows],source:source?JSON.parse(JSON.stringify(source)):null,label});return id;};
  const cache = new Map(), seen = new Set();
  const channel = id => id==='ibat'?'IBAT - Informationsförsörjning':manifest.channels.find(c=>c.id===id)?.name || id;
  const visuals={ibat:{image:'ibat',category:'Samhälle',color:'#19b8d0',icon:'database'},vald:{image:'vald',category:'Säkerhet',color:'#d54864',icon:'shield'},kek:{image:'kek',category:'Samhälle',color:'#ae8249',icon:'briefcase'},sjoomradet:{image:'sjoomradet',category:'Säkerhet',color:'#46758b',icon:'anchor'},lagstiftning:{image:'lagstiftning',category:'Samhälle',color:'#ba9a53',icon:'book-open'}};
  const visual=id=>visuals[id]||{image:'ibat',category:'Övrigt',color:'#19b8d0',icon:'radio'};
  const icon=name=>'<i class="icon icon-'+name+'" aria-hidden="true"></i>';
  const cover=(id,cls='',eager=false)=>{
    const square=!eager||cls==='large-cover',focus={ibat:'50% 64%',kek:'58% 64%',lagstiftning:'50% 52%',sjoomradet:'65% 50%',vald:'50% 53%'}[id]||'50% 50%';
    return '<img class="cover '+cls+'" src="assets/channels/'+visual(id).image+(square?'-square':'')+'.webp?v=3" style="object-position:'+(square?'50% 50%':focus)+'" width="'+(square?'640':'1200')+'" height="'+(square?'640':'800')+'" alt="" loading="'+(eager?'eager':'lazy')+'" decoding="async">';
  };
  const duration=n=>{n=Math.max(0,Math.floor(n||0));return Math.floor(n/60)+':'+String(n%60).padStart(2,'0');};
  const prettyDate=e=>{const raw=e.published_at||e.date;if(!raw)return '';const d=new Date(raw);return Number.isNaN(d.getTime())?'':new Intl.DateTimeFormat('sv-SE',{day:'numeric',month:'short',timeZone:'Europe/Stockholm',...(e.published_at?{hour:'2-digit',minute:'2-digit'}:{})}).format(d);};
  const channelCard=c=>'<a class="channel-card" href="'+url('kanal',{id:c.id})+'" style="--channel-color:'+visual(c.id).color+'">'+cover(c.id)+'<span class="channel-card-label">'+icon(visual(c.id).icon)+'<strong>'+esc(channel(c.id))+'</strong></span></a>';
  const systemTheme=matchMedia('(prefers-color-scheme: dark)');
  function setTheme(value){document.documentElement.dataset.theme=value;try{localStorage.setItem('morgonpod-theme',value)}catch{}document.querySelector('meta[name="theme-color"]').content=(value==='dark'||value==='system'&&systemTheme.matches)?'#071720':'#faf9f6';}
  setTheme(document.documentElement.dataset.theme||'system');systemTheme.addEventListener('change',()=>setTheme(document.documentElement.dataset.theme));
  const hash = async text => !crypto.subtle ? window.sha256(text) : Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))).map(x=>x.toString(16).padStart(2,'0')).join('');
  async function json(path) {
    if (!cache.has(path)&&cache.size>=80)cache.delete(cache.keys().next().value);
    if (!cache.has(path)) cache.set(path, fetch(path,{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('Kunde inte hämta innehåll');return r.json();}).catch(e=>{cache.delete(path);throw e;}));
    return cache.get(path);
  }
  const url = (page, params={}) => page+'.html'+(Object.keys(params).length?'?'+new URLSearchParams(params):'');
  const tags = e => (e.topic_labels || e.tags || []).map(t=>'<a class="tag" href="'+url('amne',{tag:t.toLocaleLowerCase('sv').replace(/[^a-z0-9åäö]+/g,'-')})+'">'+esc(t)+'</a>').join('');
  // Channel is already displayed in metadata. Avoid repeating it in the episode title,
  // including in older archived episodes that were published with prefixed titles.
  const episodeTitle = e => {
    let title=String(e.title||'').trim();
    const full=channel(e.channel).replace(/\s+/g,' ').trim();
    const prefixes=[e.channel==='ibat'?'IBAT Informationsförsörjningen':'',full,full.split('\n')[0],{ibat:'IBAT',vald:'Våld',kek:'Kriminell ekonomi',sjoomradet:'Sjöområdet',lagstiftning:'Lagstiftning'}[e.channel]].filter(Boolean);
    for(const prefix of prefixes.sort((a,b)=>b.length-a.length)){
      if(title.toLocaleLowerCase('sv').startsWith(prefix.toLocaleLowerCase('sv')+':')){
        title=title.slice(prefix.length+1).trim();break;
      }
    }
    if(Core.isIntro(e) && (!title||/^(uppstart|introduktion)/i.test(title)))return 'Uppstartsavsnitt';
    if(!title)return Core.isIntro(e)?'Uppstartsavsnitt':'Morgonbrief';
    return title;
  };
  const metadata = e => '<span class="channel-name">'+esc(channel(e.channel))+'</span><time class="episode-date" datetime="'+esc(e.published_at||e.date||'')+'">'+esc(prettyDate(e))+'</time>';
  const articleCard = a => '<a class="article-card" href="'+url('artikel',{id:a.id})+'">'+cover(a.channel)+'<div><small>'+metadata(a)+'</small><h3>'+esc(a.title)+'</h3><p>'+esc(a.summary||'')+'</p><span class="read-time">'+(a.reading_minutes?esc(a.reading_minutes)+' min läsning':'Läs artikeln')+'</span></div>'+icon('chevron-right')+'</a>';
  const episodeRow = e => '<details class="episode" data-id="'+esc(e.id)+'"><summary><button type="button" class="episode-art direct-play" data-play="'+esc(e.id)+'" aria-label="Spela '+esc(episodeTitle(e))+'">'+cover(e.channel)+'<span class="play-symbol">'+icon('play')+'</span></button><span class="row-title" data-channel="'+esc(channel(e.channel))+'"><small class="item-meta">'+metadata(e)+'</small><strong>'+esc(episodeTitle(e))+'</strong>'+(Core.isIntro(e)?'<span class="intro-badge">Avsnitt 1 / Uppstart</span>':'')+'<span class="episode-topics">'+esc((e.topic_labels||e.tags||[]).slice(0,2).join(' · '))+'</span></span><span class="duration">'+(e.duration_seconds?duration(e.duration_seconds):'')+'</span>'+icon('chevron-down')+'</summary><div class="episode-body"><p role="status">Laddar avsnitt…</p></div></details>';
  async function detail(kind,id) { return json('catalog/'+kind+'/'+(await hash(id)).slice(0,24)+'.json'); }
  async function track(type,id) {
    if (!config.goatcounter || navigator.doNotTrack === '1' || !window.goatcounter?.count) return;
    const k = type+':'+id;
    try {if (seen.has(k) || sessionStorage.getItem(k)) return;} catch {}
    seen.add(k);
    try { sessionStorage.setItem(k,'1'); } catch {}
    // No user ID, referrer, query string or personal information is supplied.
    if (window.goatcounter?.count) window.goatcounter.count({path:'morgonpod/'+type+'/'+encodeURIComponent(id),title:type,event:true,referrer:''});
  }
  const player=$('#player');
  PlaybackQueue.Queue.history=Core.compareHistory;
  const queue=new PlaybackQueue.Queue(json);
  let playbackRequest=0, advancing=false, resumePosition=0, savedAt=0, notice='';
  const queueControls=document.createElement('div');queueControls.className='queue-controls';
  queueControls.innerHTML='<button id="queue-previous" aria-label="Föregående avsnitt">Föregående</button><button id="queue-next" aria-label="Nästa avsnitt">Nästa</button><button id="queue-toggle" aria-expanded="false" aria-controls="queue-panel">Kö</button>';
  player.append(queueControls);
  const queuePanel=document.createElement('section');queuePanel.id='queue-panel';queuePanel.className='queue-panel';queuePanel.hidden=true;queuePanel.setAttribute('aria-label','Uppspelningskö');player.append(queuePanel);
  function persist(){try{if(queue.current)localStorage.setItem('morgonpod-playback',JSON.stringify(queue.snapshot(resumePosition||audio.currentTime,audio.playbackRate)));}catch{}}
  function updateQueue(){
    const current=queue.current,next=queue.items[queue.index+1],remaining=Math.max(0,queue.items.length-queue.index-1);
    $('#queue-previous').disabled=queue.index<=0||advancing;$('#queue-next').disabled=!queue.hasNext||advancing;
    $('#queue-toggle').textContent='Kö ('+remaining+(queue.source?'+':'')+')';
    queuePanel.innerHTML='<div class="queue-heading"><h2>Uppspelningskö</h2><button data-queue-action="close">Stäng kön</button></div><p class="muted">'+esc(queue.label)+'</p><h3>Spelas nu</h3><p>'+esc(current?episodeTitle(current):'Inget avsnitt valt')+'</p><h3>Spelas härnäst</h3>'+(remaining?'<ol>'+queue.items.slice(queue.index+1).map((e,i)=>{const n=queue.index+i+1;return '<li><button class="queue-title" data-queue-action="play" data-index="'+n+'">'+esc(episodeTitle(e))+'<small>'+esc(channel(e.channel))+'</small></button><div class="queue-edit"><button data-queue-action="up" data-index="'+n+'" '+(n===queue.index+1?'disabled':'')+' aria-label="Flytta upp '+esc(episodeTitle(e))+'">↑</button><button data-queue-action="down" data-index="'+n+'" '+(n===queue.items.length-1?'disabled':'')+' aria-label="Flytta ned '+esc(episodeTitle(e))+'">↓</button><button data-queue-action="remove" data-index="'+n+'" aria-label="Ta bort '+esc(episodeTitle(e))+'">Ta bort</button></div></li>';}).join('')+'</ol>':'<p>'+(queue.source?'Fler avsnitt kan hämtas.':'Inga fler avsnitt i kön.')+'</p>')+(queue.source?'<button data-queue-action="more">Hämta fler avsnitt</button>':'')+'<button data-queue-action="clear">Töm kommande kö</button>';
    const nextLabel=$('#up-next');if(nextLabel)nextLabel.textContent=next?'Spelas härnäst: '+episodeTitle(next):queue.source?'Fler avsnitt hämtas vid behov':'Sista avsnittet i kön';
    if(notice)$('#player-status').textContent=notice;
  }
  function showQueue(open){queuePanel.hidden=!open;$('#queue-toggle').setAttribute('aria-expanded',String(open));if(open)queuePanel.querySelector('button').focus();else $('#queue-toggle').focus();}
  $('#queue-toggle').onclick=()=>showQueue(queuePanel.hidden);
  queuePanel.onkeydown=e=>{if(e.key==='Escape')showQueue(false);};
  queuePanel.onclick=async event=>{
    const b=event.target.closest('[data-queue-action]');if(!b)return;
    const n=Number(b.dataset.index),action=b.dataset.queueAction;if(advancing&&action!=='close')return;
    if(action==='close'){showQueue(false);return;}
    if(action==='play'){const row=queue.select(n);if(row)void play(row);}
    else if(action==='remove')queue.remove(n);
    else if(action==='up')queue.move(n,n-1);
    else if(action==='down')queue.move(n,n+1);
    else if(action==='clear')queue.clearUpcoming();
    else if(action==='more'){b.disabled=true;try{await queue.more();notice='';}catch{notice='Kön kunde inte hämtas. Försök Hämta fler igen.';}}
    updateQueue();persist();
    if(!queuePanel.hidden){const matching=[...queuePanel.querySelectorAll('[data-queue-action]')].find(x=>x.dataset.queueAction===action&&x.dataset.index===String(n));(matching||queuePanel.querySelector('button')).focus();}
  };
  async function advance(direction=1){
    if(advancing)return;advancing=true;updateQueue();const request=playbackRequest;
    try{const row=direction<0?queue.previous():await queue.next();if(request!==playbackRequest)return;if(row){notice='';await play(row);}else{notice='Kön är avslutad. Välj ett avsnitt att spela.';audio.pause();}}
    catch{notice='Nästa avsnitt kunde inte hämtas. Försök igen eller välj i kön.';}
    finally{advancing=false;updateQueue();persist();}
  }
  $('#queue-next').onclick=()=>advance();$('#queue-previous').onclick=()=>advance(-1);
  function startFrom(id,contextId){
    const context=contexts.get(contextId),row=context?.rows.find(e=>e.id===id);
    if(!row)return;
    if(currentEpisode?.id===id&&queue.label===context.label&&!audio.paused){audio.pause();return;}
    playbackRequest++;let source=context.source?JSON.parse(JSON.stringify(context.source)):null;const rows=source?.kind==='merge'?[row]:context.rows;if(source?.kind==='merge')source.streams.forEach(s=>s.buffer=s.buffer.filter(e=>Core.compareLatest(e,row)>=0));queue.start(rows,id,source,context.label);notice='';resumePosition=0;updateQueue();void play(row);
  }
  main.addEventListener('click',event=>{const b=event.target.closest('[data-play]');if(!b)return;event.preventDefault();event.stopPropagation();startFrom(b.dataset.play,b.closest('[data-context]')?.dataset.context);});
  audio.addEventListener('ended',()=>{void advance();});
  audio.addEventListener('loadedmetadata',()=>{if(resumePosition>0&&Number.isFinite(audio.duration)){audio.currentTime=Math.min(resumePosition,Math.max(0,audio.duration-0.25));resumePosition=0;}});
  audio.addEventListener('pause',persist);audio.addEventListener('ratechange',persist);window.addEventListener('pagehide',persist);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)persist();});
  audio.addEventListener('timeupdate',()=>{if(Date.now()-savedAt>5000){savedAt=Date.now();persist();}});

  let toggle=$('#player-toggle');
  if(!toggle){toggle=document.createElement('button');toggle.id='player-toggle';toggle.textContent='Minimera';player.append(toggle);}
  function compactPlayer(compact){
    player.classList.toggle('compact',compact);
    if(toggle){toggle.innerHTML=icon(compact?'chevron-up':'chevron-down');toggle.setAttribute('aria-expanded',String(!compact));toggle.setAttribute('aria-label',compact?'Visa hela spelaren':'Minimera spelaren');}
    document.body.classList.toggle('player-compact',compact);
  }
  if(toggle)toggle.addEventListener('click',()=>compactPlayer(!player.classList.contains('compact')));
  audio.addEventListener('timeupdate',()=>{
    const delta = audio.currentTime-previousTime, now=performance.now(), wall=(now-previousWall)/1000; previousTime=audio.currentTime;previousWall=now;
    elapsed=Core.listened(elapsed,wall,!audio.paused&&!audio.seeking&&delta>0&&delta<4);
    if(elapsed>=30&&currentEpisode) track('listen',currentEpisode.id);
  });
  audio.addEventListener('seeking',()=>{previousTime=audio.currentTime;previousWall=performance.now();});
  audio.addEventListener('error',()=>{notice='Ljudfilen kunde inte spelas. Försök Spela igen eller välj Nästa.';$('#player-status').textContent=notice;});
  $('#play-pause').onclick=()=>{if(audio.paused&&currentEpisode)void play(currentEpisode);else audio.pause();};
  document.querySelectorAll('[data-skip]').forEach(b=>b.onclick=()=>{audio.currentTime=Math.max(0,Math.min(audio.duration||Infinity,audio.currentTime+Number(b.dataset.skip)));});
  $('#seek').oninput=ev=>{if(Number.isFinite(audio.duration))audio.currentTime=Number(ev.target.value)/100*audio.duration;};
  $('#speed').onclick=()=>{const rates=[1,1.25,1.5,1.75,2];audio.playbackRate=rates[(rates.indexOf(audio.playbackRate)+1)%rates.length];$('#speed').textContent=audio.playbackRate+'×';};
  $('#player-open').onclick=()=>{if(currentEpisode)navigate(url('avsnitt',{id:currentEpisode.id}));};
  function syncAudio(){const paused=audio.paused;$('#play-pause').innerHTML=icon(paused?'play':'pause');$('#play-pause').setAttribute('aria-label',paused?'Spela':'Pausa');$('#elapsed').textContent=duration(audio.currentTime);$('#total').textContent=duration(audio.duration);$('#seek').value=Number.isFinite(audio.duration)?audio.currentTime/audio.duration*100:0;const big=$('#big-play');if(big&&$('.full-player')?.dataset.episode===currentEpisode?.id){big.innerHTML=icon(paused?'play':'pause');big.setAttribute('aria-label',paused?'Spela avsnittet':'Pausa avsnittet');}const position=$('#big-seek');if(position&&$('.full-player')?.dataset.episode===currentEpisode?.id){position.value=$('#seek').value;$('#big-elapsed').textContent=duration(audio.currentTime);$('#big-total').textContent=duration(audio.duration);}}
  for(const event of ['timeupdate','play','pause','loadedmetadata','ended'])audio.addEventListener(event,syncAudio);
  async function play(e,autoplay=true) {
    const request=++playbackRequest;
    if(currentEpisode?.id!==e.id)audio.pause();
    player.hidden=false;document.body.classList.add('has-player');$('#player-title').textContent=episodeTitle(e);$('#player-status').textContent='Hämtar avsnitt…';$('#player-image').src='assets/channels/'+visual(e.channel).image+'-square.webp?v=3';
    if(!e.audio){try{e=await detail('episodes',e.id);}catch{if(request!==playbackRequest)return;notice='Avsnittet finns inte tillgängligt. Välj Nästa eller ett annat avsnitt.';updateQueue();return;}}
    if(request!==playbackRequest)return;
    if(!Core.safePath(e.audio)){notice='Ljudfilen finns inte tillgänglig. Välj Nästa.';updateQueue();return;}
    const changed=currentEpisode?.id!==e.id||audio.getAttribute('src')!==e.audio;
    if(changed){audio.preload='metadata';const rate=audio.playbackRate;audio.pause();currentEpisode=e;audio.src=e.audio;audio.playbackRate=rate;elapsed=0;previousTime=0;}
    currentEpisode=e;
    $('#player').hidden=false;$('#player-title').textContent=episodeTitle(e);$('#player-status').textContent=autoplay?channel(e.channel):'Sparad kö. Tryck på Spela för att fortsätta.';$('#player-image').src='assets/channels/'+visual(e.channel).image+'-square.webp?v=3';
    document.body.classList.add('has-player');
    if(!player.dataset.initialized){player.dataset.initialized='true';compactPlayer(matchMedia('(max-width: 650px)').matches);}
    if('mediaSession' in navigator){try{navigator.mediaSession.metadata=new MediaMetadata({title:episodeTitle(e),artist:channel(e.channel),album:'Morgonpodden',artwork:[{src:new URL($('#player-image').src).href,sizes:'640x640',type:'image/webp'}]});}catch{}}
    if(autoplay){try{await audio.play();if(request!==playbackRequest)return;notice='';}catch(error){if(request!==playbackRequest||error.name==='AbortError')return;notice=error.name==='NotAllowedError'?'Automatisk start blockerades. Tryck på Spela för att fortsätta.':'Ljudfilen kunde inte spelas. Försök Spela igen eller välj Nästa.';}}
    updateQueue();syncAudio();persist();
  }
  if('mediaSession' in navigator){for(const [action,handler] of Object.entries({play:()=>currentEpisode&&play(currentEpisode),pause:()=>audio.pause(),nexttrack:()=>advance(),previoustrack:()=>advance(-1),seekbackward:()=>{audio.currentTime=Math.max(0,audio.currentTime-15);},seekforward:()=>{if(Number.isFinite(audio.duration))audio.currentTime=Math.min(audio.duration,audio.currentTime+15);}})){try{navigator.mediaSession.setActionHandler(action,handler);}catch{}}}
  main.addEventListener('toggle',async event=>{
    const node=event.target;
    if(!node.matches?.('details.episode')||!node.open)return;
    main.querySelectorAll('details.episode[open]').forEach(other=>{if(other!==node)other.open=false;});
    const body=node.querySelector('.episode-body');
    try {
      const e=await detail('episodes',node.dataset.id);
      if(!node.isConnected)return;
      body.innerHTML='<button class="primary play">▶ Spela avsnittet</button><h3>Om avsnittet</h3><p>'+esc(e.description)+'</p><h3>Ämnen</h3><div class="tags">'+(tags(e)||'<span class="muted">Ämnen saknas för detta äldre avsnitt.</span>')+'</div><p class="channel-link"><a href="'+url('kanal',{id:e.channel})+'">Om kanalen '+esc(channel(e.channel))+' ↗</a></p><h3>Artiklar i avsnittet</h3>'+(e.articles?.length?e.articles.map(articleCard).join(''):'<p class="muted">Detta avsnitt saknar separata redaktionella artiklar.</p>');
      body.querySelector('.play').onclick=()=>startFrom(e.id,node.closest('[data-context]')?.dataset.context);body.insertAdjacentHTML('afterbegin','<a class="open-episode" href="'+url('avsnitt',{id:e.id})+'">Öppna stor spelare '+icon('arrow-up-right')+'</a>');
      if(node.getBoundingClientRect().top<0||node.getBoundingClientRect().top>innerHeight*.5)node.scrollIntoView({block:'start',behavior:'instant'});
    } catch {body.textContent='Avsnittet kunde inte laddas. Stäng och öppna för att försöka igen.';}
  },true);
  async function collection(key, target, token, maximum=Infinity, order='latest') {
    const data=manifest.collections[key]||{count:0,pages:[]};
    if(!data.count){target.innerHTML='<p class="empty">Inget publicerat innehåll i detta urval ännu.</p>';return;}
    let page=0;const rows=[];const paths=Core.collectionPaths(manifest,key,order);
    if(!paths){target.innerHTML='<p class="empty">Historisk ordning är ännu inte tillgänglig för detta äldre arkiv. Välj Senast publicerat.</p>';return;}
    const list=document.createElement('div');list.className=key.startsWith('articles')?'article-grid':'episode-list';
    const button=document.createElement('button');button.className='more';button.textContent='Visa fler';
    target.append(list,button);
    async function next(){button.disabled=true;try{const chunk=await json(paths[page]);if(token!==routeToken)return;const batch=[...chunk.items].sort(order==='oldest'?Core.compareHistory:Core.compareLatest).slice(0,maximum-page*24);rows.push(...batch);batch.forEach(e=>latestRows.set(e.id,e));list.insertAdjacentHTML('beforeend',batch.map(key.startsWith('articles')?articleCard:episodeRow).join(''));page++;if(key.startsWith('episodes'))registerContext(list,rows,page<paths.length?{kind:'pages',paths,page,order}:null,key==='episodes'?'Senaste från alla kanaler':key.startsWith('episodes/channel/')?channel(key.split('/').pop())+' · '+(order==='oldest'?'Första avsnittet först':'Senast publicerat'):'Valt ämne');button.hidden=page>=paths.length||page*24>=maximum;}catch{button.textContent='Kunde inte ladda. Försök igen';}button.disabled=false;}
    button.onclick=next;await next();
  }
  // Homepage shows the newest item per channel, not an arbitrary first item in a global feed.
  // One bounded first page per channel establishes the correct global order,
  // even if the producer manifest has no optional latest summary. Never fetch
  // episode details or the complete archive just to order the homepage.
  async function homeLatest(kind, target, token, initial=8) {
    if(kind==='episodes'&&manifest.collections.episodes?.pages?.length){
      const paths=manifest.collections.episodes.pages,rows=[];let page=0,shown=0;
      const list=document.createElement('div');list.className='episode-list';const more=document.createElement('button');more.className='more';more.textContent='Visa fler avsnitt';target.append(list,more);
      async function reveal(){more.disabled=true;try{if(shown>=rows.length&&page<paths.length){const data=await json(paths[page]);if(token!==routeToken)return;rows.push(...data.items.toSorted(Core.compareLatest));page++;}const batch=rows.slice(shown,shown+8);batch.forEach(e=>latestRows.set(e.id,e));list.insertAdjacentHTML('beforeend',batch.map(episodeRow).join(''));shown+=batch.length;registerContext(list,rows,page<paths.length?{kind:'pages',paths,page,order:'latest'}:null,'Senaste från alla kanaler');more.hidden=shown>=rows.length&&page>=paths.length;}catch{more.textContent='Kunde inte ladda. Försök igen';}more.disabled=false;}
      more.onclick=reveal;await reveal();return;
    }
    const eligible=manifest.channels.filter(c=>(manifest.collections[kind+'/channel/'+c.id]?.count||0)>0);
    if(!eligible.length){target.innerHTML='<p class="empty">Inget publicerat innehåll ännu.</p>';return;}
    const fallbackStreams=[];
    const results=await Promise.allSettled(eligible.map(async c=>{
      const data=manifest.collections[kind+'/channel/'+c.id];
      if(data.latest&&!data.pages?.length)return data.latest;
      const page=await json(data.pages[0]);
      fallbackStreams.push({paths:data.pages,page:1,buffer:[...(page.items||[])].sort(Core.compareLatest)});
      return [...(page.items||[])].sort(Core.compareLatest)[0]||null;
    }));
    if(token!==routeToken)return;
    const ordered=results.filter(r=>r.status==='fulfilled'&&r.value).map(r=>r.value).sort(Core.compareLatest);
    if(!ordered.length){target.innerHTML='<p class="empty">Innehållet kunde inte hämtas. Försök ladda sidan igen.</p>';return;}
    const list=document.createElement('div');list.className=kind==='articles'?'article-grid':'episode-list';
    const more=document.createElement('button');more.className='more';more.type='button';
    target.append(list,more);
    let shown=0;
    async function reveal(){
      more.disabled=true;
      const rows=ordered.slice(shown,shown+initial);
      rows.forEach(e=>latestRows.set(e.id,e));list.insertAdjacentHTML('beforeend',rows.map(kind==='articles'?articleCard:episodeRow).join(''));
      shown+=rows.length;
      more.hidden=shown>=ordered.length;
      more.textContent='Visa fler kanaler ('+shown+' av '+ordered.length+')';
      more.disabled=false;
      if(kind==='episodes')registerContext(list,ordered,fallbackStreams.length?{kind:'merge',streams:fallbackStreams}:null,'Senaste från alla kanaler');
    }
    more.onclick=reveal;
    await reveal();
    if(results.some(r=>r.status==='rejected')){const note=document.createElement('p');note.className='muted';note.textContent='Vissa kanaler kunde inte hämtas just nu.';target.append(note);}
  }
  function filters(kind,p) {
    return '<form id="filters"><label>Kanal<select name="channel"><option value="">Alla kanaler</option>'+manifest.channels.map(c=>'<option value="'+esc(c.id)+'" '+(p.get('channel')===c.id?'selected':'')+'>'+esc(c.name)+'</option>').join('')+'</select></label><button type="submit">Visa</button></form>';
  }
  async function render() {
    const token=++routeToken,p=new URLSearchParams(location.search),page=location.pathname.split('/').pop().replace('.html','')||'idag';
    document.body.dataset.page=page;contexts.clear();
    const kind=page==='artiklar'?'articles':'episodes';
    $('#nav').querySelectorAll('a').forEach(a=>{if(a.getAttribute('href')===(['kanal','avsnitt'].includes(page)?'kanaler.html':page==='artikel'?'artiklar.html':page==='index'?'idag.html':page+'.html'))a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    main.innerHTML='<p role="status">Hämtar innehåll…</p>';
    try {
      if(page==='artikel') {
        const a=await detail('articles',p.get('id')||'');if(token!==routeToken)return;
        document.title=a.title+' | Morgonpod';
        main.innerHTML='<article class="reading"><a class="back-link" href="artiklar.html">'+icon('arrow-left')+' Artiklar</a><figure class="reading-illustration">'+cover(a.channel,'reading-cover',true)+'<figcaption>Illustrativ kanalbild</figcaption></figure><small>'+metadata(a)+'</small><h1>'+esc(a.title)+'</h1><p class="lead">'+esc(a.summary)+'</p><a class="article-audio" href="'+url('avsnitt',{id:a.episode_id})+'">'+icon('headphones')+' Lyssna på tillhörande avsnitt '+icon('chevron-right')+'</a><div class="prose">'+String(a.body||'').split(/\n+/).map(x=>'<p>'+esc(x)+'</p>').join('')+'</div>'+(a.assessment?'<h2>Redaktionens bedömning</h2><p>'+esc(a.assessment)+'</p>':'')+(a.open_questions?.length?'<h2>Öppna frågor</h2><ul>'+a.open_questions.map(q=>'<li>'+esc(q)+'</li>').join('')+'</ul>':'')+'<div class="tags">'+tags(a)+'</div><h2>Källor</h2><ul>'+(a.sources||[]).filter(s=>/^https?:\/\//.test(s.url||'')).map(s=>'<li><a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.title||s.url)+'</a></li>').join('')+'</ul><h2>Lyssna på avsnittet</h2><a href="'+url('avsnitt',{id:a.episode_id})+'">'+esc(a.episode_title||'Öppna poddavsnittet')+'</a>'+(a.previous_reporting?.length?'<h2>Tidigare rapportering</h2>'+a.previous_reporting.filter(x=>typeof x==='string').map(id=>'<p><a href="'+url('artikel',{id})+'">Tidigare artikel</a></p>').join(''):'')+'</article>';
        track('article',a.id);return;
      }
      if(page==='avsnitt') {const e=await detail('episodes',p.get('id')||'');if(token!==routeToken)return;document.title=episodeTitle(e)+' | Morgonpodden';main.innerHTML='<div class="episode-screen"><a class="back-link" href="'+url('kanal',{id:e.channel})+'">'+icon('arrow-left')+' Till kanalen '+esc(channel(e.channel))+'</a><div class="full-player" data-episode="'+esc(e.id)+'">'+cover(e.channel,'large-cover',true)+'<h1>'+esc(channel(e.channel))+'</h1><h2>'+esc(episodeTitle(e))+'</h2><p>'+esc(prettyDate(e))+(Core.isIntro(e)?' · Avsnitt 1 / Uppstart':'')+'</p><div class="big-timeline"><input type="range" id="big-seek" min="0" max="100" value="0" step="0.1" aria-label="Position i avsnittet"><div><span id="big-elapsed">0:00</span><span id="big-total">'+duration(e.duration_seconds)+'</span></div></div><div class="big-transport"><button id="back15" aria-label="Bakåt 15 sekunder">'+icon('rotate-ccw')+'<small>15</small></button><button id="big-play" aria-label="Spela avsnittet">'+icon('play')+'</button><button id="forward15" aria-label="Framåt 15 sekunder">'+icon('rotate-cw')+'<small>15</small></button></div><button id="big-speed" aria-label="Ändra hastighet">'+audio.playbackRate+'×</button></div><section class="episode-info"><h2>Om avsnittet</h2><p>'+esc(e.description||'')+'</p><div class="tags">'+tags(e)+'</div><h2>Artiklar i avsnittet</h2>'+(e.articles?.length?e.articles.map(articleCard).join(''):'<p>Inga separata artiklar till detta avsnitt.</p>')+'</section></div>';$('#big-play').onclick=()=>{if(currentEpisode?.id===e.id&&!audio.paused)audio.pause();else {if(queue.current?.id!==e.id){const c=detailContext?.id===e.id?detailContext:null;queue.start(c?.rows||[e],e.id,c?.source||null,c?.label||channel(e.channel));}void play(e);}};$('#back15').onclick=()=>{if(currentEpisode?.id===e.id)audio.currentTime=Math.max(0,audio.currentTime-15);};$('#forward15').onclick=()=>{if(currentEpisode?.id===e.id)audio.currentTime=Math.min(audio.duration||Infinity,audio.currentTime+15);};$('#big-seek').oninput=ev=>{if(currentEpisode?.id===e.id&&Number.isFinite(audio.duration))audio.currentTime=Number(ev.target.value)/100*audio.duration;};$('#big-speed').onclick=()=>{$('#speed').click();$('#big-speed').textContent=audio.playbackRate+'×';};$('.full-player').insertAdjacentHTML('beforeend','<p id="up-next"></p><button id="full-queue">Visa uppspelningskön</button>');$('#full-queue').onclick=()=>showQueue(true);if(currentEpisode?.id===e.id)syncAudio();updateQueue();return;}
      if(page==='mer') {
        document.title='Utseende | Morgonpodden';main.innerHTML='<div class="page-heading"><h1>Mer</h1><p>Gör Morgonpodden bekväm att läsa.</p></div><section class="settings"><h2>Utseende</h2><p>Välj ett läge eller låt enhetens inställning styra.</p><fieldset><legend class="sr-only">Färgtema</legend>'+[['light','Ljust läge','sun'],['dark','Mörkt läge','moon'],['system','Följ systemet','monitor']].map(([v,t,i])=>'<label class="theme-option">'+icon(i)+'<span>'+t+'</span><input type="radio" name="theme" value="'+v+'" '+(document.documentElement.dataset.theme===v?'checked':'')+'></label>').join('')+'</fieldset></section><div class="more-links"><a href="lyssna.html">'+icon('headphones')+' Alla avsnitt '+icon('chevron-right')+'</a><a href="statistik.html">'+icon('bar-chart-2')+' Statistik '+icon('chevron-right')+'</a><a href="https://t.me/+jlPUjsmjlE03NDFk" target="_blank" rel="noopener noreferrer">Morgonpodden på Telegram '+icon('external-link')+'</a></div>';main.querySelectorAll('[name="theme"]').forEach(r=>r.onchange=()=>setTheme(r.value));return;
      }
      if(page==='kanaler') {
        document.title='Kanaler | Morgonpodden';
        main.innerHTML='<div class="page-heading"><h1>Kanaler</h1><p>Välj perspektiv. Lyssna och förstå mer.</p></div><label class="search-field">'+icon('search')+'<input id="channel-query" type="search" placeholder="Sök bland kanaler" aria-label="Sök bland kanaler"></label><div class="chips" id="categories">'+['Alla',...new Set(manifest.channels.map(c=>visual(c.id).category))].map((c,i)=>'<button type="button" class="chip '+(!i?'selected':'')+'" aria-pressed="'+!i+'">'+c+'</button>').join('')+'</div><div class="channel-directory"></div>';
        let category='Alla';const draw=()=>{const q=$('#channel-query').value.toLocaleLowerCase('sv');const rows=manifest.channels.filter(c=>(category==='Alla'||visual(c.id).category===category)&&(channel(c.id)+' '+c.description).toLocaleLowerCase('sv').includes(q));$('.channel-directory').innerHTML=rows.map(channelCard).join('')||'<p class="empty">Inga kanaler matchar din sökning.</p>';};$('#channel-query').oninput=draw;$('#categories').onclick=e=>{const b=e.target.closest('button');if(!b)return;category=b.textContent;$('#categories').querySelectorAll('button').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',x===b);});draw();};draw();return;
      }
      if(page==='kanal') {
        const id=p.get('id')||'',c=manifest.channels.find(c=>c.id===id);
        if(!c){main.innerHTML='<h1>Kanalen finns inte</h1><p><a href="kanaler.html">Visa alla kanaler</a></p>';return;}
        document.title=channel(id)+' | Morgonpodden';const tab=p.get('tab')||'episodes';
        main.innerHTML='<a class="back-link" href="kanaler.html">'+icon('arrow-left')+' Alla kanaler</a><header class="channel-hero">'+cover(id,'',true)+'<div><span class="eyebrow">'+esc(visual(id).category)+'</span><h1>'+esc(channel(id))+'</h1><p>'+esc(c.description||'')+'</p></div></header><div class="channel-layout"><section class="channel-main"><nav class="tabs" aria-label="Kanalinnehåll">'+[['episodes','Avsnitt'],['articles','Artiklar'],['about','Om kanalen']].map(([t,label])=>'<a href="'+url('kanal',{id,tab:t})+'" '+(t===tab?'aria-current="page"':'')+'>'+label+'</a>').join('')+'</nav><div id="channel-content"></div></section><aside class="secondary"><h2>Senaste artiklar</h2><div id="related"></div></aside></div>';
        if(tab==='about')$('#channel-content').innerHTML='<section class="channel-about"><h2>Vad bevakas?</h2><p>'+esc(c.description||'')+'</p><h2>Publicering</h2><p>Här samlas kanalens publicerade avsnitt och artiklar. Utgivningen följer kanalens redaktionella schema.</p><p>Omslagsbilden är en illustrativ kanalbild, inte ett foto från en specifik nyhetshändelse.</p></section>';
        else {const kind=tab==='articles'?'articles':'episodes',order=p.get('sort')||'latest';$('#channel-content').innerHTML='<div class="archive-tools"><p>'+Number(manifest.collections[kind+'/channel/'+id]?.count||0)+' '+(tab==='articles'?'artiklar':'avsnitt')+'</p><label>Sortera<select id="archive-sort"><option value="latest">Senast publicerat</option><option value="oldest">Första avsnittet först</option></select></label></div><div id="channel-list"></div>';$('#archive-sort').value=order;$('#archive-sort').onchange=e=>navigate(url('kanal',{id,tab,sort:e.target.value}));await collection(kind+'/channel/'+id,$('#channel-list'),token,Infinity,order);}
        if(token!==routeToken)return;const historyPaths=Core.collectionPaths(manifest,'episodes/channel/'+id,'oldest');if(historyPaths?.length){const historyPage=await json(historyPaths[0]);if(token!==routeToken)return;const intro=historyPage.items.find(Core.isIntro);if(intro)$('.channel-hero').insertAdjacentHTML('afterend','<a class="intro-link" href="'+url('avsnitt',{id:intro.id})+'">Starta med uppstartsavsnittet '+icon('chevron-right')+'</a>');}await collection('articles/channel/'+id,$('#related'),token,4);return;
      }
      if(page==='statistik') {await statistics(token);return;}
      if(page==='utforska') {
        document.title='Sök | Morgonpodden';
        main.innerHTML='<div class="page-heading"><h1>Sök</h1><p>Hitta avsnitt, artiklar och kanaler.</p></div><form id="search"><label for="query">Sök i hela arkivet</label><div class="search-row"><input type="search" id="query" minlength="2" required placeholder="Till exempel Östersjön"><button>Sök</button></div></form><div class="chips" id="search-types">'+[['all','Alla'],['episodes','Avsnitt'],['articles','Artiklar'],['channels','Kanaler']].map(([v,t],i)=>'<button class="chip '+(!i?'selected':'')+'" data-type="'+v+'" aria-pressed="'+!i+'">'+t+'</button>').join('')+'</div><section id="results" aria-live="polite"></section><div class="search-topics"><h2>Utforska ämnen</h2><div class="tags">'+manifest.topics.map(t=>'<a class="tag" href="'+url('amne',{tag:t})+'">'+esc(t.replace(/-/g,' '))+'</a>').join('')+'</div></div>';
        let searchId=0,allRows=[],channelRows=[],filter='all',count=24;
        function draw(){const rows=allRows.filter(x=>filter==='all'||x.type===filter);const channels=filter==='all'||filter==='channels'?channelRows:[];const results=$('#results');results.innerHTML='<p>'+Number(rows.length+channels.length)+' träffar</p>'+(!rows.length&&!channels.length?'<p class="empty">Inga träffar. Prova ett helt ord, färre sökord eller välj ett ämne nedan.</p>':'')+(channels.length?'<div class="channel-directory">'+channels.map(c=>channelCard(c).replace('</a>','<span class="search-channel-description">Kanal · '+esc(c.description||'')+'</span></a>')).join('')+'</div>':'')+rows.slice(0,count).map(x=>x.type==='articles'?articleCard(x):episodeRow(x)).join('')+(rows.length>count?'<button id="search-more" class="more">Visa fler</button>':'');registerContext(results,rows.filter(x=>x.type==='episodes'),null,'Sök: '+$('#query').value);$('#search-more')?.addEventListener('click',()=>{count+=24;draw();});}
        async function suggest(terms,request){
          if(allRows.length||channelRows.length||!terms.length)return;
          try{const hints=await json('search-hints.json');if(token!==routeToken||request!==searchId)return;const words=[...new Set(terms.flatMap(t=>hints[t]||[]))].slice(0,5);if(words.length){$('#results').insertAdjacentHTML('beforeend','<p>Menade du något av dessa hela ord?</p><div class="chips">'+words.map(w=>'<button class="chip search-suggestion" type="button">'+esc(w)+'</button>').join('')+'</div>');$('#results').querySelectorAll('.search-suggestion').forEach(b=>b.onclick=()=>{$('#query').value=b.textContent;$('#search').requestSubmit();});}}catch{}
        }
        $('#search-types').onclick=ev=>{const b=ev.target.closest('button');if(!b)return;filter=b.dataset.type;count=24;$('#search-types').querySelectorAll('button').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',x===b);});draw();};
        $('#search').onsubmit=async event=>{event.preventDefault();const request=++searchId;const query=$('#query').value.toLocaleLowerCase('sv'),terms=query.match(/[\wåäö]{2,}/g)||[];$('#results').textContent='Söker…';try{let matches;for(const term of terms.slice(0,6)){const bucket=(await hash(term)).slice(0,2);const data=manifest.search_buckets.includes(bucket)?await json('catalog/search/'+bucket+'.json'):{};const rows=data[term]||[];if(matches){const ids=new Set(rows.map(r=>r.id));matches=matches.filter(x=>ids.has(x.id));}else matches=rows;}if(token!==routeToken||request!==searchId)return;allRows=[...new Map((matches||[]).map(x=>[x.id,x])).values()].sort(Core.compareLatest);channelRows=manifest.channels.filter(c=>terms.every(t=>(channel(c.id)+' '+c.description).toLocaleLowerCase('sv').includes(t)));count=24;draw();void suggest(terms,request);}catch{$('#results').textContent='Sökningen kunde inte slutföras. Försök igen.';}};
        return;
      }
      if(page==='amne') {main.innerHTML='<h1>'+esc(p.get('tag')||'Ämne')+'</h1><h2>Poddavsnitt</h2><div id="episodes"></div><h2>Artiklar</h2><div id="articles"></div>';await collection('episodes/topic/'+p.get('tag'),$('#episodes'),token);await collection('articles/topic/'+p.get('tag'),$('#articles'),token);return;}
      if(page==='idag'||page==='index') {
        document.title='Idag | Morgonpod';
        main.innerHTML='<p class="today-date">'+esc(new Intl.DateTimeFormat('sv-SE',{weekday:'long',day:'numeric',month:'long',timeZone:'Europe/Stockholm'}).format(new Date()))+'</p><div class="home-layout"><section class="home-main"><div id="hero"></div><div class="section-heading home-first"><h1>Senaste poddavsnitten</h1><a href="lyssna.html">Visa alla '+icon('chevron-right')+'</a></div><div id="episodes" class="home-episodes"></div><div class="section-heading"><h2>Utforska kanalerna</h2><a href="kanaler.html">Alla kanaler '+icon('chevron-right')+'</a></div><div class="home-channels">'+manifest.channels.map(c=>channelCard(c).replace('</a>','<span class="search-channel-description">Kanal · '+esc(c.description||'')+'</span></a>')).join('')+'</div></section><aside class="home-aside"><div class="section-heading"><h2>Senaste artiklar</h2><a href="artiklar.html">Visa alla '+icon('chevron-right')+'</a></div><div id="articles"></div></aside></div>';
        await homeLatest('episodes',$('#episodes'),token,8);if(token!==routeToken)return;
        const first=$('#episodes details');if(first){const e=latestRows.get(first.dataset.id);if(token!==routeToken)return;$('#hero').innerHTML='<div class="hero">'+cover(e.channel,'',true)+'<div class="hero-copy"><span class="eyebrow">'+(e.published_at?'Senast publicerat':'Aktuell utgåva')+' · '+esc(prettyDate(e))+'</span><h2>'+esc(channel(e.channel))+'</h2><div class="hero-play"><button class="hero-direct" data-play="'+esc(e.id)+'" aria-label="Spela '+esc(episodeTitle(e))+'">'+icon('play')+'</button><a href="'+url('avsnitt',{id:e.id})+'"><strong>'+esc(episodeTitle(e))+'</strong><small>'+duration(e.duration_seconds)+(Core.isIntro(e)?' · Avsnitt 1 / Uppstart':'')+'</small></a>'+icon('chevron-right')+'</div></div></div>';$('#hero').dataset.context=$('#episodes .episode-list').dataset.context;}
        await homeLatest('articles',$('#articles'),token,8);
        return;
      }
      const title=kind==='articles'?'Artiklar':'Lyssna';document.title=title+' | Morgonpod';
      main.innerHTML='<div class="page-heading"><small>'+(kind==='articles'?'NYHETER OCH SAMMANHANG':'DITT PODDBIBLIOTEK')+'</small><h1>'+title+'</h1><p>'+(kind==='articles'?'Självständiga nyhetstexter med källor och tidigare rapportering.':'Välj kanal eller hitta ditt nästa poddavsnitt.')+'</p></div>'+filters(kind,p)+'<p><a href="utforska.html">Sök i hela arkivet ↗</a></p><div id="listing"></div><section id="ranking"></section>';
      $('#filters').onsubmit=ev=>{ev.preventDefault();navigate(url(page,{channel:new FormData(ev.target).get('channel')}));};
      await collection(kind+(p.get('channel')?'/channel/'+p.get('channel'):''),$('#listing'),token);
      if(kind==='episodes'){try{const stats=await json('stats.json');if(token!==routeToken)return;const rows=Core.ranking(stats.episodes);if(rows.length)$('#ranking').innerHTML='<h2>Mest lyssnade på webben</h2><ol>'+rows.map(x=>'<li><a href="'+url('avsnitt',{id:x.id})+'">'+esc(x.title||x.id)+'</a> · '+x.count+'</li>').join('')+'</ol>';}catch{}}
    } catch (error) {console.error(error);if(token===routeToken)main.innerHTML='<h1>Innehållet kunde inte hämtas</h1><p>Kontrollera anslutningen och försök igen.</p><button id="retry">Försök igen</button>';$('#retry')?.addEventListener('click',render);}
  }
  async function statistics(token) {
    main.innerHTML='<h1>Statistik</h1><p>Webbplatsens lyssningar räknas efter 30 sekunders faktisk uppspelning. Telegram ingår inte.</p><div id="stats-content"></div>';
    try{const s=await json('stats.json');if(token!==routeToken)return;
      if(!s.updated_at){$('#stats-content').innerHTML='<p class="empty">Ingen insamlad statistik ännu. Statistikanslutningen är inte aktiverad.</p>';return;}
      $('#stats-content').innerHTML='<p>Uppdaterat '+esc(s.updated_at)+'</p><label>Period<select id="period"><option value="7">7 dagar</option><option value="30">30 dagar</option><option value="36500">All historik</option></select></label><label>Kanal<select id="stats-channel"><option value="">Alla</option>'+manifest.channels.map(c=>'<option value="'+esc(c.id)+'">'+esc(c.name)+'</option>').join('')+'</select></label><div id="stats-rows"></div>';
      const draw=()=>{const cutoff=new Date(Date.now()-Number($('#period').value)*86400000).toISOString().slice(0,10),ch=$('#stats-channel').value;const days=(s.daily||[]).filter(x=>x.date>=cutoff&&(!ch||x.channel===ch));$('#stats-rows').innerHTML='<table><thead><tr><th>Datum</th><th>Kanal</th><th>Lyssningar</th><th>Artikelvisningar</th></tr></thead><tbody>'+days.map(d=>'<tr><td>'+esc(d.date)+'</td><td>'+esc(channel(d.channel))+'</td><td>'+Number(d.listens||0)+'</td><td>'+Number(d.views||0)+'</td></tr>').join('')+'</tbody></table>';};$('#period').onchange=draw;$('#stats-channel').onchange=draw;draw();
    }catch{$('#stats-content').textContent='Statistik kunde inte hämtas.';}
  }
  function navigate(href){history.pushState({},'',href);render();window.scrollTo(0,0);main.focus({preventScroll:true});}
  document.addEventListener('click',e=>{const a=e.target.closest('a');if(!a||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||e.button!==0||a.target)return;const u=new URL(a.href);if(u.origin===location.origin&&u.pathname.endsWith('.html')&&u.pathname.startsWith(location.pathname.slice(0,location.pathname.lastIndexOf('/')+1))){e.preventDefault();if(u.pathname.endsWith('/avsnitt.html')){const context=contexts.get(a.closest('[data-context]')?.dataset.context);detailContext=context?{...context,id:u.searchParams.get('id')}:null;}navigate(u.pathname+u.search);}});
  window.addEventListener('popstate',render);
  try{config=await json('analytics-config.json');if(config.goatcounter&&/^https:\/\/[a-z0-9-]+\.goatcounter\.com\/count$/.test(config.goatcounter)){window.goatcounter={no_onload:true};await new Promise(resolve=>{const s=document.createElement('script');s.src='https://gc.zgo.at/count.js';s.dataset.goatcounter=config.goatcounter;s.async=true;s.onload=resolve;s.onerror=resolve;document.head.append(s);setTimeout(resolve,2500);});}}catch{}
  try{manifest=await json('catalog/manifest.json');manifest.channels=manifest.channels.map(c=>c.id==='ibat'?{...c,name:'IBAT - Informationsförsörjning'}:c);await render();try{const saved=JSON.parse(localStorage.getItem('morgonpod-playback')||'null');if(queue.restore(saved)){resumePosition=Number.isFinite(saved.position)?Math.max(0,saved.position):0;audio.playbackRate=[1,1.25,1.5,1.75,2].includes(saved.rate)?saved.rate:1;await play(queue.current,false);}}catch{}}catch{main.innerHTML='<h1>Arkivet är tillfälligt otillgängligt</h1><p>Försök ladda sidan igen.</p>';}
  if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
})();

