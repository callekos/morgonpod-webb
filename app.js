/* Morgonpod: one application, one persistent audio element, bounded archive requests. */
const Core = {
  escape: value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
  safePath: value => typeof value === 'string' && /^(catalog|episodes)\/[\w./-]+$/.test(value) && !value.includes('..'),
  listened: (elapsed, delta, playing) => elapsed + (playing && delta > 0 && delta < 2 ? delta : 0),
  isIntro: e => e.is_intro === true || e.kind === 'introduction' || /:introduction$/.test(e.id || ''),
  published: e => Date.parse(e.channel==='mediesvepet' ? e.date || '' : e.published_at || e.date || '') || 0,
  historicalMedia: e => e.channel === 'mediesvepet' && !!e.date && !!e.published_at && Number.isFinite(Date.parse(e.published_at)) && Core.stockholmDay(new Date(e.published_at)) !== e.date,
  displayDate: e => e.channel === 'mediesvepet' && e.date ? e.date : e.published_at || e.date || '',
  prettyDate: e => {
    const raw=Core.displayDate(e);if(!raw)return '';
    const format=(value,timed)=>{const d=new Date(value);return Number.isNaN(d.getTime())?'':new Intl.DateTimeFormat('sv-SE',{day:'numeric',month:'short',timeZone:'Europe/Stockholm',...(timed?{hour:'2-digit',minute:'2-digit'}:{})}).format(d);};
    const historical=Core.historicalMedia(e);
    if(e.channel === 'mediesvepet' && e.date)return format(raw,false)+(historical?' · efterhandsproducerat':'');
    return format(raw,!!e.published_at);
  },
  channelOrder: [],
  channelGroups: channels => ['monitoring','knowledge'].map(type=>({type,channels:channels.filter(c=>c.channel_type===type).sort((a,b)=>(a.display_order??Number.MAX_SAFE_INTEGER)-(b.display_order??Number.MAX_SAFE_INTEGER)||a.id.localeCompare(b.id))})),
  editorialRank: e => Core.isIntro(e) ? 0 : Number(e.episode_order)||2,
  compareLatest: (a,b) => Core.published(b)-Core.published(a) || Number(Core.isIntro(a))-Number(Core.isIntro(b)) || ((Core.catalogOrder||Core.channelOrder).indexOf(a.channel) < 0 ? 99 : (Core.catalogOrder||Core.channelOrder).indexOf(a.channel))-((Core.catalogOrder||Core.channelOrder).indexOf(b.channel) < 0 ? 99 : (Core.catalogOrder||Core.channelOrder).indexOf(b.channel)) || Core.editorialRank(b)-Core.editorialRank(a) || String(a.id).localeCompare(String(b.id)),
  special: e => e.kind==='special'||/:special:/.test(e.id||'')||e.kind==='historical'&&!/:replacement_ordinary:/.test(e.id||''),
  ordinary: e => e.kind==='daily'||/:replacement_ordinary:/.test(e.id||''),
  contentType: e => Core.isIntro(e)?'introduction':(['course','grundkurs'].includes(e.content_type||e.kind)||/\bgrundkurs\b/i.test(e.title||''))?'course':Core.special(e)?'special':Core.ordinary(e)?'ordinary':'archive',
  matchesContent: (e,filter) => !filter||filter==='all'||Core.contentType(e)===filter,
  stockholmDay: now => new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Stockholm',year:'numeric',month:'2-digit',day:'2-digit'}).format(now||new Date()),
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
Core.articleChanges = article => {
  if (!Array.isArray(article.editorial_notes) || !article.editorial_notes.length) return '';
  const esc = Core.escape;
  const safeLink = value => {try {const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:null;}catch{return null;}};
  const time = value => {const d=new Date(value);return typeof value==='string'&&/(?:Z|[+-]\d\d:\d\d)$/.test(value)&&Number.isFinite(d.getTime())?new Intl.DateTimeFormat('sv-SE',{dateStyle:'long',timeStyle:'short',timeZone:'Europe/Stockholm'}).format(d):null;};
  const notes = article.editorial_notes.map(note => {
    const label={correction:'Rättelse',update:'Uppdatering'}[note?.kind],at=time(note?.at),source=safeLink(note?.source_url);
    if(!label||!at||!source||typeof note.text!=='string'||!note.text.trim())return '<p>En ändringsnot kunde inte visas fullständigt.</p>';
    return '<section class="editorial-note"><h3>'+label+' <time datetime="'+esc(note.at)+'">'+esc(at)+'</time></h3><p>'+esc(note.text)+'</p><a href="'+esc(source)+'" target="_blank" rel="noopener noreferrer">Källa till '+label.toLocaleLowerCase('sv')+'</a>'+(note.audio_status==='original_not_regenerated'?'<p class="muted">Ljudet återger artikelns tidigare version.</p>':'<p class="muted">Ljudversionens överensstämmelse är inte verifierad.</p>')+'</section>';
  }).join('');
  const prior=(Array.isArray(article.history)?article.history:[]).filter(x=>x?.id===article.id&&x.episode_id===article.episode_id);
  const history=prior.length?'<details class="article-history"><summary>Tidigare artikelversioner</summary>'+prior.map(x=>'<section><h3>Version '+esc(x.revision||'')+'</h3>'+['summary','body','context'].map(k=>typeof x[k]==='string'&&x[k].trim()?'<p>'+esc(x[k])+'</p>':'').join('')+'</section>').join('')+'</details>':'';
  return '<section class="article-changes" aria-labelledby="article-changes-title"><h2 id="article-changes-title">Rättelser och uppdateringar</h2>'+notes+history+'</section>';
};
if (typeof module !== 'undefined') module.exports = Core;
if (typeof document !== 'undefined') (async () => {
  'use strict';
  const $ = s => document.querySelector(s), esc = Core.escape, main = $('#view'), audio = $('#audio');
  let superseded={}, withdrawn={}, manifest, currentEpisode, routeToken = 0, elapsed = 0, previousTime = 0, previousWall = performance.now(), config = {};
  const latestRows=new Map(), contexts=new Map();
  let contextNumber=0,detailContext=null,activeContextId=null;
  const registerContext=(target,rows,source,label,fresh=false)=>{if(fresh)contexts.delete(target.dataset.context);const id=(!fresh&&target.dataset.context)||String(++contextNumber);target.dataset.context=id;contexts.set(id,{rows:[...rows],source:source?JSON.parse(JSON.stringify(source)):null,label});return id;};
  const cache = new Map(), seen = new Set();
  const channel = id => id==='ibat'?'IBAT - Informationsförsörjning':manifest.channels.find(c=>c.id===id)?.name || id;
  const visuals={mediesvepet:{image:'mediesvepet',category:'Samhälle',color:'#b3946c',icon:'radio'},ibat:{image:'ibat',category:'Samhälle',color:'#19b8d0',icon:'database'},vald:{image:'vald',category:'Säkerhet',color:'#d54864',icon:'shield'},kek:{image:'kek',category:'Samhälle',color:'#ae8249',icon:'briefcase'},sjoomradet:{image:'sjoomradet',category:'Säkerhet',color:'#46758b',icon:'anchor'},lagstiftning:{image:'lagstiftning',category:'Kunskap',color:'#ba9a53',icon:'book-open'},ai_brottsbekampning:{image:'ai_brottsbekampning',category:'Kunskap',color:'#9184c8',icon:'monitor'},it_juridik:{image:'it_juridik',category:'Kunskap',color:'#619a91',icon:'shield'},verksamhetsutveckling:{image:'verksamhetsutveckling',category:'Kunskap',color:'#c58c59',icon:'grid'}};
  const visual=id=>visuals[id]||{image:'ibat',category:'Övrigt',color:'#19b8d0',icon:'radio'};
  const icon=name=>'<i class="icon icon-'+name+'" aria-hidden="true"></i>';
  let artStorage;try{artStorage=localStorage;}catch{}
  const art=ChannelArt.create(ChannelArtManifest,artStorage);
  const cover=(id,cls='',eager=false)=>{
    const square=cls==='large-cover',v=art.resolve(id,square);const sizes=['episode-cover','article-cover','queue-cover','brief-cover'].includes(cls)?'64px':cls==='channel-hero-cover'?'(min-width: 1625px) 1370px, (min-width: 1024px) calc(100vw - 255px), (min-width: 650px) calc(100vw - 68px), calc(100vw - 40px)':cls==='reading-cover'?'(min-width: 800px) 720px, 100vw':'(min-width: 1024px) 320px, 50vw';
    return '<img class="cover '+cls+'" data-art-channel="'+esc(id)+'" data-art-square="'+square+'" src="'+esc(v.src)+'" '+(!square?'srcset="'+esc(v.srcset)+'" sizes="'+sizes+'" ':'')+'style="object-position:'+esc(v.focal)+'" width="'+v.width+'" height="'+v.height+'" alt="" loading="'+(eager?'eager':'lazy')+'" decoding="async">';
  };
  function updateArtImage(img,id,square=false,styleId=art.selected){
    const v=art.resolve(id,square,styleId);img.dataset.artChannel=id;img.dataset.artSquare=String(square);delete img.dataset.artFallback;
    if(v.srcset)img.setAttribute('srcset',v.srcset);else img.removeAttribute('srcset');
    img.src=v.src;img.style.objectPosition=v.focal;
  }
  document.addEventListener('error',event=>{
    const img=event.target;if(!(img instanceof HTMLImageElement)||!img.dataset.artChannel||img.dataset.artFallback)return;
    updateArtImage(img,img.dataset.artChannel,img.dataset.artSquare==='true','v3');img.dataset.artFallback='true';
  },true);
  let artRequest=0;
  async function changeArt(id){
    if(!art.styles.some(s=>s.id===id))return;
    const request=++artRequest,status=$('#art-status');if(status)status.textContent='Hämtar bildserien…';
    if(status)status.setAttribute('aria-busy','true');
    try{
      if(id!=='v3')await Promise.all(ChannelArt.CHANNELS.map(channelId=>new Promise((resolve,reject)=>{
        const image=new Image(),timer=setTimeout(()=>reject(Error('timeout')),10000);
        image.onload=()=>{clearTimeout(timer);resolve();};image.onerror=()=>{clearTimeout(timer);reject(Error('image'));};image.src=art.resolve(channelId,false,id).small;
      })));
      if(request!==artRequest)return;
      art.select(id);document.querySelectorAll('img[data-art-channel]').forEach(img=>updateArtImage(img,img.dataset.artChannel,img.dataset.artSquare==='true'));
      if(currentEpisode&&'mediaSession' in navigator&&navigator.mediaSession.metadata){try{navigator.mediaSession.metadata.artwork=[{src:new URL(art.resolve(currentEpisode.channel,true).src,location.href).href,sizes:'640x640',type:'image/webp'}];}catch{}}
      document.querySelectorAll('[name="art-style"]').forEach(r=>r.checked=r.value===id);
      if(status)status.textContent='Vald bildstil: '+art.style(id).name+'. Fortsätt utforska webbplatsen.';
    }catch{if(request===artRequest){document.querySelectorAll('[name="art-style"]').forEach(r=>r.checked=r.value===art.selected);if(status)status.textContent='Bildserien kunde inte hämtas. Ditt tidigare val är kvar. Försök igen när anslutningen fungerar.';}}
    finally{if(request===artRequest&&status)status.removeAttribute('aria-busy');}
  }
  function renderDesignLab(){
    const target=$('#design-lab');if(!target)return;
    const experiments=art.styles.filter(s=>s.id!=='v3').sort((a,b)=>a.number-b.number);
    target.innerHTML='<div class="page-heading"><a class="back-link" href="mer.html">'+icon('arrow-left')+' Mer</a><h1>Designlaboratorium</h1><p>Prova kanalbilderna här och fortsätt runt i Morgonpodden. Valet gäller bara den här webbläsaren.</p></div><div class="lab-toolbar"><div><strong>'+experiments.length+' av 20 bildstilar klara</strong><p>Färgtemat väljer du separat under Mer.</p></div><button id="art-reset">Återställ till standard</button></div><p id="art-status" role="status" aria-live="polite">Vald bildstil: '+esc(art.style(art.selected).name)+'</p><fieldset class="art-styles"><legend>Välj bildstil</legend>'+experiments.map(style=>'<label class="art-option"><input type="radio" name="art-style" value="'+esc(style.id)+'" '+(style.id===art.selected?'checked':'')+'><img src="'+esc(style.preview)+'" width="800" height="268" loading="lazy" decoding="async" alt=""><span><small>STIL '+String(style.number).padStart(2,'0')+'</small> <strong>'+esc(style.name)+'</strong></span></label>').join('')+'</fieldset><p class="lab-note">Varje valbar serie har åtta originalmotiv. Stil 06, Analog filmfotografi, är standard tills du väljer något annat. Ljud och uppspelningskö fortsätter när du byter stil. Valet synkas inte mellan enheter.</p>'+((ChannelArtManifest.planned||[]).length?'<details class="planned-styles"><summary>Återstående bildstilar under produktion ('+ChannelArtManifest.planned.length+')</summary><ol>'+ChannelArtManifest.planned.map(style=>'<li value="'+style.number+'">'+esc(style.name)+'</li>').join('')+'</ol></details>':'')+'<a class="primary" href="idag.html">Prova på startsidan '+icon('arrow-up-right')+'</a>';
    target.querySelectorAll('[name="art-style"]').forEach(r=>r.onchange=()=>void changeArt(r.value));$('#art-reset').onclick=async()=>{await changeArt(ChannelArt.DEFAULT);if(art.selected===ChannelArt.DEFAULT)art.reset();};
  }
  const duration=n=>{n=Math.max(0,Math.floor(n||0));return Math.floor(n/60)+':'+String(n%60).padStart(2,'0');};
  const prettyDate=Core.prettyDate;
  const channelCard=c=>'<a class="channel-card" href="'+url('kanal',{id:c.id})+'">'+cover(c.id)+'<span class="channel-card-label"><strong>'+(c.id==='ibat'?'IBAT - Informations<wbr>försörjning':esc(channel(c.id)))+'</strong></span></a>';
  const descriptiveChannelCard=c=>'<a class="channel-card knowledge-card" href="'+url('kanal',{id:c.id})+'">'+cover(c.id)+'<div><h3>'+esc(channel(c.id))+'</h3><p>'+esc(c.description||'')+'</p><span>Öppna kanalen '+icon('chevron-right')+'</span></div></a>';
  const groupLabels={monitoring:['Bevakningskanaler','Dagliga avsnitt om det senaste inom varje område.','Visa alla bevakningskanaler'],knowledge:['Kunskapskanaler','Grundkurser och fördjupningar att lyssna på när du vill.','Visa alla kunskapskanaler']};
  const renderGroups=(channels,home=false,selected='')=>Core.channelGroups(channels).filter(g=>!selected||g.type===selected).map(g=>{const [label,description,all]=groupLabels[g.type];return '<section class="channel-group" data-group="'+g.type+'" aria-labelledby="group-'+g.type+'"><div class="section-heading"><div><h2 id="group-'+g.type+'">'+label+'</h2><p>'+description+'</p></div></div><div class="'+((home?'home-channels':'channel-directory')+(home&&g.type==='monitoring'?'':' descriptive-channels'))+'">'+(home?g.channels.slice(0,4):g.channels).map(home&&g.type==='monitoring'?channelCard:descriptiveChannelCard).join('')+'</div>'+(!g.channels.length?'<p class="empty">Inga kanaler att visa.</p>':'')+(home&&g.channels.length>4?'<a class="group-all text-link" href="'+url('kanaler',{group:g.type})+'">'+all+' '+icon('chevron-right')+'</a>':'')+'</section>';}).join('');
  const systemTheme=matchMedia('(prefers-color-scheme: dark)');
  function setTheme(value){document.documentElement.dataset.theme=value;try{localStorage.setItem('morgonpod-theme',value)}catch{}document.querySelector('meta[name="theme-color"]').content=(value==='dark'||value==='system'&&systemTheme.matches)?'#071720':'#faf9f6';}
  setTheme(document.documentElement.dataset.theme||'system');systemTheme.addEventListener('change',()=>setTheme(document.documentElement.dataset.theme));
  const hash = async text => !crypto.subtle ? window.sha256(text) : Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))).map(x=>x.toString(16).padStart(2,'0')).join('');
  async function json(path) {
    if (!cache.has(path)&&cache.size>=80)cache.delete(cache.keys().next().value);
    if (!cache.has(path)) cache.set(path, fetch(path,{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('Kunde inte hämta innehåll');return r.json();}).then(data=>{const active=x=>!superseded[x.episode_id||x.id]&&!withdrawn[x.episode_id||x.id];if(Array.isArray(data.items))return {...data,items:data.items.filter(active)};if(path.startsWith('catalog/search/'))return Object.fromEntries(Object.entries(data).map(([k,v])=>[k,v.filter(active)]));return data;}).catch(e=>{cache.delete(path);throw e;}));
    return cache.get(path);
  }
  const url = (page, params={}) => page+'.html'+(Object.keys(params).length?'?'+new URLSearchParams(params):'');
  const tags = e => (e.topic_labels || e.tags || []).map(t=>'<a class="tag" href="'+url('amne',{tag:t.toLocaleLowerCase('sv').replace(/[^a-z0-9åäö]+/g,'-')})+'">'+esc(t)+'</a>').join('');
  // Channel is already displayed in metadata. Avoid repeating it in the episode title,
  // including in older archived episodes that were published with prefixed titles.
  const episodeTitle = e => {
    let title=String(manifest.title_migration?.[e.id]||e.title||'').trim();
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
  const metadata = e => '<span class="channel-name">'+esc(channel(e.channel))+'</span><time class="episode-date" datetime="'+esc(Core.displayDate(e))+'">'+esc(prettyDate(e))+'</time>';
  const articleCard = a => '<a class="article-card" href="'+url('artikel',{id:a.id})+'">'+cover(a.channel,'article-cover')+'<div><small>'+metadata(a)+'</small><h3>'+esc(a.title)+'</h3><p>'+esc(a.summary||'')+'</p><span class="read-time">'+(a.reading_minutes?esc(a.reading_minutes)+' min läsning':'Läs artikeln')+'</span></div>'+icon('chevron-right')+'</a>';
  const episodeRow = e => '<div class="episode-shell"><button type="button" class="episode-art direct-play" data-play="'+esc(e.id)+'" aria-label="Spela '+esc(episodeTitle(e))+'">'+cover(e.channel,'episode-cover')+'<span class="play-symbol">'+icon('play')+'</span></button><details class="episode" data-id="'+esc(e.id)+'"><summary><span class="row-title" data-channel="'+esc(channel(e.channel))+'"><small class="item-meta">'+metadata(e)+'</small><strong>'+esc(episodeTitle(e))+'</strong>'+(Core.isIntro(e)?'<span class="intro-badge">Avsnitt 1 / Uppstart</span>':'')+'<span class="episode-topics">'+esc((e.topic_labels||e.tags||[]).slice(0,2).join(' · '))+'</span></span><span class="duration">'+(e.duration_seconds?duration(e.duration_seconds):'')+'</span>'+icon('chevron-down')+'</summary><div class="episode-body"><p role="status">Laddar avsnitt…</p></div></details></div>';
  async function detail(kind,id,fresh=false) { const path='catalog/'+kind+'/'+(await hash(id)).slice(0,24)+'.json';if(fresh)cache.delete(path);return json(path); }
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
  PlaybackQueue.Queue.history=Core.compareHistory;PlaybackQueue.Queue.latest=Core.compareLatest;PlaybackQueue.Queue.accept=e=>!superseded[e.id]&&!withdrawn[e.id];PlaybackQueue.Queue.matches=Core.matchesContent;
  const queue=new PlaybackQueue.Queue(json);
  let playbackRequest=0, advancing=false, resumePosition=0, savedAt=0, notice='';
  const queueControls=document.createElement('div');queueControls.className='queue-controls';
  queueControls.innerHTML='<button id="queue-previous" aria-label="Föregående avsnitt">Föregående</button><button id="queue-next" aria-label="Nästa avsnitt">Nästa</button><button id="queue-toggle" aria-expanded="false" aria-controls="queue-panel">Kö</button>';
  player.append(queueControls);
  const compactProgress=document.createElement('progress');compactProgress.className='compact-progress';compactProgress.max=100;compactProgress.value=0;compactProgress.setAttribute('aria-label','Framsteg i avsnittet');player.append(compactProgress);
  const queuePanel=document.createElement('section');queuePanel.id='queue-panel';queuePanel.className='queue-panel';queuePanel.hidden=true;queuePanel.setAttribute('aria-label','Uppspelningskö');player.append(queuePanel);
  function persist(){try{if(queue.current)localStorage.setItem('morgonpod-playback',JSON.stringify(queue.snapshot(resumePosition||audio.currentTime,audio.playbackRate)));}catch{}}
  function updateQueue(){
    const current=queue.current,next=queue.items[queue.index+1],remaining=Math.max(0,queue.items.length-queue.index-1);
    $('#queue-previous').disabled=queue.index<=0||advancing;$('#queue-next').disabled=!queue.hasNext||advancing;
    $('#queue-toggle').textContent='Kö ('+remaining+(queue.source?'+':'')+')';
    queuePanel.innerHTML='<div class="queue-heading"><h2>Uppspelningskö</h2><button data-queue-action="close">Stäng kön</button></div><p class="muted">'+esc(queue.label)+'</p><h3>Spelas nu</h3><p>'+esc(current?episodeTitle(current):'Inget avsnitt valt')+'</p><h3>Spelas härnäst</h3>'+(remaining?'<ol>'+queue.items.slice(queue.index+1).map((e,i)=>{const n=queue.index+i+1;return '<li>'+cover(e.channel,'queue-cover')+'<button class="queue-title" data-queue-action="play" data-index="'+n+'">'+esc(episodeTitle(e))+'<small>'+esc(channel(e.channel))+'</small></button><div class="queue-edit"><button data-queue-action="up" data-index="'+n+'" '+(n===queue.index+1?'disabled':'')+' aria-label="Flytta upp '+esc(episodeTitle(e))+'">↑</button><button data-queue-action="down" data-index="'+n+'" '+(n===queue.items.length-1?'disabled':'')+' aria-label="Flytta ned '+esc(episodeTitle(e))+'">↓</button><button data-queue-action="remove" data-index="'+n+'" aria-label="Ta bort '+esc(episodeTitle(e))+'">Ta bort</button></div></li>';}).join('')+'</ol>':'<p>'+(queue.source?'Fler avsnitt kan hämtas.':'Inga fler avsnitt i kön.')+'</p>')+(queue.source?'<button data-queue-action="more">Hämta fler avsnitt</button>':'')+'<button data-queue-action="clear">Töm kommande kö</button>';
    const nextLabel=$('#up-next');if(nextLabel)nextLabel.textContent=next?'Spelas härnäst: '+episodeTitle(next):queue.source?'Fler avsnitt hämtas vid behov':'Sista avsnittet i kön';
    if(notice)$('#player-status').textContent=notice;const fullStatus=$('#full-player-status');if(fullStatus)fullStatus.textContent=notice;const fullQueue=$('#full-queue');if(fullQueue){fullQueue.disabled=!queue.current;fullQueue.title=queue.current?'Visa och redigera kön':'Starta ett avsnitt för att skapa en kö';}
  }
  function showQueue(open){queuePanel.hidden=!open;$('#queue-toggle').setAttribute('aria-expanded',String(open));if(open)queuePanel.querySelector('button').focus();else ($('#full-queue')||$('#queue-toggle')).focus();}
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
    if(currentEpisode?.id===id&&activeContextId===contextId&&!audio.paused){audio.pause();return;}
    playbackRequest++;activeContextId=contextId;let source=context.source?JSON.parse(JSON.stringify(context.source)):null;const rows=source?.kind==='merge'?[row]:context.rows;if(source?.kind==='merge')source.streams.forEach(s=>s.buffer=s.buffer.filter(e=>Core.compareLatest(e,row)>=0));queue.start(rows,id,source,context.label);notice='';resumePosition=0;updateQueue();void play(row);
  }
  main.addEventListener('click',event=>{const b=event.target.closest('[data-play]');if(!b)return;event.preventDefault();event.stopPropagation();startFrom(b.dataset.play,b.closest('[data-context]')?.dataset.context);});
  audio.addEventListener('ended',()=>{void advance();});
  function applyResume(){if(resumePosition>0&&Number.isFinite(audio.duration)&&audio.duration>0){try{audio.currentTime=Math.min(resumePosition,Math.max(0,audio.duration-0.25));resumePosition=0;}catch{}}}
  for(const event of ['loadedmetadata','canplay','durationchange'])audio.addEventListener(event,applyResume);
  audio.addEventListener('pause',persist);audio.addEventListener('ratechange',()=>{$('#speed').textContent=audio.playbackRate+'×';if($('#big-speed'))$('#big-speed').textContent=audio.playbackRate+'×';persist();});window.addEventListener('pagehide',persist);
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
  audio.addEventListener('error',()=>{if(!audio.error)return;audio.pause();notice='Ljudfilen kunde inte spelas. Försök Spela igen eller välj Nästa.';updateQueue();});
  $('#play-pause').onclick=()=>{const target=queue.current||currentEpisode;if(audio.paused&&target)void play(target);else audio.pause();};
  document.querySelectorAll('[data-skip]').forEach(b=>b.onclick=()=>{audio.currentTime=Math.max(0,Math.min(audio.duration||Infinity,audio.currentTime+Number(b.dataset.skip)));});
  $('#seek').oninput=ev=>{if(Number.isFinite(audio.duration))audio.currentTime=Number(ev.target.value)/100*audio.duration;};
  $('#speed').onclick=()=>{const rates=[1,1.25,1.5,1.75,2];audio.playbackRate=rates[(rates.indexOf(audio.playbackRate)+1)%rates.length];$('#speed').textContent=audio.playbackRate+'×';};
  $('#player-open').onclick=()=>{if(currentEpisode)navigate(url('avsnitt',{id:currentEpisode.id}));};
  function syncAudio(){compactProgress.value=Number.isFinite(audio.duration)&&audio.duration>0?audio.currentTime/audio.duration*100:0;const paused=audio.paused;$('#play-pause').innerHTML=icon(paused?'play':'pause');$('#play-pause').setAttribute('aria-label',paused?'Spela':'Pausa');$('#elapsed').textContent=duration(audio.currentTime);$('#total').textContent=duration(audio.duration);$('#seek').value=Number.isFinite(audio.duration)?audio.currentTime/audio.duration*100:0;const big=$('#big-play');if(big&&$('.full-player')?.dataset.episode===currentEpisode?.id){big.innerHTML=icon(paused?'play':'pause');big.setAttribute('aria-label',paused?'Spela avsnittet':'Pausa avsnittet');}const position=$('#big-seek');if(position&&$('.full-player')?.dataset.episode===currentEpisode?.id){position.value=$('#seek').value;$('#big-elapsed').textContent=duration(audio.currentTime);$('#big-total').textContent=duration(audio.duration);}}
  for(const event of ['timeupdate','play','pause','loadedmetadata','ended'])audio.addEventListener(event,syncAudio);
  function syncDirect(){main.querySelectorAll('[data-play]').forEach(b=>{const row=contexts.get(b.closest('[data-context]')?.dataset.context)?.rows.find(e=>e.id===b.dataset.play);if(!row)return;const playing=currentEpisode?.id===row.id&&!audio.paused&&activeContextId===b.closest('[data-context]')?.dataset.context;b.setAttribute('aria-label',(playing?'Pausa ':'Spela ')+episodeTitle(row));const symbol=b.querySelector('.play-symbol')||b;symbol.innerHTML=icon(playing?'pause':'play');});}
  audio.addEventListener('play',syncDirect);audio.addEventListener('pause',syncDirect);
  async function play(e,autoplay=true) {
    const request=++playbackRequest;
    if(currentEpisode?.id!==e.id)audio.pause();
    player.hidden=false;document.body.classList.add('has-player');$('#player-title').textContent=episodeTitle(e);$('#player-status').textContent='Hämtar avsnitt…';updateArtImage($('#player-image'),e.channel,true);
    if(!e.audio||Core.isIntro(e)){try{const fresh=await detail('episodes',e.id,Core.isIntro(e));if(request!==playbackRequest)return;if(Core.isIntro(e)&&e.audio&&e.audio!==fresh.audio)resumePosition=0;e=fresh;const at=queue.items.findIndex(row=>row.id===e.id);if(at>=0)queue.items[at]=e;}catch{if(request!==playbackRequest)return;notice='Avsnittet finns inte tillgängligt. Välj Nästa eller ett annat avsnitt.';updateQueue();return;}}
    if(request!==playbackRequest)return;
    $('#player-title').textContent=episodeTitle(e);
    if(!Core.safePath(e.audio)){notice='Ljudfilen finns inte tillgänglig. Välj Nästa.';updateQueue();return;}
    const changed=currentEpisode?.id!==e.id||audio.getAttribute('src')!==e.audio||!!audio.error;
    if(changed){audio.preload='metadata';const rate=audio.playbackRate;audio.pause();currentEpisode=e;audio.src=e.audio;audio.playbackRate=rate;elapsed=0;previousTime=0;}
    currentEpisode=e;
    $('#player').hidden=false;$('#player-title').textContent=episodeTitle(e);$('#player-status').textContent=autoplay?channel(e.channel):'Sparad kö. Tryck på Spela för att fortsätta.';updateArtImage($('#player-image'),e.channel,true);
    document.body.classList.add('has-player');
    if(!player.dataset.initialized){player.dataset.initialized='true';compactPlayer(matchMedia('(max-width: 650px)').matches);}
    if('mediaSession' in navigator){try{navigator.mediaSession.metadata=new MediaMetadata({title:episodeTitle(e),artist:channel(e.channel),album:'Morgonpodden',artwork:[{src:new URL($('#player-image').src).href,sizes:'640x640',type:'image/webp'}]});}catch{}}
    if(autoplay){try{await audio.play();if(request!==playbackRequest)return;notice='';}catch(error){if(request!==playbackRequest||error.name==='AbortError')return;notice=error.name==='NotAllowedError'?'Automatisk start blockerades. Tryck på Spela för att fortsätta.':'Ljudfilen kunde inte spelas. Försök Spela igen eller välj Nästa.';}}
    updateQueue();syncAudio();persist();
  }
  if('mediaSession' in navigator){for(const [action,handler] of Object.entries({play:()=>queue.current&&play(queue.current),pause:()=>audio.pause(),nexttrack:()=>advance(),previoustrack:()=>advance(-1),seekbackward:()=>{audio.currentTime=Math.max(0,audio.currentTime-15);},seekforward:()=>{if(Number.isFinite(audio.duration))audio.currentTime=Math.min(audio.duration,audio.currentTime+15);}})){try{navigator.mediaSession.setActionHandler(action,handler);}catch{}}}
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
  async function collection(key, target, token, maximum=Infinity, order='latest',contentFilter='') {
    const data=manifest.collections[key]||{count:0,pages:[]};
    if(!data.count){target.innerHTML='<p class="empty">Inget publicerat innehåll i detta urval ännu.</p>';return;}
    let page=0;const rows=[];const paths=Core.collectionPaths(manifest,key,order);
    if(!paths){target.innerHTML='<p class="empty">Historisk ordning är ännu inte tillgänglig för detta äldre arkiv. Välj Senast publicerat.</p>';return;}
    const list=document.createElement('div');list.className=key.startsWith('articles')?'article-grid':'episode-list';
    const button=document.createElement('button');button.className='more';button.textContent='Visa fler';
    target.append(list,button);
    async function next(){button.disabled=true;try{const chunk=await json(paths[page]);if(token!==routeToken)return;const batch=[...chunk.items].filter(e=>Core.matchesContent(e,contentFilter)).sort(order==='oldest'?Core.compareHistory:Core.compareLatest).slice(0,maximum-page*24);if(batch.length)list.querySelector('.empty')?.remove();rows.push(...batch);batch.forEach(e=>latestRows.set(e.id,e));list.insertAdjacentHTML('beforeend',batch.map(key.startsWith('articles')?articleCard:episodeRow).join(''));page++;if(!rows.length)list.innerHTML='<p class="empty">'+(page<paths.length?'Inga träffar ännu. Visa fler för att fortsätta i arkivet.':'Inga publicerade avsnitt av den här typen ännu.')+'</p>';if(key.startsWith('episodes'))registerContext(list,rows,page<paths.length?{kind:'pages',paths,page,order,filter:contentFilter}:null,key==='episodes'?'Senaste från alla kanaler':key.startsWith('episodes/channel/')?channel(key.split('/').pop())+' · '+(order==='oldest'?'Första avsnittet först':'Senast publicerat'):'Valt ämne');button.hidden=page>=paths.length||page*24>=maximum;}catch{button.textContent='Kunde inte ladda. Försök igen';}button.disabled=false;}
    button.onclick=next;await next();
  }
  // Use the producer's publication-ordered global pages when available.
  // Legacy manifests retain a bounded per-channel overview and lazy merge cursor.
  async function homeLatest(kind, target, token, initial=8) {
    if(kind==='episodes'&&manifest.collections.episodes?.pages?.length){
      const paths=manifest.collections.episodes.pages,rows=[];let page=0,shown=0;
      const list=document.createElement('div');list.className='episode-list';const more=document.createElement('button');more.className='more';more.textContent='Visa fler avsnitt';target.append(list,more);
      async function reveal(){more.disabled=true;try{if(shown>=rows.length&&page<paths.length){const data=await json(paths[page]);if(token!==routeToken)return;rows.push(...data.items.toSorted(Core.compareLatest));page++;}const batch=rows.slice(shown,shown+initial);batch.forEach(e=>latestRows.set(e.id,e));list.insertAdjacentHTML('beforeend',batch.map(episodeRow).join(''));shown+=batch.length;registerContext(list,rows,page<paths.length?{kind:'pages',paths,page,order:'latest'}:null,'Senaste från alla kanaler');more.hidden=shown>=rows.length&&page>=paths.length;}catch{more.textContent='Kunde inte ladda. Försök igen';}more.disabled=false;}
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
    document.body.dataset.page=page;contexts.clear();latestRows.clear();
    const kind=page==='artiklar'?'articles':'episodes';
    $('#nav').querySelectorAll('a').forEach(a=>{if(a.getAttribute('href')===(['kanal','avsnitt'].includes(page)?'kanaler.html':page==='artikel'?'artiklar.html':page==='index'?'idag.html':page==='designlaboratorium'?'mer.html':page+'.html'))a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    latestRows.clear();main.innerHTML='<p role="status">Hämtar innehåll…</p>';
    try {
      if(page==='artikel') {
        const a=await detail('articles',p.get('id')||'');if(token!==routeToken)return;
        if(a.catalog_status==='withdrawn'||withdrawn[a.episode_id]){main.innerHTML='<h1>Artikeln är avpublicerad</h1><p>Den hör till en veckoöversikt som inte längre ingår i kunskapskanalen.</p><a class="text-link" href="'+url('kanal',{id:a.channel})+'">Till kanalen</a>';return;}
        if(a.catalog_status==='superseded'||superseded[a.episode_id]){main.innerHTML='<h1>Artikeln hör till ett ersatt avsnitt</h1><a href="'+url('avsnitt',{id:a.replacement_id||superseded[a.episode_id]})+'">Öppna den nya utgåvan med tillhörande artiklar</a>';return;}document.title=a.title+' | Morgonpod';
        main.innerHTML='<article class="reading"><a class="back-link" href="artiklar.html">'+icon('arrow-left')+' Artiklar</a><figure class="reading-illustration">'+cover(a.channel,'reading-cover',true)+'<figcaption>Illustrativ kanalbild</figcaption></figure><small>'+metadata(a)+'</small><h1>'+esc(a.title)+'</h1><p class="lead">'+esc(a.summary)+'</p><a class="article-audio" href="'+url('avsnitt',{id:a.episode_id})+'">'+icon('headphones')+' Lyssna på tillhörande avsnitt '+icon('chevron-right')+'</a><div class="prose">'+(String(a.body||'').trim()===String(a.summary||'').trim()?'':String(a.body||'')).split(/\n+/).filter(x=>x.trim()).map(x=>/^#{1,3}\s+/.test(x)?'<h2>'+esc(x.replace(/^#{1,3}\s+/,''))+'</h2>':'<p>'+esc(x)+'</p>').join('')+'</div>'+(a.context&&![a.summary,a.body].some(text=>String(text||'').trim()===String(a.context).trim())?'<h2>Om underlaget</h2><p>'+esc(a.context)+'</p>':'')+(a.assessment?'<h2>Redaktionens bedömning</h2><p>'+esc(a.assessment)+'</p>':'')+(a.open_questions?.length?'<h2>Öppna frågor</h2><ul>'+a.open_questions.map(q=>'<li>'+esc(q)+'</li>').join('')+'</ul>':'')+Core.articleChanges(a)+'<div class="tags">'+tags(a)+'</div><h2>Källor</h2><ul>'+(a.sources||[]).filter(s=>/^https?:\/\//.test(s.url||'')).map(s=>'<li><a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.title||s.url)+'</a></li>').join('')+'</ul><h2>Lyssna på avsnittet</h2><a href="'+url('avsnitt',{id:a.episode_id})+'">'+esc(a.episode_title||'Öppna poddavsnittet')+'</a>'+(a.previous_reporting?.length?'<h2>Tidigare rapportering</h2>'+a.previous_reporting.filter(x=>typeof x==='string').map(id=>'<p><a href="'+url('artikel',{id})+'">Tidigare artikel</a></p>').join(''):'')+'</article>';
        track('article',a.id);return;
      }
      if(page==='avsnitt') {const e=await detail('episodes',p.get('id')||'');if(token!==routeToken)return;if(e.catalog_status==='withdrawn'||withdrawn[e.id]){main.innerHTML='<h1>Avsnittet är avpublicerat</h1><p>Veckoöversikten ingår inte längre i kunskapskanalen. Grundkurser och fördjupningar finns kvar.</p><a class="text-link" href="'+url('kanal',{id:e.channel})+'">Till kanalen</a>';return;}if(e.catalog_status==='superseded'||superseded[e.id]){main.innerHTML='<div class="page-heading"><h1>Avsnittet har ersatts</h1><p>En ny utgåva finns publicerad.</p><a class="primary" href="'+url('avsnitt',{id:e.replacement_id||superseded[e.id]})+'">Öppna den nya utgåvan</a></div>';return;}document.title=episodeTitle(e)+' | Morgonpodden';main.innerHTML='<div class="episode-screen"><a class="back-link" href="'+url('kanal',{id:e.channel})+'">'+icon('arrow-left')+' Till kanalen '+esc(channel(e.channel))+'</a><div class="full-player" data-episode="'+esc(e.id)+'">'+cover(e.channel,'large-cover',true)+'<h1>'+esc(channel(e.channel))+'</h1><h2>'+esc(episodeTitle(e))+'</h2><p>'+esc(prettyDate(e))+(Core.isIntro(e)?' · Avsnitt 1 / Uppstart':'')+'</p><div class="big-timeline"><input type="range" id="big-seek" min="0" max="100" value="0" step="0.1" aria-label="Position i avsnittet"><div><span id="big-elapsed">0:00</span><span id="big-total">'+duration(e.duration_seconds)+'</span></div></div><div class="big-transport"><button id="back15" aria-label="Bakåt 15 sekunder">'+icon('rotate-ccw')+'<small>15</small></button><button id="big-play" aria-label="Spela avsnittet">'+icon('play')+'</button><button id="forward15" aria-label="Framåt 15 sekunder">'+icon('rotate-cw')+'<small>15</small></button></div><button id="big-speed" aria-label="Ändra hastighet">'+audio.playbackRate+'×</button></div><section class="episode-info"><h2>Om avsnittet</h2><p>'+esc(e.description||'')+'</p><div class="tags">'+tags(e)+'</div><h2>Artiklar i avsnittet</h2>'+(e.articles?.length?e.articles.map(articleCard).join(''):'<p>Inga separata artiklar till detta avsnitt.</p>')+'</section></div>';$('#big-play').onclick=()=>{if(currentEpisode?.id===e.id&&!audio.paused)audio.pause();else {if(queue.current?.id!==e.id||detailContext?.id===e.id&&detailContext.contextId!==activeContextId){const c=detailContext?.id===e.id?detailContext:null;activeContextId=c?.contextId||null;const source=c?.source?JSON.parse(JSON.stringify(c.source)):null;if(source?.kind==='merge')source.streams.forEach(s=>s.buffer=s.buffer.filter(row=>Core.compareLatest(row,e)>=0));queue.start(source?.kind==='merge'?[e]:c?.rows||[e],e.id,source,c?.label||channel(e.channel));}void play(e);}};$('#back15').onclick=()=>{if(currentEpisode?.id===e.id)audio.currentTime=Math.max(0,audio.currentTime-15);};$('#forward15').onclick=()=>{if(currentEpisode?.id===e.id)audio.currentTime=Math.min(audio.duration||Infinity,audio.currentTime+15);};$('#big-seek').oninput=ev=>{if(currentEpisode?.id===e.id&&Number.isFinite(audio.duration))audio.currentTime=Number(ev.target.value)/100*audio.duration;};$('#big-speed').onclick=()=>{$('#speed').click();$('#big-speed').textContent=audio.playbackRate+'×';};$('.full-player').insertAdjacentHTML('beforeend','<p id="full-player-status" role="status"></p><p id="up-next"></p><button id="full-queue">Visa uppspelningskön</button>');$('#full-queue').onclick=()=>showQueue(true);if(currentEpisode?.id===e.id)syncAudio();updateQueue();return;}
      if(page==='designlaboratorium'){document.title='Designlaboratorium | Morgonpodden';main.innerHTML='<section id="design-lab"></section>';renderDesignLab();return;}
      if(page==='prenumerera') {
        document.title='Prenumerera | Morgonpodden';
        main.innerHTML='<section class="subscription" aria-labelledby="subscribe-title"><div class="page-heading"><h1 id="subscribe-title">Prenumerera på Morgonpodden</h1><p>Följ Morgonpodden på Telegram för att få publicerade avsnitt i den gemensamma kanalen.</p></div><h2>Avsnitten kommer i Telegram</h2><p>Öppna kanalen och välj att gå med i Telegram. Du behöver Telegram för att följa kanalen. Aviseringar styr du i Telegram.</p><a class="subscribe-button" href="https://t.me/+jlPUjsmjlE03NDFk" target="_blank" rel="noopener noreferrer">Öppna Morgonpodden i Telegram '+icon('external-link')+'</a><p class="muted">Länken öppnas i en ny flik eller i Telegramappen. Du kan fortsätta lyssna här på webben.</p></section>';return;
      }
      if(page==='mer') {
        document.title='Utseende | Morgonpodden';main.innerHTML='<div class="page-heading"><h1>Mer</h1><p>Gör Morgonpodden bekväm att läsa.</p></div><section class="settings"><h2>Utseende</h2><p>Välj ett läge eller låt enhetens inställning styra.</p><fieldset><legend class="sr-only">Färgtema</legend>'+[['light','Ljust läge','sun'],['dark','Mörkt läge','moon'],['system','Följ systemet','monitor']].map(([v,t,i])=>'<label class="theme-option">'+icon(i)+'<span>'+t+'</span><input type="radio" name="theme" value="'+v+'" '+(document.documentElement.dataset.theme===v?'checked':'')+'></label>').join('')+'</fieldset></section><div class="more-links"><a href="designlaboratorium.html">'+icon('grid')+' Designlaboratorium '+icon('chevron-right')+'</a><a href="lyssna.html">'+icon('headphones')+' Alla avsnitt '+icon('chevron-right')+'</a><a href="statistik.html">'+icon('bar-chart-2')+' Statistik '+icon('chevron-right')+'</a><a href="https://t.me/+jlPUjsmjlE03NDFk" target="_blank" rel="noopener noreferrer">Morgonpodden på Telegram '+icon('external-link')+'</a></div>';main.querySelectorAll('[name="theme"]').forEach(r=>r.onchange=()=>setTheme(r.value));return;
      }
      if(page==='kanaler') {
        document.title='Kanaler | Morgonpodden';
        const group=['monitoring','knowledge'].includes(p.get('group'))?p.get('group'):'';
        main.innerHTML='<div class="page-heading"><h1>Kanaler</h1><p>Välj perspektiv. Lyssna och förstå mer.</p></div><nav class="chips" aria-label="Kanaltyp" id="categories">'+[['','Alla'],['monitoring','Bevakningskanaler'],['knowledge','Kunskapskanaler']].map(([value,label])=>'<a class="chip '+(group===value?'selected':'')+'" '+(group===value?'aria-current="page"':'')+' href="'+url('kanaler',{group:value})+'">'+label+'</a>').join('')+'</nav><div class="channel-groups directory-groups"></div>';
        $('.directory-groups').innerHTML=renderGroups(manifest.channels.filter(c=>!group||c.channel_type===group),false,group);return;
      }
      if(page==='kanal') {
        const id=p.get('id')||'',c=manifest.channels.find(c=>c.id===id);
        if(!c){main.innerHTML='<h1>Kanalen finns inte</h1><p><a href="kanaler.html">Visa alla kanaler</a></p>';return;}
        document.title=channel(id)+' | Morgonpodden';const tab=['episodes','articles','about','courses','specials','ordinary'].includes(p.get('tab'))?p.get('tab'):'episodes',knowledge=c.channel_type==='knowledge';const contentFilter={courses:'course',specials:'special',ordinary:'ordinary'}[tab]||'';
        main.innerHTML='<a class="back-link" href="kanaler.html">'+icon('arrow-left')+' Alla kanaler</a><header class="channel-hero">'+cover(id,'channel-hero-cover',true)+'<div>'+(knowledge?'<span class="channel-type">Kunskapskanal</span>':'')+'<h1>'+esc(channel(id))+'</h1><p>'+esc(c.description||'')+'</p></div></header><div class="channel-layout"><section class="channel-main"><nav class="tabs" aria-label="Kanalinnehåll">'+[['episodes','Avsnitt'],...(knowledge?[['courses','Grundkurser'],['specials','Fördjupningar']]:[['ordinary','Aktuella avsnitt'],['specials','Fördjupningar']]),['articles','Artiklar'],['about','Om kanalen']].map(([t,label])=>'<a href="'+url('kanal',{id,tab:t})+'" '+(t===tab?'aria-current="page"':'')+'>'+label+'</a>').join('')+'</nav><div id="channel-content"></div></section><aside class="secondary"><h2>Senaste artiklar</h2><div id="related"></div></aside></div>';
        if(tab==='about')$('#channel-content').innerHTML='<section class="channel-about"><h2>Om ämnet</h2><p>'+esc(c.description||'')+'</p><h2>Publicering</h2><p>Här samlas kanalens publicerade avsnitt och artiklar. '+(c.channel_type==='knowledge'?'Kunskapskanal med grundkurser och fördjupningar. Ingen återkommande nyhetsutgåva.':'Nyhetsbevakning med ordinarie publicering kl. 07.45.')+'</p><p>Omslagsbilden är en illustrativ kanalbild, inte ett foto från en specifik nyhetshändelse.</p></section>';
        else {const kind=tab==='articles'?'articles':'episodes',order=p.get('sort')||(tab==='courses'||id==='lagstiftning'&&tab==='episodes'?'oldest':'latest');$('#channel-content').innerHTML='<div class="archive-tools"><p>'+Number(manifest.collections[kind+'/channel/'+id]?.count||0)+' '+(tab==='articles'?'artiklar':'avsnitt i kanalarkivet')+(contentFilter?' · '+esc({courses:'Grundkurser',specials:'Fördjupningar',ordinary:'Aktuella avsnitt'}[tab]):'')+'</p><label>Sortera<select id="archive-sort"><option value="latest">Senast publicerat</option><option value="oldest">Första avsnittet först</option></select></label></div><div id="channel-list"></div>';$('#archive-sort').value=order;$('#archive-sort').onchange=e=>navigate(url('kanal',{id,tab,sort:e.target.value}));await collection(kind+'/channel/'+id,$('#channel-list'),token,Infinity,order,contentFilter);}
        if(token!==routeToken)return;const historyPaths=Core.collectionPaths(manifest,'episodes/channel/'+id,'oldest');if(historyPaths?.length){const historyPage=await json(historyPaths[0]);if(token!==routeToken)return;const intro=historyPage.items.find(Core.isIntro);if(intro)$('.channel-hero').insertAdjacentHTML('afterend','<a class="intro-link" href="'+url('avsnitt',{id:intro.id})+'">Börja här: uppstartsavsnittet '+icon('chevron-right')+'</a>');}await collection('articles/channel/'+id,$('#related'),token,4);return;
      }
      if(page==='statistik') {await statistics(token);return;}
      if(page==='utforska') {
        document.title='Sök | Morgonpodden';
        main.innerHTML='<div class="page-heading"><h1>Sök</h1><p>Hitta avsnitt, artiklar och kanaler.</p></div><form id="search"><label for="query">Sök i hela arkivet</label><div class="search-row"><input type="search" id="query" minlength="2" required placeholder="Till exempel Östersjön"><button>Sök</button></div></form><div class="chips" id="search-types">'+[['all','Alla'],['episodes','Avsnitt'],['articles','Artiklar'],['channels','Kanaler']].map(([v,t],i)=>'<button class="chip '+(!i?'selected':'')+'" data-type="'+v+'" aria-pressed="'+!i+'">'+t+'</button>').join('')+'</div><p id="search-status" role="status" aria-live="polite"></p><section id="results"></section><div class="search-topics"><h2>Utforska ämnen</h2><div class="tags">'+manifest.topics.map(t=>'<a class="tag" href="'+url('amne',{tag:t})+'">'+esc(t.replace(/-/g,' '))+'</a>').join('')+'</div></div>';
        main.querySelector('#search-types').insertAdjacentHTML('afterend','<div class="search-refinements"><label>Kanal<select id="search-channel"><option value="">Alla kanaler</option>'+manifest.channels.map(c=>'<option value="'+esc(c.id)+'">'+esc(channel(c.id))+'</option>').join('')+'</select></label><label>Avsnittstyp<select id="search-content"><option value="">Alla typer</option><option value="introduction">Uppstart</option><option value="course">Grundkurs</option><option value="special">Fördjupning</option><option value="ordinary">Bevakning</option></select></label><label>Längd<select id="search-duration"><option value="">Alla längder</option><option value="short">Under 10 minuter</option><option value="medium">10 till 20 minuter</option><option value="long">Minst 20 minuter</option></select></label></div>');
        let searchId=0,allRows=[],channelRows=[],filter='all',count=24;
        function draw(){const selectedChannel=$('#search-channel').value,content=$('#search-content').value,length=$('#search-duration').value;const rows=allRows.filter(x=>(filter==='all'||x.type===filter)&&(!selectedChannel||x.channel===selectedChannel)&&(!content||x.type==='episodes'&&Core.matchesContent(x,content))&&(!length||x.type==='episodes'&&Number.isFinite(x.duration_seconds)&&(length==='short'?x.duration_seconds<600:length==='medium'?x.duration_seconds>=600&&x.duration_seconds<1200:x.duration_seconds>=1200)));const channels=(filter==='all'||filter==='channels')&&!content&&!length?channelRows.filter(c=>!selectedChannel||c.id===selectedChannel):[];const results=$('#results');$('#search-status').textContent=Number(rows.length+channels.length)+' träffar';results.innerHTML=(!rows.length&&!channels.length?'<p class="empty">Inga träffar. Prova ett helt ord, färre sökord eller välj ett ämne nedan.</p>':'')+(channels.length?'<div class="channel-directory">'+channels.map(c=>channelCard(c).replace('</a>','<span class="search-channel-description">Kanal · '+esc(c.description||'')+'</span></a>')).join('')+'</div>':'')+rows.slice(0,count).map(x=>x.type==='articles'?articleCard(x):episodeRow(x)).join('')+(rows.length>count?'<button id="search-more" class="more">Visa fler</button>':'');registerContext(results,rows.filter(x=>x.type==='episodes'),null,'Sök: '+$('#query').value,true);$('#search-more')?.addEventListener('click',()=>{count+=24;draw();});}
        for(const id of ['search-channel','search-content','search-duration'])$('#'+id).onchange=()=>{count=24;draw();};
        async function suggest(terms,request){
          if(allRows.length||channelRows.length||!terms.length)return;
          try{const hints=await json('search-hints.json');if(token!==routeToken||request!==searchId)return;const words=[...new Set(terms.flatMap(t=>hints[t]||[]))].slice(0,5);if(words.length){$('#results').insertAdjacentHTML('beforeend','<p>Menade du något av dessa hela ord?</p><div class="chips">'+words.map(w=>'<button class="chip search-suggestion" type="button">'+esc(w)+'</button>').join('')+'</div>');$('#results').querySelectorAll('.search-suggestion').forEach(b=>b.onclick=()=>{$('#query').value=b.textContent;$('#search').requestSubmit();});}}catch{}
        }
        $('#search-types').onclick=ev=>{const b=ev.target.closest('button');if(!b)return;filter=b.dataset.type;count=24;$('#search-types').querySelectorAll('button').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',x===b);});draw();};
        $('#search').onsubmit=async event=>{event.preventDefault();const request=++searchId;const query=$('#query').value.toLocaleLowerCase('sv'),terms=query.match(/[\wåäö]{2,}/g)||[];$('#search-status').textContent='Söker…';$('#results').textContent='';try{let matches;for(const term of terms.slice(0,6)){const bucket=(await hash(term)).slice(0,2);const data=manifest.search_buckets.includes(bucket)?await json('catalog/search/'+bucket+'.json'):{};const rows=data[term]||[];if(matches){const ids=new Set(rows.map(r=>r.id));matches=matches.filter(x=>ids.has(x.id));}else matches=rows;}if(token!==routeToken||request!==searchId)return;allRows=[...new Map((matches||[]).map(x=>[x.id,x])).values()].sort(Core.compareLatest);channelRows=manifest.channels.filter(c=>terms.every(t=>(channel(c.id)+' '+c.description).toLocaleLowerCase('sv').includes(t)));count=24;draw();void suggest(terms,request);}catch{if(token===routeToken&&request===searchId)$('#search-status').textContent='Sökningen kunde inte slutföras. Försök igen.';}};
        return;
      }
      if(page==='amne') {main.innerHTML='<h1>'+esc(p.get('tag')||'Ämne')+'</h1><h2>Poddavsnitt</h2><div id="episodes"></div><h2>Artiklar</h2><div id="articles"></div>';await collection('episodes/topic/'+p.get('tag'),$('#episodes'),token);await collection('articles/topic/'+p.get('tag'),$('#articles'),token);return;}
      if(page==='idag'||page==='index') {
        document.title='Dagens bevakning | Morgonpodden';
        const ordered=Core.channelGroups(manifest.channels).flatMap(g=>g.channels);
        main.innerHTML='<div class="morning-home"><p class="today-date">'+esc(new Intl.DateTimeFormat('sv-SE',{weekday:'long',day:'numeric',month:'long',timeZone:'Europe/Stockholm'}).format(new Date()))+'</p><section class="morning-brief" aria-labelledby="morning-title"><div class="morning-heading"><div><span class="eyebrow">MORGONPODDEN</span><h1 id="morning-title">Dagens bevakning</h1><p>Flera perspektiv. En samlad morgon.</p></div><div id="brief-action" role="status">Hämtar bevakningen…</div></div><div id="morning-editions"></div></section><div class="channel-groups home-channel-groups">'+renderGroups(manifest.channels,true)+'</div><section aria-labelledby="latest-title"><div class="section-heading"><h2 id="latest-title">Senast publicerat</h2><a href="lyssna.html">Hela arkivet '+icon('chevron-right')+'</a></div><div class="recent-layout"><div id="episodes" class="home-episodes"></div><aside><h3>Artiklar och sammanhang</h3><div id="articles"></div><a class="text-link" href="artiklar.html">Alla artiklar '+icon('chevron-right')+'</a></aside></div></section><div class="archive-entry"><span>Söker du något särskilt?</span><a href="utforska.html">'+icon('search')+' Sök bland avsnitt och artiklar</a></div></div>';
        const dailyChannels=ordered.filter(c=>c.channel_type==='monitoring');
        const editions=await Promise.allSettled(dailyChannels.map(async c=>{const col=manifest.collections['episodes/ordinary/channel/'+c.id]||manifest.collections['episodes/channel/'+c.id];return col?.pages?.length?(await json(col.pages[0])).items.filter(Core.ordinary).sort((a,b)=>String(b.date).localeCompare(String(a.date))||Core.compareLatest(a,b))[0]:null;}));
        if(token!==routeToken)return;
        const available=editions.flatMap(r=>r.status==='fulfilled'&&r.value?[r.value]:[]),today=Core.stockholmDay(),day=available.some(e=>e.date===today)?today:available.map(e=>e.date).sort().pop();
        const rows=available.filter(e=>e.date===day),missing=dailyChannels.filter(c=>!rows.some(e=>e.channel===c.id));
        $('#brief-action').innerHTML=rows.length?'<button class="primary morning-play" data-play="'+esc(rows[0].id)+'">'+icon('play')+' Spela bevakningen</button><small>'+rows.length+' avsnitt · '+Math.ceil(rows.reduce((n,e)=>n+(e.duration_seconds||0),0)/60)+' min</small>':'<p>Bevakningen har ännu inte publicerats.</p>';
        registerContext($('.morning-brief'),rows,null,'Bevakningen '+(day||today));
        $('#morning-editions').innerHTML=(rows.length&&day!==today?'<p class="edition-status">Senaste tillgängliga bevakning: '+esc(day)+'. Dagens avsnitt visas här när de publiceras.</p>':'')+'<div class="morning-strip">'+rows.map(e=>'<a href="'+url('avsnitt',{id:e.id})+'">'+cover(e.channel,'brief-cover')+'<span>'+esc(e.channel==='ibat'?'IBAT':channel(e.channel))+'</span><small>'+duration(e.duration_seconds)+'</small></a>').join('')+'</div>'+(missing.length?'<p class="edition-status">'+esc(missing.map(c=>channel(c.id)).join(', '))+': inväntar publicering'+(day&&day!==today?' för '+day:'')+'.</p>':'');
        await homeLatest('episodes',$('#episodes'),token,6);if(token!==routeToken)return;
        await homeLatest('articles',$('#articles'),token,4);
        return;
      }
      const title=kind==='articles'?'Artiklar':'Lyssna';document.title=title+' | Morgonpod';
      main.innerHTML='<div class="page-heading">'+(kind==='articles'?'':'<small>DITT PODDBIBLIOTEK</small>')+'<h1>'+title+'</h1><p>'+(kind==='articles'?'Självständiga nyhetstexter med källor och tidigare rapportering.':'Välj kanal eller hitta ditt nästa poddavsnitt.')+'</p></div>'+filters(kind,p)+'<div id="listing"></div><section id="ranking"></section>';
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
  document.addEventListener('click',e=>{const a=e.target.closest('a');if(!a||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||e.button!==0||a.target)return;const u=new URL(a.href);if(u.origin===location.origin&&u.pathname.endsWith('.html')&&u.pathname.startsWith(location.pathname.slice(0,location.pathname.lastIndexOf('/')+1))){e.preventDefault();if(u.pathname.endsWith('/avsnitt.html')){const context=contexts.get(a.closest('[data-context]')?.dataset.context);detailContext=context?{...context,id:u.searchParams.get('id'),contextId:a.closest('[data-context]')?.dataset.context}:null;}navigate(u.pathname+u.search);}});
  window.addEventListener('popstate',render);
  try{config=await json('analytics-config.json');if(config.goatcounter&&/^https:\/\/[a-z0-9-]+\.goatcounter\.com\/count$/.test(config.goatcounter)){window.goatcounter={no_onload:true};await new Promise(resolve=>{const s=document.createElement('script');s.src='https://gc.zgo.at/count.js';s.dataset.goatcounter=config.goatcounter;s.async=true;s.onload=resolve;s.onerror=resolve;document.head.append(s);setTimeout(resolve,2500);});}}catch{}
  try{manifest=await json('catalog/manifest.json');superseded=manifest.superseded||{};withdrawn=manifest.withdrawn||{};Core.catalogOrder=manifest.channels.map(c=>c.id);manifest.channels=manifest.channels.map(c=>c.id==='ibat'?{...c,name:'IBAT - Informationsförsörjning'}:c);await render();try{const saved=JSON.parse(localStorage.getItem('morgonpod-playback')||'null');if(saved?.items?.some(e=>withdrawn[e.id]))main.insertAdjacentHTML('afterbegin','<p role="status">Den sparade kön innehöll ett avpublicerat avsnitt och kunde inte återställas. Välj ett avsnitt för en ny kö.</p>');if(queue.restore(saved)){resumePosition=Number.isFinite(saved.position)?Math.max(0,saved.position):0;audio.playbackRate=[1,1.25,1.5,1.75,2].includes(saved.rate)?saved.rate:1;await play(queue.current,false);}}catch{}}catch{main.innerHTML='<h1>Arkivet är tillfälligt otillgängligt</h1><p>Försök ladda sidan igen.</p>';}
  if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
})();



