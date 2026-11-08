/* 第零序列 · 有声中心：13卷完整音频、17卷文字版、逐章进度与连续播放。 */
(() => {
  'use strict';
  const api=window.ZSAudiobook;
  const root=document.getElementById('zs-ab-player-card');
  if(!api||!root)return;
  const $=id=>document.getElementById(id);
  const volumeSelect=$('zs-ab-volume'),chapterSelect=$('zs-ab-chapter'),audio=$('zs-ab-audio');
  const status=$('zs-ab-status'),title=$('zs-ab-track-title'),position=$('zs-ab-position');
  const download=$('zs-ab-download'),readLink=$('zs-ab-chapter-link');
  const prevBtn=$('zs-ab-prev'),nextBtn=$('zs-ab-next'),rewindBtn=$('zs-ab-rewind'),forwardBtn=$('zs-ab-forward');
  const resumeBtn=$('zs-ab-resume'),autoBox=$('zs-ab-autonext'),showTitles=$('zs-ab-show-titles');
  const volumeGrid=$('zs-ab-volume-grid'),chapterGrid=$('zs-ab-chapter-grid');
  const fmt=n=>{const t=Math.max(0,Math.floor(Number(n)||0));return Math.floor(t/60)+':'+String(t%60).padStart(2,'0');};
  const make=(tag,klass,text)=>{const el=document.createElement(tag);if(klass)el.className=klass;if(text!==undefined)el.textContent=text;return el;};
  const pad=n=>String(n).padStart(2,'0');
  let catalog=null,selected={volume:1,chapter:0},showUnread=false,lastSavedAt=0;
  const announce=message=>{status.textContent=message;};
  const volumeInfo=v=>catalog?.volumes?.[v-1]||null;
  const partProgress=part=>{
    if(window.ZSUnlock?.get)return window.ZSUnlock.get(part)||{};
    try{return JSON.parse(localStorage.getItem('zs:part-progress:v1')||'{}')['p'+pad(part)]||{};}catch{return {};}
  };
  const isRead=(v,c)=>{
    const part=Math.floor((v-1)/10)+1,progress=partProgress(part);
    return c===0?!!progress.prologue:Number(progress.max||0)>=((v-1)%10)*10+c;
  };
  const revealName=(v,c)=>showUnread||isRead(v,c);
  const chapterName=(v,c)=>c===0?catalog.prologueTitle:volumeInfo(v)?.chapters?.[c-1]||('第'+c+'章');
  const chapterDisplay=(v,c)=>{
    const prefix=c===0?'序章':'第'+c+'章';
    return revealName(v,c)?prefix+' · '+chapterName(v,c):prefix+' · 标题未解锁';
  };
  function refreshPosition(){
    if(!api.available(selected.volume,selected.chapter)){position.textContent='此卷暂无有声版本';return;}
    const prior=api.saved(selected.volume,selected.chapter);
    const sec=audio.currentTime>0&&audio.currentSrc?audio.currentTime:prior?.seconds||0;
    const dur=Number.isFinite(audio.duration)?audio.duration:prior?.duration||0;
    position.textContent=prior?.completed?'本章已听完':'收听进度：'+fmt(sec)+(dur?' / '+fmt(dur):'（可在此设备续听）');
  }
  function saveCurrent(){
    const v=selected.volume,c=selected.chapter;
    if(!api.available(v,c)||audio.ended)return;
    if(audio.currentTime>0&&Number.isFinite(audio.currentTime)&&audio.currentSrc===new URL(api.audioUrl(v,c),location.href).href){
      api.save(v,c,audio.currentTime,audio.duration);
    }
  }
  function updateVolumeSelect(){
    volumeSelect.replaceChildren();
    for(let v=1;v<=30;v++){
      const opt=make('option','', '第'+pad(v)+'卷'+(v<=13?' · 有声《'+volumeInfo(v).title+'》':' · 暂无有声（可读）'));
      opt.value=String(v);volumeSelect.append(opt);
    }
  }
  function updateChapterSelect(){
    chapterSelect.replaceChildren();
    if(!api.available(selected.volume,selected.volume===1?0:1)){chapterSelect.disabled=true;return;}
    chapterSelect.disabled=false;
    for(let c=selected.volume===1?0:1;c<=10;c++){
      const opt=make('option','',chapterDisplay(selected.volume,c));
      opt.value=String(c);chapterSelect.append(opt);
    }
    chapterSelect.value=String(selected.chapter);
  }
  function drawVolumes(){
    const fragment=document.createDocumentFragment();
    for(let v=1;v<=30;v++){
      const voiced=v<=13;
      const card=make('article','zs-ab-volume-card');
      card.dataset.volume=String(v);card.dataset.selected=String(v===selected.volume);
      const image=make('img');image.src=api.ROOT+'assets/images/covers/volume-'+pad(v)+'.webp';
      image.loading='lazy';image.decoding='async';image.alt='第'+v+'卷正式封面';
      card.append(image,make('span','zs-ab-volume-label','VOL '+pad(v)+' · 第'+(Math.floor((v-1)/10)+1)+'篇'));
      const label=make('strong','',voiced?(showUnread||isRead(v,1)?'《'+volumeInfo(v).title+'》':'第'+v+'卷 · 标题未解锁'):'第'+v+'卷');
      card.append(label,make('span','zs-ab-available'+(voiced?'':' zs-ab-unavailable'),voiced?'✓ 完整有声 · 10章':'暂未配音 · 文字版'));
      if(voiced){
        const button=make('button','','选择此卷收听');button.type='button';
        button.addEventListener('click',()=>{selectTrack(v,v===1?0:1);root.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});});
        card.append(button);
      }else{
        const link=make('a','zs-ab-readonly','阅读第'+v+'卷正文 →');
        link.href=api.ROOT+'volumes/volume-'+pad(v)+'.html';
        card.append(link);
      }
      fragment.append(card);
    }
    volumeGrid.replaceChildren(fragment);
  }
  function drawChapters(){
    const v=selected.volume;
    if(v>13){
      const empty=make('p','zs-ab-empty','第'+v+'卷尚未制作有声版。可直接阅读已经公开的十章正文；配音完成前不会显示虚假的播放链接。');
      const link=make('a','','打开第'+v+'卷目录 →');link.href=api.ROOT+'volumes/volume-'+pad(v)+'.html';
      empty.append(document.createTextNode(' '),link);
      chapterGrid.replaceChildren(empty);
      return;
    }
    const fragment=document.createDocumentFragment();
    for(let c=v===1?0:1;c<=10;c++){
      const item=make('article','zs-ab-chapter-row');
      item.dataset.selected=String(v===selected.volume&&c===selected.chapter);
      const copy=make('div','zs-ab-chapter-copy');
      copy.append(make('strong','',chapterDisplay(v,c)));
      const prior=api.saved(v,c);
      copy.append(make('small','',prior?.completed?'✓ 已听完':prior?.seconds?'已听 '+fmt(prior.seconds):'未收听'));
      const choose=make('button','','收听');choose.type='button';choose.setAttribute('aria-label','收听第'+v+'卷'+(c===0?'序章':'第'+c+'章'));
      choose.addEventListener('click',()=>selectTrack(v,c,true));
      item.append(copy,choose);fragment.append(item);
    }
    chapterGrid.replaceChildren(fragment);
  }
  function refreshLinks(){
    const v=selected.volume,c=selected.chapter,voiced=api.available(v,c);
    download.hidden=!voiced;download.setAttribute('aria-disabled',String(!voiced));
    if(voiced){
      download.href=api.audioUrl(v,c);
      download.download='第零序列_第'+v+'卷_'+(c===0?'序章':'第'+c+'章')+'_ZiYue_V4.mp3';
      readLink.href=api.chapterUrl(v,c);readLink.textContent='阅读本章正文 →';
    }else{
      download.removeAttribute('href');readLink.href=api.ROOT+'volumes/volume-'+pad(v)+'.html';
      readLink.textContent='打开第'+v+'卷文字版目录 →';
    }
    prevBtn.disabled=!voiced||!api.previous(v,c);
    nextBtn.disabled=!voiced||!api.next(v,c);
    rewindBtn.disabled=!voiced;forwardBtn.disabled=!voiced;
  }
  function persistUrl(){
    if(!window.history?.replaceState)return;
    const u=new URL(window.location.href);
    u.searchParams.set('volume',selected.volume);
    if(api.available(selected.volume,selected.chapter))u.searchParams.set('chapter',selected.chapter);
    else u.searchParams.delete('chapter');
    window.history.replaceState(null,'',u.pathname+u.search+u.hash);
  }
  function selectTrack(volume,chapter,start=false){
    const v=Number(volume),c=Number(chapter);
    if(v<1||v>30||!Number.isInteger(v))return;
    const voiced=v<=13,chosen=voiced?(api.available(v,c)?c:v===1?0:1):0;
    const same=v===selected.volume&&chosen===selected.chapter&&audio.hasAttribute('src');
    if(same){
      if(start)startPlaying();
      return;
    }
    saveCurrent();audio.pause();lastSavedAt=0;
    selected={volume:v,chapter:chosen};
    volumeSelect.value=String(v);updateChapterSelect();
    title.textContent=voiced?'第'+v+'卷《'+volumeInfo(v).title+'》· '+(chosen===0?'序章':('第'+chosen+'章'))+' · '+chapterName(v,chosen):'第'+v+'卷 · 尚未配音';
    if(voiced){
      audio.src=api.audioUrl(v,chosen);audio.load();
      announce('已选中本章。点击播放开始；已有进度会自动恢复。');
    }else{
      audio.removeAttribute('src');audio.load();
      announce('此卷尚未配音，请使用文字版入口。');
    }
    refreshLinks();drawChapters();drawVolumes();persistUrl();refreshPosition();
    if(start&&voiced)startPlaying();
  }
  function startPlaying(){
    if(!api.available(selected.volume,selected.chapter))return;
    const promise=audio.play();
    if(promise&&typeof promise.catch==='function')promise.catch(()=>{
      announce('浏览器阻止了自动衔接，点击播放器的播放键即可继续。');
    });
  }
  function move(direction,start){
    const target=direction==='next'?api.next(selected.volume,selected.chapter):api.previous(selected.volume,selected.chapter);
    if(target)selectTrack(target.volume,target.chapter,start);
  }
  audio.addEventListener('loadedmetadata',()=>{
    const prior=api.saved(selected.volume,selected.chapter);
    if(prior&&!prior.completed&&prior.seconds>0&&Number.isFinite(audio.duration)&&prior.seconds<audio.duration-2){
      try{audio.currentTime=prior.seconds;}catch{/* Some mobile players need a later seek */ }
    }
    refreshPosition();
  });
  audio.addEventListener('play',()=>{
    api.pauseBgm();announce('正在播放 · 背景音乐已自动暂停（如之前开启）。');
  });
  audio.addEventListener('timeupdate',()=>{
    refreshPosition();
    if(audio.currentTime-lastSavedAt>=4||audio.currentTime<lastSavedAt){
      lastSavedAt=audio.currentTime;saveCurrent();
    }
  });
  audio.addEventListener('pause',()=>{if(!audio.ended){saveCurrent();refreshPosition();}});
  audio.addEventListener('seeked',()=>{saveCurrent();refreshPosition();});
  audio.addEventListener('ended',()=>{
    api.save(selected.volume,selected.chapter,0,audio.duration,true);
    drawChapters();refreshPosition();
    const following=api.next(selected.volume,selected.chapter);
    if(following&&autoBox.checked){
      selectTrack(following.volume,following.chapter,true);
    }else{
      announce(following?'本章播放完毕。可点击“下一段”继续。':'前13卷有声内容已全部播放完毕。');
    }
  });
  audio.addEventListener('error',()=>{
    if(!api.available(selected.volume,selected.chapter))return;
    announce('音频未能加载。请检查网络，或使用下方下载 MP3 链接。');
  });
  audio.addEventListener('waiting',()=>announce('音频加载中，请检查网络连接。'));
  prevBtn.addEventListener('click',()=>move('prev',true));
  nextBtn.addEventListener('click',()=>move('next',true));
  rewindBtn.addEventListener('click',()=>{audio.currentTime=Math.max(0,audio.currentTime-15);});
  forwardBtn.addEventListener('click',()=>{if(Number.isFinite(audio.duration))audio.currentTime=Math.min(audio.duration-1,audio.currentTime+15);});
  resumeBtn.addEventListener('click',()=>{
    const last=api.last()||{volume:1,chapter:0};
    selectTrack(last.volume,last.chapter,true);
  });
  volumeSelect.addEventListener('change',()=>selectTrack(Number(volumeSelect.value),Number(volumeSelect.value)===1?0:1));
  chapterSelect.addEventListener('change',()=>selectTrack(selected.volume,Number(chapterSelect.value)));
  autoBox.checked=api.autoNext();
  autoBox.addEventListener('change',()=>api.setAutoNext(autoBox.checked));
  showTitles.addEventListener('change',()=>{
    showUnread=showTitles.checked;
    updateChapterSelect();drawChapters();drawVolumes();
  });
  window.addEventListener('pagehide',saveCurrent);
  async function init(){
    try{
      const response=await fetch(api.ROOT+'assets/data/audiobook-catalog.json?v=1');
      if(!response.ok)throw new Error('目录 HTTP '+response.status);
      const data=await response.json();
      if(!Array.isArray(data.volumes)||data.volumes.length!==13||data.volumes.some(v=>!Array.isArray(v.chapters)||v.chapters.length!==10))
        throw new Error('有声目录不完整');
      catalog=data;updateVolumeSelect();
      const params=new URLSearchParams(location.search);
      const requestedVolume=Number(params.get('volume'));
      const requestedChapter=Number(params.get('chapter'));
      const last=api.last();
      const v=Number.isInteger(requestedVolume)&&requestedVolume>=1&&requestedVolume<=30?requestedVolume:last?.volume||1;
      const c=params.has('chapter')?requestedChapter:(params.has('volume')?(v===1?0:1):(last?.chapter??0));
      selectTrack(v,c);
      announce(last?'已载入上次收听位置。播放需要手动开始。':'目录已载入。从序章开始，或选择喜欢的卷目。');
    }catch(err){
      announce('有声目录加载失败，请检查网络后刷新。原有小说阅读与 MP3 文件不受影响。');
      const backup=make('p','zs-ab-empty','目录暂时无法加载。可从文字版书库进入章节收听已发表音频。');
      const link=make('a','','返回30卷目录 →');link.href=api.ROOT+'index.html#volumes';
      backup.append(document.createTextNode(' '),link);
      chapterGrid.replaceChildren(backup);
    }
  }
  init();
})();
