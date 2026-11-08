/* 给现有小说章节播放器增加收听续播、进度与听书中心入口，不修改正文和MP3。 */
(()=>{'use strict';
const ROOT='/zero-sequence-public/',LAST='zs:audiobook:last:v1',POSITIONS='zs:audiobook:positions:v1';
const match=location.pathname.match(/\/chapters\/volume-(\d{2})\/(chapter-(\d{3})|prologue)\.html$/);
if(!match)return;
const v=Number(match[1]),n=match[3]?Number(match[3]):0;
if(v<1||v>13||n>10||(n===0&&v!==1))return;
const audio=document.getElementById('zs-chapter-narration'),panel=document.getElementById('zs-audiobook-player');
if(!audio||!panel||panel.dataset.zsEnhanced==='true')return;
panel.dataset.zsEnhanced='true';
const key=String(v).padStart(2,'0')+':'+String(n).padStart(3,'0');
const get=(k,def)=>{try{const val=JSON.parse(localStorage.getItem(k));return val===null?def:val;}catch(_){return def;}};
const put=(k,val)=>{try{localStorage.setItem(k,JSON.stringify(val));}catch(_){}};
const state=get(POSITIONS,{});
const positions=state&&typeof state==='object'&&!Array.isArray(state)?state:{};
const heading=document.createElement('p');heading.className='zs-chapter-resume';
const status=document.createElement('span');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
heading.append(status);
const actions=document.createElement('div');actions.className='zs-chapter-audio-links';
const link=(href,text)=>{const a=document.createElement('a');a.href=href;a.textContent=text;return a;};
const href=ROOT+'audiobooks.html?volume='+v+'&chapter='+n;
const prev=n===0?null:n>1?{v,n:n-1}:v===1?{v:1,n:0}:{v:v-1,n:10};
const next=n<10?{v,n:n+1}:v<13?{v:v+1,n:1}:null;
actions.append(link(href,'在有声中心连续收听'));
if(prev)actions.append(link(ROOT+'audiobooks.html?volume='+prev.v+'&chapter='+prev.n,'← 上一章音频'));
if(next)actions.append(link(ROOT+'audiobooks.html?volume='+next.v+'&chapter='+next.n,'下一章音频 →'));
panel.append(heading,actions);
const format=s=>{const t=Math.max(0,Math.floor(s||0));return String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0');};
const saved=Number(positions[key])||0;
status.textContent=saved>1?'上次听到 '+format(saved)+'，可从断点续听。':'收听进度仅保存在此设备，不影响阅读进度。';
function save(){
 if(audio.ended||!Number.isFinite(audio.currentTime)||audio.currentTime<0)return;
 positions[key]=Math.floor(audio.currentTime);
 put(POSITIONS,positions);put(LAST,{v,n,seconds:positions[key]});
}
let lastWrite=0;
audio.addEventListener('timeupdate',()=>{if(Date.now()-lastWrite>3000){lastWrite=Date.now();save();}});
audio.addEventListener('pause',save);
audio.addEventListener('seeked',save);
audio.addEventListener('ended',()=>{positions[key]=0;put(POSITIONS,positions);status.textContent='本章收听完成。可以前往有声中心继续下一章。';});
audio.addEventListener('loadedmetadata',()=>{
 if(saved>1&&Number.isFinite(audio.duration)&&audio.duration>2){
  try{audio.currentTime=Math.min(saved,Math.max(0,audio.duration-2));}catch(_){}
 }
});
audio.addEventListener('play',()=>{const bgm=document.querySelector('#zs-audio.is-playing .zs-play');if(bgm)bgm.click();});
window.addEventListener('pagehide',save);
document.addEventListener('visibilitychange',()=>{if(document.hidden)save();});
})();