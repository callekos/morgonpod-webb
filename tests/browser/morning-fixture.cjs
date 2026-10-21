const fs=require('node:fs');
const path=require('node:path');
const Core=require('../../app.js');

// These scenarios exercise a complete or partial morning independently of
// how many real producer deliveries happen to have arrived on the test date.
async function morningFixture(page,count=4){
 const root=path.resolve(__dirname,'../..');
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'catalog/manifest.json')));
 for(const [i,channel] of ['ibat','vald','sjoomradet','kek'].entries()){
  const collection=manifest.collections['episodes/ordinary/channel/'+channel];
  if(!collection?.pages?.length)throw Error('Missing ordinary collection for '+channel);
  const episodes=JSON.parse(fs.readFileSync(path.join(root,collection.pages[0]))).items;
  const episode=episodes.find(e=>e.channel===channel&&Core.ordinary(e)&&!manifest.superseded?.[e.id]);
  if(!episode?.id)throw Error('Missing canonical ordinary playback fixture for '+channel);
  await page.route('**/'+collection.pages[0],r=>r.fulfill({json:{items:i<count?[{...episode,date:'2026-10-21'}]:[]}}));
 }
}
module.exports={morningFixture};
