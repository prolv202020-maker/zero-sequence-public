/* 第零序列 · 四首原创情绪配乐，不含朗读/说书功能。 */
(() => {
  'use strict';
  if(window.__zsMusicV2Loaded)return;
  window.__zsMusicV2Loaded=true;
  const ROOT='/zero-sequence-public/';
  const TRACKS={
    quiet:{name:'静谧阅读',sub:'PIANO · WARM STRINGS',file:'quiet.mp3',color:'#e5c994'},
    heroic:{name:'热血征途',sub:'ORCHESTRAL · HEROIC',file:'heroic.mp3',color:'#f0a779'},
    sorrow:{name:'悲伤回忆',sub:'PIANO · MELANCHOLY',file:'sorrow.mp3',color:'#b8bddf'},
    mystery:{name:'未知探索',sub:'MYSTERY · ADVENTURE',file:'mystery.mp3',color:'#b5a4e7'}
  };
  const KEY_VOLUME='zs_audio_volume';
  const KEY_MOOD='zs_audio_mood_v2';
  const KEY_ENABLED='zs_audio_enabled';
  let mood=localStorage.getItem(KEY_MOOD);
  if(!TRACKS[mood])mood='quiet';
  const rawVolume=localStorage.getItem(KEY_VOLUME);
  const storedVolume=rawVolume===null?NaN:Number(rawVolume);
  let volume=Number.isFinite(storedVolume)&&storedVolume>=0?Math.min(.45,storedVolume):.14;
  let current=null,playing=false,fadeId=0,changeSerial=0;
  const reduceMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches||false;
  const clamp=n=>Math.max(0,Math.min(1,n));
  function build(){
    if(document.getElementById('zs-audio'))return;
    const style=document.createElement('style');
    style.id='zs-audio-style';
    style.textContent=`
      .zs-audio{--zs-accent:#e5c994;position:fixed;right:16px;bottom:16px;z-index:9999;width:min(370px,calc(100vw - 24px));display:flex;align-items:center;gap:11px;padding:12px 14px;border:1px solid #d7c19b6d;border-radius:17px;background:#11182bec;box-shadow:0 16px 40px #05091866;color:#f5eada;font-family:inherit;backdrop-filter:blur(12px)}
      .zs-audio .zs-play{border:1px solid #d9c09480;border-radius:50%;width:44px;height:44px;min-width:44px;background:#343c5b;color:#fff4e2;cursor:pointer;font-size:18px}
      .zs-audio .zs-play:focus-visible,.zs-audio select:focus-visible,.zs-audio input:focus-visible{outline:2px solid #f1d3a1;outline-offset:3px}
      .zs-audio .zs-copy{flex:1;min-width:0}.zs-audio .zs-title{font-size:13px;font-weight:600;color:#f5e4bd;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
      .zs-audio .zs-sub{font-size:10px;color:#c5c2d4;margin-top:4px;letter-spacing:.06em;line-height:1.4}
      .zs-audio select{max-width:100%;width:100%;margin-top:7px;padding:7px 9px;border-radius:8px;border:1px solid #bda77e72;background:#242e4b;color:#f7e6c5;font-size:12px;cursor:pointer}
      .zs-audio .zs-vol{display:flex;flex-direction:column;align-items:center;gap:5px;font-size:11px;color:#d4d0dc}
      .zs-audio input[type=range]{width:68px;accent-color:#e4c68c;cursor:pointer}
      .zs-audio.is-playing{border-color:var(--zs-accent)}
      @media(max-width:560px){.zs-audio{bottom:8px;right:8px;width:calc(100vw - 16px);padding:9px 11px;gap:8px}.zs-audio .zs-vol input{width:53px}}
    `;
    document.head.append(style);
    const box=document.createElement('aside');box.className='zs-audio';box.id='zs-audio';box.setAttribute('aria-label','原创背景音乐播放器');
    const play=document.createElement('button');play.className='zs-play';play.type='button';play.textContent='▶';play.setAttribute('aria-label','播放背景音乐');
    const copy=document.createElement('div');copy.className='zs-copy';
    const title=document.createElement('div');title.className='zs-title';
    const sub=document.createElement('div');sub.className='zs-sub';sub.textContent='手动播放 · 不自动开启';
    const select=document.createElement('select');select.className='zs-mood';select.setAttribute('aria-label','选择背景音乐情绪');
    Object.entries(TRACKS).forEach(([k,v])=>{const option=document.createElement('option');option.value=k;option.textContent=v.name;select.append(option)});
    select.value=mood;copy.append(title,sub,select);
    const vol=document.createElement('label');vol.className='zs-vol';vol.textContent='音量';
    const slider=document.createElement('input');slider.className='zs-slider';slider.type='range';slider.min='0';slider.max='0.45';slider.step='.01';slider.value=String(volume);slider.setAttribute('aria-label','背景音乐音量');
    vol.append(slider);box.append(play,copy,vol);document.body.append(box);
    function update(){title.textContent=TRACKS[mood].name;box.style.setProperty('--zs-accent',TRACKS[mood].color);play.textContent=playing?'Ⅱ':'▶';play.setAttribute('aria-label',playing?'暂停背景音乐':'播放背景音乐');sub.textContent=(playing?'正在播放 · ':'点击播放 · ')+TRACKS[mood].sub;box.classList.toggle('is-playing',playing);}
    update();
    play.addEventListener('click',async()=>{if(playing)stop();else await start();update();});
    select.addEventListener('change',async()=>{const value=select.value;if(!TRACKS[value])return;mood=value;localStorage.setItem(KEY_MOOD,mood);if(playing){await switchTrack();}update();});
    slider.addEventListener('input',()=>{volume=clamp(Number(slider.value));volume=Math.min(.45,volume);localStorage.setItem(KEY_VOLUME,String(volume));if(current){current.volume=volume;}});
    // 旧版自动播放偏好不再触发新的音频，避免阅读时突然响起。
    window.addEventListener('pagehide',()=>{++fadeId;if(current){current.pause();current.src='';current=null;}playing=false;});
  }
  function makeAudio(){const audio=new Audio(ROOT+'assets/audio/'+TRACKS[mood].file);audio.loop=true;audio.preload='none';audio.volume=0;return audio;}
  function fade(audio,from,to,ms,onDone){
    const serial=++fadeId;const start=performance.now();
    const step=()=>{if(serial!==fadeId)return;const p=Math.min(1,(performance.now()-start)/ms);audio.volume=clamp(from+(to-from)*(p*p*(3-2*p)));if(p<1)requestAnimationFrame(step);else onDone?.();};
    if(ms===0){audio.volume=to;onDone?.();return;}requestAnimationFrame(step);
  }
  async function start(){
    if(playing)return;
    ++fadeId; if(current){current.pause();current.src='';current=null;}
    const audio=makeAudio();current=audio;
    try{await audio.play();playing=true;localStorage.setItem(KEY_ENABLED,'1');fade(audio,0,volume,reduceMotion?350:1300);}
    catch(e){playing=false;current=null;const sub=document.querySelector('.zs-audio .zs-sub');if(sub)sub.textContent='音乐加载失败，请检查网络后重试';}
  }
  function stop(){if(!current)return;const audio=current;playing=false;localStorage.setItem(KEY_ENABLED,'0');fade(audio,audio.volume,0,reduceMotion?150:450,()=>{audio.pause();if(current===audio)current=null;});}
  async function switchTrack(){
    const old=current,serial=++changeSerial;
    ++fadeId;
    const next=makeAudio();current=next;
    try{
      await next.play();
      if(serial!==changeSerial){next.pause();return;}
      playing=true;
      const started=performance.now(),from=old?.volume||0,duration=reduceMotion?300:1100;
      const tick=()=>{
        if(serial!==changeSerial){old?.pause();return;}
        const p=Math.min(1,(performance.now()-started)/duration),smooth=p*p*(3-2*p);
        next.volume=clamp(volume*smooth);
        if(old)old.volume=clamp(from*(1-smooth));
        if(p<1)requestAnimationFrame(tick);
        else if(old){old.pause();old.src='';}
      };
      requestAnimationFrame(tick);
    }catch(e){next.pause();current=old;playing=!!old;if(old){old.volume=volume;try{await old.play();}catch(_){playing=false;}}}
  }
  function init(){
    build();
    if(!document.querySelector('script[src*="progressive-archive.js"]')){
      const unlock=document.createElement('script');unlock.src=ROOT+'assets/js/progressive-archive.js?v=12';document.body.appendChild(unlock);
    }
    if(!document.querySelector('script[src*="reader-experience.js"]')){
      const reader=document.createElement('script');reader.src=ROOT+'assets/js/reader-experience.js?v=2';document.body.appendChild(reader);
    }
    if(!document.querySelector('script[src*="visitor-analytics.js"]')){
      const analytics=document.createElement('script');analytics.src=ROOT+'assets/js/visitor-analytics.js?v=1';analytics.defer=true;document.body.appendChild(analytics);
    }
    if('serviceWorker' in navigator)navigator.serviceWorker.register(ROOT+'sw.js').catch(()=>{});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();