const test=require('node:test');const assert=require('node:assert/strict');const core=require('../app.js');const fs=require('node:fs');
test('reject unsafe content paths',()=>{for(const p of ['https://evil.test/a','episodes/../secret','javascript:alert(1)'])assert.equal(core.safePath(p),false);assert.equal(core.safePath('episodes/test/audio.mp3'),true);});
test('escape all markup and attribute delimiters',()=>assert.equal(core.escape('<img "x" & \'y\'>'),'&lt;img &quot;x&quot; &amp; &#39;y&#39;&gt;'));
test('seeking and pauses cannot create listens',()=>{assert.equal(core.listened(10,200,true),10);assert.equal(core.listened(10,1,false),10);assert.equal(core.listened(29,1,true),30);});
test('ranking only uses actual positive numeric counts',()=>{assert.deepEqual(core.ranking([{id:'a',count:0},{id:'b',count:4},{id:'c',count:'9'}]),[{id:'b',count:4}]);});
test('all pages share the canonical assets and shell',()=>{for(const p of ['index','idag','lyssna','artiklar','utforska','artikel','avsnitt','amne','statistik']){const s=fs.readFileSync(p+'.html','utf8');assert.match(s,/app.js\?v=/);assert.match(s,/viewport-fit=cover/);assert.match(s,/id="audio"/);assert.doesNotMatch(s,/morgonpod-ui/);}});
test('static catalog details and list files exist',()=>{const m=JSON.parse(fs.readFileSync('catalog/manifest.json'));for(const c of Object.values(m.collections))for(const p of c.pages){const data=JSON.parse(fs.readFileSync(p));assert.ok(data.items.length<=24);for(const item of data.items)assert.ok(fs.existsSync(item.detail));}});

test('all public routes omit legacy footer and share current cache-busted assets',()=>{
 const routes=['index','idag','lyssna','artiklar','utforska','artikel','avsnitt','amne','statistik','kanaler'];
 const versions=new Set();
 for(const route of routes){
  const html=fs.readFileSync(route+'.html','utf8');
  assert.doesNotMatch(html,/<footer\b|Morgonpod · Nyheter från öppna källor|Version 20261017-archive2/);
  const script=html.match(/app\.js\?v=([a-zA-Z0-9-]+)/);
  const css=html.match(/style\.css\?v=([a-zA-Z0-9-]+)/);
  assert.ok(script,route+' must load the canonical app');
  assert.ok(css,route+' must load the canonical stylesheet');
  assert.equal(script[1],css[1]);
  versions.add(script[1]);
 }
 assert.equal(versions.size,1);
});

test('Morgonpodden branding and clean episode hierarchy',()=>{for(const p of ['index','idag','lyssna','artiklar','utforska','artikel','avsnitt','amne','statistik','kanaler']){const html=fs.readFileSync(p+'.html','utf8');assert.match(html,/>Morgonpodden<\/a>/);}const js=fs.readFileSync('app.js','utf8');assert.doesNotMatch(js,/channel-mark/);assert.doesNotMatch(js,/body\.innerHTML='<small>'\+metadata\(e\)/);assert.match(js,/const episodeRow/);});

test('channel directory and profile navigation are wired on all primary pages',()=>{
  const app=fs.readFileSync('app.js','utf8');
  assert.ok(app.includes("page==='kanaler'"));
  assert.ok(app.includes("page==='kanal'"));
  assert.ok(app.includes('Om kanalen'));
  assert.ok(app.includes("kind+'/channel/'"));
  assert.ok(app.includes("'articles/channel/'"));
  for(const page of ['idag','lyssna','artiklar','utforska','kanaler','kanal']){
    const html=fs.readFileSync(page+'.html','utf8');
    assert.ok(html.includes('href="kanaler.html">'));
    assert.ok(html.includes('playback-queue.js?v=v2-queue-ux2'));
  }
});

