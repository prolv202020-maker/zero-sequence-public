/* 第零序列 · 纯前端有声进度（与小说阅读及三篇解锁状态完全独立）。 */
(() => {
  'use strict';
  if (window.ZSAudiobook) return;
  const ROOT='/zero-sequence-public/';
  const MAX_VOLUME=13;
  const PROGRESS='zs:audiobook:progress:v1';
  const LAST='zs:audiobook:last:v1';
  const AUTO='zs:audiobook:auto-next:v1';
  const pad=(n,w)=>String(n).padStart(w,'0');
  const available=(v,c)=>Number.isInteger(v)&&v>=1&&v<=MAX_VOLUME&&Number.isInteger(c)&&c>=(v===1?0:1)&&c<=10;
  const trackKey=(v,c)=>'v'+pad(v,2)+'-'+(c===0?'prologue':pad(c,3));
  const audioUrl=(v,c)=>available(v,c)?ROOT+'assets/audio/audiobook/'+(v<=10?'part-01':'part-02')+'/volume-'+pad(v,2)+'/'+(c===0?'prologue':'chapter-'+pad(c,3))+'.mp3?v=zi-yue-v4':'';
  const chapterUrl=(v,c)=>available(v,c)?ROOT+'chapters/volume-'+pad(v,2)+'/'+(c===0?'prologue':'chapter-'+pad(c,3))+'.html':'';
  const centerUrl=(v,c)=>ROOT+'audiobooks.html?volume='+v+'&chapter='+c;
  const next=(v,c)=>!available(v,c)?null:c===0?{volume:1,chapter:1}:c<10?{volume:v,chapter:c+1}:v<MAX_VOLUME?{volume:v+1,chapter:1}:null;
  const previous=(v,c)=>!available(v,c)?null:c>1?{volume:v,chapter:c-1}:v===1?c===1?{volume:1,chapter:0}:null:{volume:v-1,chapter:10};
  const read=(key,fallback)=>{try{const value=JSON.parse(localStorage.getItem(key)||'null');return value===null?fallback:value;}catch{return fallback;}};
  const put=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));}catch{/* Private browsing / quota */}};
  function loadProgress(){
    const state=read(PROGRESS,{});
    return state&&typeof state==='object'&&!Array.isArray(state)?state:{};
  }
  function saved(v,c){
    if(!available(v,c))return null;
    const entry=loadProgress()[trackKey(v,c)];
    if(!entry||typeof entry!=='object')return null;
    const seconds=Number(entry.seconds),duration=Number(entry.duration);
    return {seconds:Number.isFinite(seconds)?Math.max(0,seconds):0,
      duration:Number.isFinite(duration)?Math.max(0,duration):0,completed:entry.completed===true};
  }
  function save(v,c,seconds,duration,completed=false){
    if(!available(v,c))return;
    const state=loadProgress();
    const length=Number.isFinite(Number(duration))&&Number(duration)>0?Number(duration):0;
    const time=Number.isFinite(Number(seconds))?Math.max(0,Number(seconds)):0;
    state[trackKey(v,c)]={seconds:completed?0:Math.min(time,length||time),duration:length,completed:!!completed,updated:Date.now()};
    put(PROGRESS,state);
    put(LAST,{volume:v,chapter:c});
  }
  function last(){
    const current=read(LAST,null);
    if(!current||!available(Number(current.volume),Number(current.chapter)))return null;
    const track={volume:Number(current.volume),chapter:Number(current.chapter)};
    return saved(track.volume,track.chapter)?.completed?next(track.volume,track.chapter)||track:track;
  }
  const autoNext=()=>read(AUTO,true)!==false;
  const setAutoNext=value=>put(AUTO,!!value);
  function pauseBgm(){
    const bgm=document.querySelector('#zs-audio.is-playing .zs-play');
    if(bgm)bgm.click();
  }
  function connectChapter(){
    const match=location.pathname.match(/\/chapters\/volume-(\d{2})\/(chapter-(\d{3})|prologue)\.html$/);
    if(!match)return;
    const v=Number(match[1]),c=match[2]==='prologue'?0:Number(match[3]);
    if(!available(v,c))return;
    const attach=()=>{
      const audio=document.getElementById('zs-chapter-narration');
      const panel=document.getElementById('zs-audiobook-player');
      if(!audio||!panel)return false;
      if(audio.dataset.zsProgressAttached==='1')return true;
      audio.dataset.zsProgressAttached='1';
      const controls=document.createElement('div');
      controls.className='zs-ab-chapter-links';
      const center=document.createElement('a');
      center.href=centerUrl(v,c);
      center.textContent='🎧 在有声中心连续收听';
      controls.append(center);
      const following=next(v,c);
      if(following){
        const nextLink=document.createElement('a');
        nextLink.href=centerUrl(following.volume,following.chapter);
        nextLink.textContent='下一章有声 →';
        controls.append(nextLink);
      }
      panel.append(controls);
      const style=document.createElement('style');
      style.textContent='.zs-ab-chapter-links{display:flex;gap:12px;flex-wrap:wrap;margin-top:12px}.zs-ab-chapter-links a{display:inline-flex;align-items:center;min-height:44px;padding:9px 14px;border:1px solid #decb9a88;border-radius:10px;color:#f1d79f;text-decoration:none;font:600 13px system-ui,sans-serif}.zs-ab-chapter-links a:focus-visible{outline:2px solid #f6dfab;outline-offset:2px}@media(max-width:600px){.zs-ab-chapter-links a{flex:1;justify-content:center}}';
      document.head.append(style);
      let ready=false,latest=0;
      audio.addEventListener('loadedmetadata',()=>{
        if(ready)return;ready=true;
        const prior=saved(v,c);
        if(prior&&!prior.completed&&prior.seconds>0&&Number.isFinite(audio.duration)&&prior.seconds<audio.duration-2){
          try{audio.currentTime=prior.seconds;}catch{/* Media not seekable yet */}
        }
      });
      audio.addEventListener('play',pauseBgm);
      audio.addEventListener('timeupdate',()=>{
        if(audio.currentTime-latest>=4||audio.currentTime<latest){
          latest=audio.currentTime;save(v,c,audio.currentTime,audio.duration);
        }
      });
      audio.addEventListener('pause',()=>{if(!audio.ended)save(v,c,audio.currentTime,audio.duration);});
      audio.addEventListener('seeked',()=>save(v,c,audio.currentTime,audio.duration));
      audio.addEventListener('ended',()=>save(v,c,0,audio.duration,true));
      window.addEventListener('pagehide',()=>{if(!audio.ended&&audio.currentTime>0)save(v,c,audio.currentTime,audio.duration);});
      return true;
    };
    if(attach())return;
    const observer=new MutationObserver(()=>{if(attach())observer.disconnect();});
    observer.observe(document.body,{childList:true,subtree:true});
    window.addEventListener('pagehide',()=>observer.disconnect(),{once:true});
  }
  window.ZSAudiobook={MAX_VOLUME,ROOT,available,trackKey,audioUrl,chapterUrl,centerUrl,next,previous,
    loadProgress,saved,save,last,autoNext,setAutoNext,pauseBgm};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',connectChapter);
  else connectChapter();
})();
