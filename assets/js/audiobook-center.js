/* 第零序列 · 有声阅读中心：仅使用已发布 MP3，不产生 TTS 请求。 */
(()=>{'use strict';
const ROOT='/zero-sequence-public/';
const TITLES=['重返','初临','暗流','无声之城','灰石盟约','失落商道','白霜边境','百城之约','黑风试炼','无名之门','契约之外','无影商路','锻火账本'];
const LAST='zs:audiobook:last:v1',POSITIONS='zs:audiobook:positions:v1',AUTO='zs:audiobook:continuous:v1';
const maxVolume=TITLES.length;
const $=s=>document.querySelector(s);
const audio=$('#zs-listening-audio'),volumes=$('#zs-listening-volumes'),chapters=$('#zs-listening-chapters');
if(!audio||!volumes||!chapters)return;
const current=$('#zs-listening-current'),message=$('#zs-listening-message'),clock=$('#zs-listening-clock'),
seek=$('#zs-listening-seek'),prev=$('#zs-listening-prev'),next=$('#zs-listening-next'),auto=$('#zs-listening-auto'),
read=$('#zs-listening-read'),download=$('#zs-listening-download'),chapterTitle=$('#zs-listening-chapters-title');
const pad=n=>String(n).padStart(2,'0'),three=n=>String(n).padStart(3,'0');
const valid=(v,n)=>Number.isInteger(v)&&v>=1&&v<=maxVolume&&Number.isInteger(n)&&n>=0&&n<=10&&(n>0||v===1);
const safeGet=(key,fallback)=>{try{const x=JSON.parse(localStorage.getItem(key));return x===null?fallback:x;}catch(_){return fallback;}};
const safeSet=(key,val)=>{try{localStorage.setItem(key,JSON.stringify(val));}catch(_){}};
const trackKey=(v,n)=>pad(v)+':'+three(n);
const pathFor=(v,n)=>'https://raw.githubusercontent.com/prolv202020-maker/zero-sequence-public/audio-archive-v1/assets/audio/audiobook/'+(v<=10?'part-01':'part-02')+'/volume-'+pad(v)+'/'+(n===0?'prologue':'chapter-'+three(n))+'.mp3?v=zi-yue-v4';
const pageFor=(v,n)=>ROOT+'chapters/volume-'+pad(v)+'/'+(n===0?'prologue':'chapter-'+three(n))+'.html';
const labelFor=(v,n)=>'第'+v+'卷《'+TITLES[v-1]+'》 · '+(n===0?'序章':'第'+n+'章');
const format=s=>{if(!Number.isFinite(s)||s<0)return'00:00';const t=Math.floor(s);return String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0');};
const nextTrack=(v,n)=>n<10?{v,n:n+1}:v<maxVolume?{v:v+1,n:1}:null;
const prevTrack=(v,n)=>n>1?{v,n:n-1}:n===1&&v===1?{v:1,n:0}:v>1?{v:v-1,n:10}:null;
const cachedTitles=new Map(),storedPositions=safeGet(POSITIONS,{});
const positions=storedPositions&&typeof storedPositions==='object'&&!Array.isArray(storedPositions)?storedPositions:{};
let selected=1,active=null,restoring=false,chosenToken=0,lastSave=0,pendingTime=0;
auto.checked=safeGet(AUTO,false)===true;
const link=(href,text,css)=>{const a=document.createElement('a');a.href=href;a.textContent=text;if(css)a.className=css;return a;};
const button=(text,css)=>{const b=document.createElement('button');b.type='button';b.textContent=text;if(css)b.className=css;return b;};
function announce(s){message.textContent=s;}
function snapshot(force=false){
 if(!active||audio.ended||!Number.isFinite(audio.currentTime)||audio.currentTime<0)return;
 if(!force&&Date.now()-lastSave<3000)return;
 lastSave=Date.now();const key=trackKey(active.v,active.n);
 positions[key]=Math.max(0,Math.floor(audio.currentTime));
 const keys=Object.keys(positions);if(keys.length>145){keys.sort((a,b)=>a.localeCompare(b));delete positions[keys[0]];}
 safeSet(POSITIONS,positions);safeSet(LAST,{v:active.v,n:active.n,seconds:positions[key]});
}
function restoreTime(){
 if(!active)return;
 const seconds=Number(pendingTime)||0;
 if(!Number.isFinite(audio.duration)||audio.duration<=0)return;
 const safe=Math.min(Math.max(0,seconds),Math.max(0,audio.duration-2));
 restoring=true;
 try{audio.currentTime=safe;}catch(_){}
 restoring=false;pendingTime=0;
 refresh();
 if(safe>1)announce('已恢复到上次收听位置 '+format(safe)+'；点击播放继续。');
}
function refresh(){
 const dur=Number.isFinite(audio.duration)?audio.duration:0;
 const t=Number.isFinite(audio.currentTime)?audio.currentTime:0;
 clock.textContent=format(t)+' / '+format(dur);
 seek.value=dur>0?String(Math.round(t/dur*1000)):'0';
 prev.disabled=!active||!prevTrack(active.v,active.n);
 next.disabled=!active||!nextTrack(active.v,active.n);
 for(const el of chapters.querySelectorAll('[data-zs-chapter]')){
   el.classList.toggle('is-current',!!active&&Number(el.dataset.zsChapter)===active.n&&selected===active.v);
   el.setAttribute('aria-current',el.classList.contains('is-current')?'true':'false');
 }
}
function stopBgm(){
 const music=document.querySelector('#zs-audio.is-playing .zs-play');
 if(music)music.click();
}
async function getTitles(v){
 if(cachedTitles.has(v))return cachedTitles.get(v);
 const titles={};
 try{
  const res=await fetch(ROOT+'volumes/volume-'+pad(v)+'.html',{cache:'force-cache'});
  if(!res.ok)throw Error('目录载入失败');
  const html=await res.text();
  const doc=new DOMParser().parseFromString(html,'text/html');
  for(const a of doc.querySelectorAll('a[href*="/chapters/volume-"]')){
   const match=a.getAttribute('href')?.match(/chapter-(\d{3})\.html/);
   if(!match)continue;
   const n=Number(match[1]);if(n<1||n>10)continue;
   const text=a.querySelector('span')?.textContent||a.textContent||'';
   const clean=text.replace(/【正式正文】/g,'').replace(/^第[一二三四五六七八九十]+章[\s　]*/,'').replace(/阅读\s*↗|正式正文\s*→/g,'').trim();
   if(clean&&!titles[n])titles[n]=clean;
  }
 }catch(_){}
 cachedTitles.set(v,titles);return titles;
}
function renderVolumes(){
 volumes.replaceChildren();
 for(let v=1;v<=30;v++){
  const ready=v<=maxVolume;
  const b=button('','zs-listening-volume'+(ready?'':' is-text-only'));
  b.dataset.volume=String(v);b.setAttribute('aria-pressed',String(v===selected));
  const name=document.createElement('strong');name.textContent='第'+pad(v)+'卷'+(ready?' · '+TITLES[v-1]:'');
  const status=document.createElement('small');status.textContent=ready?'🎧 已配音 · 10章':'仅正文 · 尚未配音';
  b.append(name,status);
  if(ready)b.addEventListener('click',()=>chooseVolume(v));
  else b.addEventListener('click',()=>{announce('第'+v+'卷暂未制作有声版，可使用下面的正文链接阅读。');const a=$('#zs-listening-text-only');if(a){a.href=ROOT+'volumes/volume-'+pad(v)+'.html';a.hidden=false;a.textContent='阅读第'+v+'卷的小说正文 →';}});
  volumes.append(b);
 }
 const readOnly=link(ROOT+'volumes/volume-14.html','阅读暂未配音的卷目 →','zs-listening-text-link');
 readOnly.id='zs-listening-text-only';readOnly.hidden=true;volumes.after(readOnly);
}
async function chooseVolume(v){
 if(v<1||v>maxVolume)return;
 selected=v;
 for(const b of volumes.querySelectorAll('button[data-volume]'))b.setAttribute('aria-pressed',String(Number(b.dataset.volume)===v));
 const readOnly=$('#zs-listening-text-only');if(readOnly)readOnly.hidden=true;
 chapterTitle.textContent='第'+v+'卷《'+TITLES[v-1]+'》 · 完整有声章节';
 chapters.replaceChildren();
 const placeholder=document.createElement('p');placeholder.textContent='正在读取本卷章节标题…';chapters.append(placeholder);
 const request=++chosenToken,titles=await getTitles(v);
 if(request!==chosenToken)return;
 chapters.replaceChildren();
 const first=v===1?0:1;
 for(let n=first;n<=10;n++){
  const b=button(n===0?'序章 · 最后的时刻':'第'+n+'章 · '+(titles[n]||'完整朗读'),'zs-listening-chapter');
  b.dataset.zsChapter=String(n);
  b.addEventListener('click',()=>loadTrack(v,n,false));
  chapters.append(b);
 }
 refresh();
}
async function loadTrack(v,n,playNow=false){
 if(!valid(v,n))return;
 if(active)snapshot(true);
 if(active&&active.v===v&&active.n===n&&audio.currentSrc){
  if(playNow)try{await audio.play();}catch(_){announce('浏览器禁止自动播放，请点击播放器上的播放按钮继续。');}
  return;
 }
 audio.pause();
 active={v,n};pendingTime=Math.max(0,Number(positions[trackKey(v,n)])||0);
 audio.src=pathFor(v,n);audio.load();safeSet(LAST,{v,n,seconds:pendingTime});
 current.textContent=labelFor(v,n);
 read.href=pageFor(v,n);download.href=pathFor(v,n);
 download.download='第零序列_第'+v+'卷_'+(n===0?'序章':'第'+n+'章')+'_ZiYue.mp3';
 announce('已选择 '+labelFor(v,n)+'，点击播放开始。');
 if(selected!==v)await chooseVolume(v);else refresh();
 if(playNow)try{await audio.play();}catch(_){announce('浏览器不允许自动续播，请点击播放按钮继续收听。');}
}
audio.addEventListener('loadedmetadata',()=>{restoreTime();refresh();});
audio.addEventListener('durationchange',refresh);
audio.addEventListener('timeupdate',()=>{refresh();if(!restoring)snapshot();});
audio.addEventListener('pause',()=>{if(!audio.ended)snapshot(true);});
audio.addEventListener('seeked',()=>snapshot(true));
audio.addEventListener('play',()=>{stopBgm();announce('正在收听 '+labelFor(active.v,active.n)+'；背景音乐已暂停。');});
audio.addEventListener('error',()=>announce('音频无法加载，请检查网络，或使用“下载本章 MP3”。'));
audio.addEventListener('ended',async()=>{
 if(!active)return;
 const completed={...active};positions[trackKey(completed.v,completed.n)]=0;safeSet(POSITIONS,positions);
 const upcoming=nextTrack(completed.v,completed.n);
 if(auto.checked&&upcoming){await loadTrack(upcoming.v,upcoming.n,true);}
 else announce(upcoming?'本章播放完成。点击“下一章”继续收听。':'前13卷有声朗读已全部结束。');
});
seek.addEventListener('input',()=>{
 if(!Number.isFinite(audio.duration)||audio.duration<=0)return;
 const t=Number(seek.value)/1000*audio.duration;
 if(Number.isFinite(t))audio.currentTime=t;
});
prev.addEventListener('click',()=>{if(!active)return;const p=prevTrack(active.v,active.n);if(p)loadTrack(p.v,p.n,false);});
next.addEventListener('click',()=>{if(!active)return;const p=nextTrack(active.v,active.n);if(p)loadTrack(p.v,p.n,false);});
auto.addEventListener('change',()=>safeSet(AUTO,auto.checked));
window.addEventListener('pagehide',()=>snapshot(true));
document.addEventListener('visibilitychange',()=>{if(document.hidden)snapshot(true);});
renderVolumes();
const params=new URLSearchParams(location.search);
const queryV=Number(params.get('volume')),queryN=Number(params.get('chapter'));
const saved=safeGet(LAST,null);
const target=valid(queryV,queryN)?{v:queryV,n:queryN}:(saved&&valid(saved.v,saved.n)?saved:{v:1,n:0});
chooseVolume(target.v).then(()=>loadTrack(target.v,target.n,false));
})();