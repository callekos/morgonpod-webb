const fs=require('node:fs');
const path=require('node:path');
const Core=require('../../app.js');

// These scenarios exercise a complete or partial morning independently of
// how many real producer deliveries happen to have arrived on the test date.
async function morningFixture(page,count=4){
 const root=path.resolve(__dirname,'../..');
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'catalog/manifest.json')));
 const episodes=JSON.parse(fs.readFileSync(path.join(root,'episodes.json'))).episodes;
 for(const [i,channel] of ['ibat','vald','sjoomradet','kek'].entries()){
  const episode=episodes.find(e=>e.channel===channel&&Core.ordinary(e)&&!manifest.superseded?.[e.id]);
  if(!episode)throw Error('Missing ordinary playback fixture for '+channel);
  const collection=manifest.collections['episodes/ordinary/channel/'+channel];
  if(!collection?.pages?.length)throw Error('Missing ordinary collection for '+channel);
  await page.route('**/'+collection.pages[0],r=>r.fulfill({json:{items:i<count?[{...episode,date:'2026-10-21'}]:[]}}));
 }
}
module.exports={morningFixture};
