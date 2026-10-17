/* Morgonpod: one application, one persistent audio element, bounded archive requests. */
const Core = {
  escape: value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
  safePath: value => typeof value === 'string' && /^(catalog|episodes)\/[\w./-]+$/.test(value) && !value.includes('..'),
  listened: (elapsed, delta, playing) => elapsed + (playing && delta > 0 && delta < 2 ? delta : 0),
  ranking: rows => (Array.isArray(rows) ? rows : []).filter(x => Number.isFinite(x.count) && x.count > 0).sort((a,b)=>b.count-a.count).slice(0,10)
};
if (typeof module !== 'undefined') module.exports = Core;
if (typeof document !== 'undefined') (async () => {
  'use strict';
  const $ = s => document.querySelector(s), esc = Core.escape, main = $('#view'), audio = $('#audio');
  let manifest, currentEpisode, routeToken = 0, elapsed = 0, previousTime = 0, previousWall = performance.now(), config = {};
  const cache = new Map(), seen = new Set();
  const channel = id => manifest.channels.find(c=>c.id===id)?.name || id;
  const hash = async text => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))).map(x=>x.toString(16).padStart(2,'0')).join('');
  async function json(path) {
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
    const prefixes=[full,full.split('\n')[0],{ibat:'IBAT',vald:'Våld',kek:'Kriminell ekonomi',sjoomradet:'Sjöområdet',lagstiftning:'Lagstiftning'}[e.channel]].filter(Boolean);
    for(const prefix of prefixes.sort((a,b)=>b.length-a.length)){
      if(title.toLocaleLowerCase('sv').startsWith(prefix.toLocaleLowerCase('sv')+':')){
        title=title.slice(prefix.length+1).trim();break;
      }
    }
    if(e.kind==='introduction' && (!title||/^(uppstart|introduktion)/i.test(title)))return 'Uppstartsavsnitt';
    if(!title)return e.kind==='introduction'?'Uppstartsavsnitt':'Morgonbrief';
    return title;
  };
  const metadata = e => '<span class="channel-name">'+esc(channel(e.channel))+'</span><time class="episode-date" datetime="'+esc(e.date)+'">'+esc(e.date)+'</time>';
  const articleCard = a => '<a class="article-card" href="'+url('artikel',{id:a.id})+'"><small>'+metadata(a)+'</small><h3>'+esc(a.title)+'</h3><p>'+esc(a.summary)+'</p><span>Läs artikeln ↗</span></a>';
  const episodeRow = e => '<details class="episode" data-id="'+esc(e.id)+'"><summary><span class="row-title"><small class="item-meta">'+metadata(e)+'</small><strong>'+esc(e.title)+'</strong></span><span class="duration">'+(e.duration_seconds?Math.round(e.duration_seconds/60)+' min':'')+'</span><span aria-hidden="true">⌄</span></summary><div class="episode-body"><p>Laddar avsnitt…</p></div></details>';
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
  let toggle=$('#player-toggle');
  if(!toggle){toggle=document.createElement('button');toggle.id='player-toggle';toggle.textContent='Minimera';player.append(toggle);}
  function compactPlayer(compact){
    player.classList.toggle('compact',compact);
    if(toggle){toggle.textContent=compact?'Visa spelaren':'Minimera';toggle.setAttribute('aria-expanded',String(!compact));toggle.setAttribute('aria-label',compact?'Visa hela spelaren':'Minimera spelaren');}
    document.body.classList.toggle('player-compact',compact);
  }
  if(toggle)toggle.addEventListener('click',()=>compactPlayer(!player.classList.contains('compact')));
  audio.addEventListener('timeupdate',()=>{
    const delta = audio.currentTime-previousTime, now=performance.now(), wall=(now-previousWall)/1000; previousTime=audio.currentTime;previousWall=now;
    elapsed=Core.listened(elapsed,wall,!audio.paused&&!audio.seeking&&delta>0&&delta<4);
    if(elapsed>=30&&currentEpisode) track('listen',currentEpisode.id);
  });
  audio.addEventListener('seeking',()=>{previousTime=audio.currentTime;previousWall=performance.now();});
  audio.addEventListener('error',()=>{$('#player-status').textContent='Ljudfilen kunde inte spelas. Försök igen.';});
  async function play(e) {
    if(!Core.safePath(e.audio))return;
    if(currentEpisode?.id!==e.id){currentEpisode=e;audio.src=e.audio;elapsed=0;previousTime=0;}
    $('#player').hidden=false;$('#player-title').textContent=episodeTitle(e);$('#player-status').textContent=channel(e.channel);
    document.body.classList.add('has-player');
    if(!player.dataset.initialized){player.dataset.initialized='true';compactPlayer(matchMedia('(max-width: 650px)').matches);}
    try {await audio.play();} catch {$('#player-status').textContent='Tryck på spela i ljudspelaren.';}
  }
  main.addEventListener('toggle',async event=>{
    const node=event.target;
    if(!node.matches?.('details.episode')||!node.open)return;
    main.querySelectorAll('details.episode[open]').forEach(other=>{if(other!==node)other.open=false;});
    const body=node.querySelector('.episode-body');
    try {
      const e=await detail('episodes',node.dataset.id);
      if(!node.isConnected)return;
      body.innerHTML='<button class="primary play">▶ Spela avsnittet</button><h3>Om avsnittet</h3><p>'+esc(e.description)+'</p><h3>Ämnen</h3><div class="tags">'+(tags(e)||'<span class="muted">Ämnen saknas för detta äldre avsnitt.</span>')+'</div><h3>Artiklar i avsnittet</h3>'+(e.articles.length?e.articles.map(articleCard).join(''):'<p class="muted">Detta avsnitt saknar separata redaktionella artiklar.</p>');
      body.querySelector('.play').onclick=()=>play(e);
      if(node.getBoundingClientRect().top<0||node.getBoundingClientRect().top>innerHeight*.5)node.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    } catch {body.textContent='Avsnittet kunde inte laddas. Stäng och öppna för att försöka igen.';}
  },true);
  async function collection(key, target, token, maximum=Infinity) {
    const data=manifest.collections[key]||{count:0,pages:[]};
    if(!data.count){target.innerHTML='<p class="empty">Inget publicerat innehåll i detta urval ännu.</p>';return;}
    let page=0;
    const list=document.createElement('div');list.className=key.startsWith('articles')?'article-grid':'episode-list';
    const button=document.createElement('button');button.className='more';button.textContent='Visa fler';
    target.append(list,button);
    async function next(){button.disabled=true;try{const chunk=await json(data.pages[page]);if(token!==routeToken)return;list.insertAdjacentHTML('beforeend',chunk.items.slice(0,maximum).map(key.startsWith('articles')?articleCard:episodeRow).join(''));page++;button.hidden=page>=data.pages.length||page*24>=maximum;}catch{button.textContent='Kunde inte ladda. Försök igen';}button.disabled=false;}
    button.onclick=next;await next();
  }
  // Homepage shows the newest item per channel, not an arbitrary first item in a global feed.
  // Fetch one small page per visible channel; reveal further channels on demand.
  async function homeLatest(kind, target, token, initial=8) {
    const eligible=manifest.channels.filter(c=>(manifest.collections[kind+'/channel/'+c.id]?.count||0)>0);
    if(!eligible.length){target.innerHTML='<p class="empty">Inget publicerat innehåll ännu.</p>';return;}
    const list=document.createElement('div');list.className=kind==='articles'?'article-grid':'episode-list';
    const more=document.createElement('button');more.className='more';more.type='button';
    target.append(list,more);
    let shown=0;
    async function reveal(){
      more.disabled=true;
      const next=eligible.slice(shown,shown+initial);
      const results=await Promise.allSettled(next.map(async c=>{
        const path=manifest.collections[kind+'/channel/'+c.id].pages[0];
        const page=await json(path);
        return page.items?.[0]||null;
      }));
      if(token!==routeToken)return;
      const rows=results.filter(r=>r.status==='fulfilled'&&r.value).map(r=>r.value)
        .sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))||String(a.channel).localeCompare(String(b.channel)));
      list.insertAdjacentHTML('beforeend',rows.map(kind==='articles'?articleCard:episodeRow).join(''));
      shown+=next.length;
      more.hidden=shown>=eligible.length;
      more.textContent='Visa fler kanaler ('+shown+' av '+eligible.length+')';
      more.disabled=false;
      if(results.some(r=>r.status==='rejected')){
        const note=document.createElement('p');note.className='muted';note.textContent='Vissa kanaler kunde inte hämtas just nu.';target.append(note);
      }
    }
    more.onclick=reveal;
    await reveal();
  }
  function filters(kind,p) {
    return '<form id="filters"><label>Kanal<select name="channel"><option value="">Alla kanaler</option>'+manifest.channels.map(c=>'<option value="'+esc(c.id)+'" '+(p.get('channel')===c.id?'selected':'')+'>'+esc(c.name)+'</option>').join('')+'</select></label><button type="submit">Visa</button></form>';
  }
  async function render() {
    const token=++routeToken,p=new URLSearchParams(location.search),page=location.pathname.split('/').pop().replace('.html','')||'idag';
    const kind=page==='artiklar'?'articles':'episodes';
    $('#nav').querySelectorAll('a').forEach(a=>{if(a.getAttribute('href')===page+'.html')a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    main.innerHTML='<p role="status">Hämtar innehåll…</p>';
    try {
      if(page==='artikel') {
        const a=await detail('articles',p.get('id')||'');if(token!==routeToken)return;
        document.title=a.title+' | Morgonpod';
        main.innerHTML='<article class="reading"><small>'+metadata(a)+'</small><h1>'+esc(a.title)+'</h1><p class="lead">'+esc(a.summary)+'</p><div class="prose">'+String(a.body||'').split(/\n+/).map(x=>'<p>'+esc(x)+'</p>').join('')+'</div>'+(a.assessment?'<h2>Redaktionens bedömning</h2><p>'+esc(a.assessment)+'</p>':'')+(a.open_questions?.length?'<h2>Öppna frågor</h2><ul>'+a.open_questions.map(q=>'<li>'+esc(q)+'</li>').join('')+'</ul>':'')+'<div class="tags">'+tags(a)+'</div><h2>Källor</h2><ul>'+a.sources.filter(s=>/^https?:\/\//.test(s.url||'')).map(s=>'<li><a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.title||s.url)+'</a></li>').join('')+'</ul><h2>Lyssna på avsnittet</h2><a href="'+url('avsnitt',{id:a.episode_id})+'">'+esc(a.episode_title||'Öppna poddavsnittet')+'</a>'+(a.previous_reporting?.length?'<h2>Tidigare rapportering</h2>'+a.previous_reporting.filter(x=>typeof x==='string').map(id=>'<p><a href="'+url('artikel',{id})+'">Tidigare artikel</a></p>').join(''):'')+'</article>';
        track('article',a.id);return;
      }
      if(page==='avsnitt') {const e=await detail('episodes',p.get('id')||'');if(token!==routeToken)return;main.innerHTML='<h1>Poddavsnitt</h1>'+episodeRow(e);main.querySelector('details').open=true;return;}
      if(page==='statistik') {await statistics(token);return;}
      if(page==='utforska') {
        main.innerHTML='<div class="page-heading"><small>ARKIV OCH FÖRDJUPNING</small><h1>Utforska</h1><p>Hitta poddavsnitt, artiklar och ämnen.</p></div><form id="search"><label for="query">Sök i rubriker och sammanfattningar</label><div class="search-row"><input type="search" id="query" minlength="2" required placeholder="Till exempel Östersjön"><button>Sök</button></div></form><div class="tags">'+manifest.topics.map(t=>'<a class="tag" href="'+url('amne',{tag:t})+'">'+esc(t)+'</a>').join('')+'</div><section id="results" aria-live="polite"></section>';
        let searchId=0;
        $('#search').onsubmit=async event=>{event.preventDefault();const request=++searchId;const terms=$('#query').value.toLocaleLowerCase('sv').match(/[\wåäö]{2,}/g)||[];const results=$('#results');results.textContent='Söker…';try{let matches;for(const term of terms.slice(0,6)){const bucket=(await hash(term)).slice(0,2);const data=manifest.search_buckets.includes(bucket)?await json('catalog/search/'+bucket+'.json'):{};const rows=data[term]||[];matches=matches?matches.filter(x=>rows.some(y=>y.id===x.id)):rows;}if(token!==routeToken||request!==searchId)return;const rows=matches||[];let count=24;const draw=()=>{results.innerHTML='<p>'+rows.length+' träffar</p>'+rows.slice(0,count).map(x=>x.type==='articles'?articleCard(x):episodeRow(x)).join('')+(rows.length>count?'<button id="search-more">Visa fler</button>':'');$('#search-more')?.addEventListener('click',()=>{count+=24;draw();});};draw();}catch{results.textContent='Sökningen kunde inte slutföras. Försök igen.';}};
        return;
      }
      if(page==='amne') {main.innerHTML='<h1>'+esc(p.get('tag')||'Ämne')+'</h1><h2>Poddavsnitt</h2><div id="episodes"></div><h2>Artiklar</h2><div id="articles"></div>';await collection('episodes/topic/'+p.get('tag'),$('#episodes'),token);await collection('articles/topic/'+p.get('tag'),$('#articles'),token);return;}
      if(page==='idag'||page==='index') {
        document.title='Idag | Morgonpod';
        main.innerHTML='<div class="section-heading home-first"><h1>Senaste poddavsnitten</h1><a href="lyssna.html">Alla avsnitt ↗</a></div><p class="muted">Det senaste avsnittet från varje kanal.</p><div id="episodes"></div><div class="section-heading"><h2>Senaste artiklarna</h2><a href="artiklar.html">Alla artiklar ↗</a></div><p class="muted">Den senaste artikeln från varje kanal.</p><div id="articles"></div>';
        await homeLatest('episodes',$('#episodes'),token,8);
        if(token!==routeToken)return;
        await homeLatest('articles',$('#articles'),token,8);
        return;
      }
      const title=kind==='articles'?'Artiklar':'Lyssna';document.title=title+' | Morgonpod';
      main.innerHTML='<div class="page-heading"><small>'+(kind==='articles'?'NYHETER OCH SAMMANHANG':'DITT PODDBIBLIOTEK')+'</small><h1>'+title+'</h1><p>'+(kind==='articles'?'Självständiga nyhetstexter med källor och tidigare rapportering.':'Välj kanal eller hitta ditt nästa poddavsnitt.')+'</p></div>'+filters(kind,p)+'<p><a href="utforska.html">Sök i hela arkivet ↗</a></p><div id="listing"></div><section id="ranking"></section>';
      $('#filters').onsubmit=ev=>{ev.preventDefault();navigate(url(page,{channel:new FormData(ev.target).get('channel')}));};
      await collection(kind+(p.get('channel')?'/channel/'+p.get('channel'):''),$('#listing'),token);
      if(kind==='episodes'){try{const stats=await json('stats.json');if(token!==routeToken)return;const rows=Core.ranking(stats.episodes);if(rows.length)$('#ranking').innerHTML='<h2>Mest lyssnade på webben</h2><ol>'+rows.map(x=>'<li><a href="'+url('avsnitt',{id:x.id})+'">'+esc(x.title||x.id)+'</a> · '+x.count+'</li>').join('')+'</ol>';}catch{}}
    } catch {if(token===routeToken)main.innerHTML='<h1>Innehållet kunde inte hämtas</h1><p>Kontrollera anslutningen och försök igen.</p><button id="retry">Försök igen</button>';$('#retry')?.addEventListener('click',render);}
  }
  async function statistics(token) {
    main.innerHTML='<h1>Statistik</h1><p>Webbplatsens lyssningar räknas efter 30 sekunders faktisk uppspelning. Telegram ingår inte.</p><div id="stats-content"></div>';
    try{const s=await json('stats.json');if(token!==routeToken)return;
      if(!s.updated_at){$('#stats-content').innerHTML='<p class="empty">Ingen insamlad statistik ännu. Statistikanslutningen är inte aktiverad.</p>';return;}
      $('#stats-content').innerHTML='<p>Uppdaterat '+esc(s.updated_at)+'</p><label>Period<select id="period"><option value="7">7 dagar</option><option value="30">30 dagar</option><option value="36500">All historik</option></select></label><label>Kanal<select id="stats-channel"><option value="">Alla</option>'+manifest.channels.map(c=>'<option value="'+esc(c.id)+'">'+esc(c.name)+'</option>').join('')+'</select></label><div id="stats-rows"></div>';
      const draw=()=>{const cutoff=new Date(Date.now()-Number($('#period').value)*86400000).toISOString().slice(0,10),ch=$('#stats-channel').value;const days=(s.daily||[]).filter(x=>x.date>=cutoff&&(!ch||x.channel===ch));$('#stats-rows').innerHTML='<table><thead><tr><th>Datum</th><th>Kanal</th><th>Lyssningar</th><th>Artikelvisningar</th></tr></thead><tbody>'+days.map(d=>'<tr><td>'+esc(d.date)+'</td><td>'+esc(channel(d.channel))+'</td><td>'+Number(d.listens||0)+'</td><td>'+Number(d.views||0)+'</td></tr>').join('')+'</tbody></table>';};$('#period').onchange=draw;$('#stats-channel').onchange=draw;draw();
    }catch{$('#stats-content').textContent='Statistik kunde inte hämtas.';}
  }
  function navigate(href){history.pushState({},'',href);render();window.scrollTo(0,0);}
  document.addEventListener('click',e=>{const a=e.target.closest('a');if(!a||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||e.button!==0||a.target)return;const u=new URL(a.href);if(u.origin===location.origin&&u.pathname.endsWith('.html')&&u.pathname.startsWith(location.pathname.slice(0,location.pathname.lastIndexOf('/')+1))){e.preventDefault();navigate(u.pathname+u.search);}});
  window.addEventListener('popstate',render);
  try{config=await json('analytics-config.json');if(config.goatcounter&&/^https:\/\/[a-z0-9-]+\.goatcounter\.com\/count$/.test(config.goatcounter)){window.goatcounter={no_onload:true};await new Promise(resolve=>{const s=document.createElement('script');s.src='https://gc.zgo.at/count.js';s.dataset.goatcounter=config.goatcounter;s.async=true;s.onload=resolve;s.onerror=resolve;document.head.append(s);setTimeout(resolve,2500);});}}catch{}
  try{manifest=await json('catalog/manifest.json');await render();}catch{main.innerHTML='<h1>Arkivet är tillfälligt otillgängligt</h1><p>Försök ladda sidan igen.</p>';}
  if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
})();
