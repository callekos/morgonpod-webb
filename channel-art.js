(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.ChannelArt=api;
})(typeof window!=='undefined'?window:this,function(){
  'use strict';
  const CHANNELS=['ibat','vald','sjoomradet','kek','lagstiftning','ai_brottsbekampning','it_juridik','verksamhetsutveckling'];
  const KEY='morgonpod-art-style';
  function complete(style){return style?.status==='ready'&&CHANNELS.every(id=>['small','wide','square'].every(size=>/^assets\/[a-z0-9_./-]+\.webp(?:\?v=[\w-]+)?$/.test(style.channels?.[id]?.[size]||'')));}
  function create(manifest,storage){
    const styles=(manifest.styles||[]).filter(complete);let selected='v3';
    try{const saved=storage?.getItem(KEY);if(styles.some(s=>s.id===saved))selected=saved;}catch{}
    const find=id=>styles.find(s=>s.id===id)||styles.find(s=>s.id==='v3');
    return {
      styles,
      get selected(){return selected;},
      style:id=>find(id),
      resolve(id,square=false,styleId=selected){const style=find(styleId),entry=style?.channels[id]||find('v3')?.channels[id]||find('v3')?.channels.ibat;return {...entry,src:square?entry.square:entry.wide,srcset:square?'':entry.small+' 400w, '+entry.wide+' 960w',width:square?640:960,height:640};},
      select(id){if(!styles.some(s=>s.id===id))return false;selected=id;try{if(id==='v3')storage?.removeItem(KEY);else storage?.setItem(KEY,id);}catch{}return true;}
    };
  }
  return {CHANNELS,KEY,complete,create};
});
