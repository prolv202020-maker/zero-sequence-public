
/* 第零序列 · 阅读设置、书签、阅读进度。仅储存于当前设备浏览器。 */
(() => {
  'use strict';
  const ROOT='/zero-sequence-public/';
  const LAST='zs:reader:last:v1', OPT='zs:reader:options:v1';
  const path=location.pathname, chapter=/\/chapters\/volume-\d\d\/(?:chapter-\d{3}|prologue)\.html$/.test(path);
  const $=s=>document.querySelector(s);
  const get=k=>{try{return JSON.parse(localStorage.getItem(k)||'null');}catch{return null;}};
  const put=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch{}};
  const clean=s=>(s||'').replace(/\s+/g,' ').trim();
  const options=Object.assign({font:(window.matchMedia('(max-width:600px)').matches?17:18),leading:2.25,width:820,theme:'night'},get(OPT)||{});
  function loadCSS(){
    if($('link[data-zs-reader]'))return;
    const l=document.createElement('link');l.rel='stylesheet';l.href=ROOT+'assets/css/reader-experience.css?v=5';l.dataset.zsReader='1';document.head.appendChild(l);
  }
  function apply(){
    options.font=Math.min(24,Math.max(16,Number(options.font)||18));
    options.leading=Math.min(2.7,Math.max(1.7,Number(options.leading)||2.25));
    options.width=Math.min(1000,Math.max(660,Number(options.width)||820));
    if(!['night','paper','light'].includes(options.theme))options.theme='night';
    document.documentElement.style.setProperty('--zs-reader-font',options.font+'px');
    document.documentElement.style.setProperty('--zs-reader-leading',options.leading);
    document.documentElement.style.setProperty('--zs-reader-width',options.width+'px');
    document.body.dataset.zsReaderTheme=options.theme;
    put(OPT,options);
  }
  function addSearchNav(){
    const nav=$('header nav');if(!nav||nav.classList.contains('zs-global-nav')||nav.querySelector('.zs-search-nav')||[...nav.querySelectorAll('a')].some(a=>a.getAttribute('href')?.endsWith('search.html')))return;
    const a=document.createElement('a');a.href=ROOT+'search.html';a.textContent='搜索';a.className='zs-search-nav';nav.appendChild(a);
  }
  function addContinue(){
    if(!document.body.classList.contains('home-page'))return;
    const last=get(LAST), box=$('#zs-home-resume');
    const valid=last&&typeof last.url==='string'&&last.url.startsWith(ROOT+'chapters/')&&/^\/zero-sequence-public\/chapters\/volume-\d{2}\/(?:chapter-\d{3}|prologue)\.html$/.test(last.url);
    const heroResume=$('#zs-hero-resume'),pathResume=$('#zs-path-resume-link'),pathDescription=$('#zs-path-resume-description');
    if(valid){
      if(heroResume){heroResume.href=last.url;heroResume.textContent='接着上次阅读 →';}
      if(pathResume){pathResume.href=last.url;pathResume.textContent='继续上次章节 →';}
      if(pathDescription)pathDescription.textContent='上次阅读：'+(last.title||'已保存的章节')+'。点击后可返回上次阅读位置。';
    }
    if(box){
      const title=$('#zs-resume-title'),detail=$('#zs-resume-description');
      const link=$('#zs-resume-link'),bar=$('#zs-resume-bar');
      if(valid){
        if(title)title.textContent=last.title||'继续上次的章节';
        const percent=Math.max(0,Math.min(100,Math.round(Number(last.percent)||0)));
        if(detail)detail.textContent='上次阅读 · 已阅读约 '+percent+'% · 进度仅保存在当前设备';
        if(link){link.href=last.url;link.textContent='继续阅读 →';}
        if(bar)bar.style.width=percent+'%';
      }
      return;
    }
    const hero=$('.hero');if(!valid||!hero)return;
    const div=document.createElement('section');div.className='zs-continue';div.setAttribute('aria-label','继续阅读');
    const info=document.createElement('div');
    const eyebrow=document.createElement('small');eyebrow.textContent='上次阅读 · 仅此设备';
    const title=document.createElement('h2');title.textContent=last.title||'继续上次的章节';
    const detail=document.createElement('p');detail.textContent='已阅读约 '+Math.round(last.percent||0)+'% · 点击后可选择接着读';
    info.append(eyebrow,title,detail);
    const link=document.createElement('a');link.href=last.url;link.textContent='继续阅读 →';
    div.append(info,link);hero.insertAdjacentElement('afterend',div);
  }
  // Recovery path for previously cached chapter HTML: the master MP3s are already
  // published. Never replace an existing audio player or change the novel text.
  function ensurePublishedAudiobook(){
    const m=path.match(/\/chapters\/volume-(0[234567])\/chapter-(\d{3})\.html$/);
    if(!m||$('#zs-audiobook-player'))return;
    const v=Number(m[1]),n=Number(m[2]);if(n<1||n>10)return;
    const article=$('.article'),h=$('main.page h1');if(!article||!h)return;
    const title=clean(h.textContent).replace(/^第[一二三四五六七八九十]+章\s*/,'');
    const url=ROOT+'assets/audio/audiobook/part-01/volume-'+m[1]+'/chapter-'+m[2]+'.mp3?v=zi-yue-v4';
    if(!$('link[href*="chapter-audiobook.css"]')){
      const css=document.createElement('link');css.rel='stylesheet';css.href=ROOT+'assets/css/chapter-audiobook.css?v=2';document.head.append(css);
    }
    const section=document.createElement('section');section.id='zs-audiobook-player';section.className='zs-audiobook-panel';
    section.setAttribute('aria-labelledby','zs-audiobook-title');
    const kicker=document.createElement('p');kicker.className='zs-audiobook-kicker';kicker.textContent='AUDIO EDITION · 第一篇《轮回启幕》';
    const header=document.createElement('h2');header.id='zs-audiobook-title';header.textContent='🎧 第'+n+'章 · 子悦中文女声有声版';
    const description=document.createElement('p');description.className='zs-audiobook-description';description.textContent='《'+title+'》· Zi Yue 子悦 · Eleven v4 · 情绪旁白 · 完整章回';
    const audio=document.createElement('audio');audio.id='zs-chapter-narration';audio.controls=true;audio.preload='none';audio.setAttribute('aria-label','第'+n+'章'+title+'子悦中文女声朗读');
    const source=document.createElement('source');source.src=url;source.type='audio/mpeg';audio.append(source);
    const actions=document.createElement('div');actions.className='zs-audiobook-actions';
    const note=document.createElement('span');note.textContent='点击后开始朗读 · 不自动播放';
    const download=document.createElement('a');download.href=url;download.download='第零序列_第'+({2:'二',3:'三',4:'四',5:'五',6:'六',7:'七'}[v])+'卷_第'+n+'章_子悦_ZiYue_V4.mp3';download.textContent='下载完整 MP3';
    actions.append(note,download);
    const status=document.createElement('p');status.id='zs-chapter-narration-status';status.className='zs-audiobook-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.textContent='如正在播放背景音乐，开始朗读时会自动暂停背景音乐。';
    section.append(kicker,header,description,audio,actions,status);
    article.insertAdjacentElement('beforebegin',section);
    // The old chapter HTML has no chapter-audiobook.js; wire the same behavior
    // locally so the recovered control still pauses BGM on play.
    const say=s=>{status.textContent=s};
    audio.addEventListener('play',()=>{
      const bgm=$('#zs-audio.is-playing .zs-play');if(bgm)bgm.click();
      say('正在播放第'+n+'章中文女声。背景音乐已自动暂停（如之前正在播放）。');
    });
    audio.addEventListener('pause',()=>{if(!audio.ended)say('朗读已暂停，可从当前进度继续。')});
    audio.addEventListener('ended',()=>say('第'+n+'章朗读已完成。'));
    audio.addEventListener('error',()=>say('音频加载失败，请刷新页面或点击下载完整 MP3。'));
  }
  function setupChapter(){
    ensurePublishedAudiobook();
    const article=$('.article');if(!article)return;
    document.body.classList.add('zs-chapter-reading');
    const paras=[...article.querySelectorAll(':scope > p')];
    const bar=document.createElement('div');bar.className='zs-progress';bar.setAttribute('aria-hidden','true');document.body.appendChild(bar);
    const last=get(LAST);
    let oldProgress=last&&last.url===path?last:null;
    const entryTitle=clean($('h1')?.textContent||document.title);
    function calc(){
      const rect=article.getBoundingClientRect(),start=window.scrollY+rect.top,end=start+article.offsetHeight-window.innerHeight*.75;
      const pct=Math.max(0,Math.min(100,(window.scrollY-start)/Math.max(1,end-start)*100));
      let index=0;for(let i=0;i<paras.length;i++){if(paras[i].getBoundingClientRect().top<=window.innerHeight*.45)index=i;}
      return {percent:Math.round(pct),index};
    }
    let userMoved=false,raf=0;
    function save(){raf=0;const d=calc();bar.style.width=d.percent+'%';
      if(!userMoved)return;
      put(LAST,{url:path,title:entryTitle,index:d.index,percent:d.percent,date:Date.now()});
    }
    window.addEventListener('scroll',()=>{userMoved=true;if(!raf)raf=requestAnimationFrame(save)},{passive:true});
    window.addEventListener('pagehide',()=>{if(userMoved)save();});
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&userMoved)save();});
    if(oldProgress&&oldProgress.index>0&&oldProgress.percent<99){
      const area=document.createElement('div');area.className='zs-resume';
      const hint=document.createElement('span');hint.textContent='上次阅读到约 '+oldProgress.percent+'%，是否接着阅读？';
      const btn=document.createElement('button');btn.type='button';btn.textContent='回到上次位置';
      btn.onclick=()=>{const target=paras[Math.min(paras.length-1,oldProgress.index)];if(target){userMoved=true;target.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});}area.remove();};
      area.append(hint,btn);article.parentNode.insertBefore(area,article);
    }else if(!last||last.url!==path){put(LAST,{url:path,title:entryTitle,index:0,percent:0,date:Date.now()});}
    function settingPanel(){
      const open=document.createElement('button');open.className='zs-reader-fab';open.type='button';open.textContent='Aa 阅读设置';open.setAttribute('aria-expanded','false');open.setAttribute('aria-haspopup','dialog');
      const panel=document.createElement('aside');panel.className='zs-reader-panel';panel.hidden=true;panel.setAttribute('aria-label','阅读设置');
      const h=document.createElement('h2');h.textContent='阅读设置';panel.appendChild(h);
      const label1=document.createElement('label');label1.textContent='正文字号';panel.append(label1);
      const row1=document.createElement('div');row1.className='zs-controls';
      const shrink=document.createElement('button'),grow=document.createElement('button'),reset=document.createElement('button');
      shrink.type=grow.type=reset.type='button';shrink.textContent='A−';grow.textContent='A+';reset.textContent='恢复默认';
      shrink.onclick=()=>{options.font-=1;apply();size.textContent=options.font+'px';};
      grow.onclick=()=>{options.font+=1;apply();size.textContent=options.font+'px';};
      reset.onclick=()=>{Object.assign(options,{font:(window.matchMedia('(max-width:600px)').matches?17:18),leading:2.25,width:820,theme:'night'});apply();size.textContent=options.font+'px';theme.value=options.theme;leading.value=String(options.leading);width.value=String(options.width);};
      const size=document.createElement('span');size.style.alignSelf='center';size.textContent=options.font+'px';row1.append(shrink,grow,size,reset);panel.append(row1);
      const themeLabel=document.createElement('label');themeLabel.textContent='阅读背景';panel.append(themeLabel);
      const theme=document.createElement('select');theme.setAttribute('aria-label','阅读背景');
      [['night','深色'],['paper','米黄护眼'],['light','浅色']].forEach(([value,text])=>theme.add(new Option(text,value)));theme.value=options.theme;
      theme.onchange=()=>{options.theme=theme.value;apply();};panel.append(theme);
      const lineLabel=document.createElement('label');lineLabel.textContent='行距';panel.append(lineLabel);
      const leading=document.createElement('select');leading.setAttribute('aria-label','行距');
      [['1.8','紧凑'],['2.25','舒适'],['2.6','宽松']].forEach(([value,text])=>leading.add(new Option(text,value)));leading.value=String(options.leading);
      leading.onchange=()=>{options.leading=Number(leading.value);apply();};panel.append(leading);
      const widthLabel=document.createElement('label');widthLabel.textContent='阅读版心';panel.append(widthLabel);
      const width=document.createElement('select');width.setAttribute('aria-label','阅读版心');
      [['660','窄'],['820','标准'],['1000','宽']].forEach(([value,text])=>width.add(new Option(text,value)));width.value=String(options.width);
      width.onchange=()=>{options.width=Number(width.value);apply();};panel.append(width);
      const note=document.createElement('p');note.className='zs-help';note.textContent='字号、背景与阅读进度仅保存在当前设备浏览器。章节顶部可按全书编号快速跳转。';panel.append(note);
      panel.id='zs-reader-options';open.setAttribute('aria-controls',panel.id);open.setAttribute('aria-label','打开阅读设置');
      open.onclick=()=>{panel.hidden=!panel.hidden;open.setAttribute('aria-expanded',String(!panel.hidden));open.setAttribute('aria-label',panel.hidden?'打开阅读设置':'关闭阅读设置');document.body.classList.toggle('zs-reader-panel-open',!panel.hidden);if(!panel.hidden)document.dispatchEvent(new Event('zs:reader-panel-open'));};
      document.addEventListener('click',e=>{if(!panel.hidden&&!panel.contains(e.target)&&e.target!==open){panel.hidden=true;document.body.classList.remove('zs-reader-panel-open');open.setAttribute('aria-expanded','false');open.setAttribute('aria-label','打开阅读设置');}});
      document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){panel.hidden=true;document.body.classList.remove('zs-reader-panel-open');open.setAttribute('aria-expanded','false');open.setAttribute('aria-label','打开阅读设置');open.focus();}});
      document.body.append(open,panel);
    }
    settingPanel();
    const tools=document.createElement('nav');tools.className='zs-chapter-tools';
    tools.setAttribute('aria-label','章节快速导航');
    const match=path.match(/\/chapters\/volume-(\d{2})\/(chapter-(\d{3})|prologue)\.html$/);
    const vol=match?Number(match[1]):1;
    const num=match&&match[3]?Number(match[3]):0;
    const volLink=v=>ROOT+'volumes/volume-'+String(v).padStart(2,'0')+'.html';
    const chapLink=(v,n)=>ROOT+'chapters/volume-'+String(v).padStart(2,'0')+'/chapter-'+String(n).padStart(3,'0')+'.html';
    // 不依赖外部数据；所有已公开章节可直接按编号访问，档案解锁仍维持独立。
    const globalChapter=(vol-1)*10+num;
    const length=paras.reduce((sum,p)=>sum+(p.textContent||'').length,0);
    const estimate=Math.max(1,Math.ceil(length/460));
    const stats=document.createElement('p');stats.className='zs-chapter-stats';
    stats.textContent=(num===0?'序章':'全书第'+globalChapter+'章')+' · 约'+estimate+'分钟阅读 · 已发布300章';
    const chapterHeading=$('main.page h1');if(chapterHeading)chapterHeading.insertAdjacentElement('afterend',stats);

    const navLink=(href,label,cls)=>{const a=document.createElement('a');a.href=href;a.textContent=label;if(cls)a.className=cls;return a;};
    if(num>1)tools.append(navLink(chapLink(vol,num-1),'← 上一章'));
    else if(num===1&&vol===1)tools.append(navLink(ROOT+'chapters/volume-01/prologue.html','← 序章'));
    else if(num===1&&vol>1)tools.append(navLink(chapLink(vol-1,10),'← 上一章'));
    const part=Math.floor((vol-1)/10)+1;
    tools.append(navLink(volLink(vol),'本卷目录'),navLink(ROOT+'parts/part-0'+part+'.html','第'+part+'篇目录'));
    if(num===0)tools.append(navLink(chapLink(vol,1),'下一章 →'));
    else if(num<10)tools.append(navLink(chapLink(vol,num+1),'下一章 →'));
    else if(vol<30)tools.append(navLink(chapLink(vol+1,1),'下一章 →'));
    // 非固定位置的快速跳章，避免和手机BGM/阅读设置悬浮控件重叠。
    const jump=document.createElement('details');jump.className='zs-chapter-jump';
    const jumpSummary=document.createElement('summary');jumpSummary.textContent='按章号跳转';jump.append(jumpSummary);
    const jumpForm=document.createElement('form');jumpForm.className='zs-chapter-jump-form';
    const jumpLabel=document.createElement('label');jumpLabel.textContent='全书章节编号（1—300）';
    const jumpInput=document.createElement('input');jumpInput.type='number';jumpInput.min='1';jumpInput.max='300';jumpInput.step='1';
    jumpInput.inputMode='numeric';jumpInput.placeholder='例如：128';
    if(num>0)jumpInput.value=String(globalChapter);
    jumpInput.setAttribute('aria-label','输入全书章节编号，1到300');
    const jumpButton=document.createElement('button');jumpButton.type='submit';jumpButton.textContent='前往这一章';
    const jumpStatus=document.createElement('span');jumpStatus.className='zs-chapter-jump-status';
    jumpStatus.setAttribute('role','status');jumpStatus.setAttribute('aria-live','polite');
    jumpForm.append(jumpLabel,jumpInput,jumpButton,jumpStatus);
    jumpForm.addEventListener('submit',event=>{
      event.preventDefault();
      const raw=jumpInput.value.trim(),n=Number(raw);
      if(!/^\d{1,3}$/.test(raw)||!Number.isInteger(n)||n<1||n>300){
        jumpStatus.textContent='请输入1—300之间的章节编号。';jumpInput.focus();return;
      }
      jumpStatus.textContent='';
      location.assign(chapLink(Math.ceil(n/10),((n-1)%10)+1));
    });
    jump.append(jumpForm);tools.append(jump);
    // Make the *bottom* chapter navigation consistent across the prologue and all 300 chapters.
    // The original HTML text stays untouched; the existing progress/localStorage keys remain stable.
    const footerPager=article.querySelector(':scope > .pager');
    if(footerPager){
      const bottom=[];
      if(num>1)bottom.push(navLink(chapLink(vol,num-1),'← 上一章'));
      else if(num===1&&vol===1)bottom.push(navLink(ROOT+'chapters/volume-01/prologue.html','← 上一章'));
      else if(num===1&&vol>1)bottom.push(navLink(chapLink(vol-1,10),'← 上一章'));
      bottom.push(navLink(volLink(vol),'返回本卷目录'));
      if(num===0)bottom.push(navLink(chapLink(vol,1),'下一章 →'));
      else if(num<10)bottom.push(navLink(chapLink(vol,num+1),'下一章 →'));
      else if(vol<30)bottom.push(navLink(chapLink(vol+1,1),vol===10?'下一篇 · 第101章 →':vol===20?'第三篇 · 第201章 →':'下一卷 · 下一章 →'));
      footerPager.replaceChildren(...bottom);
      footerPager.setAttribute('aria-label','章节底部导航');
    }
    const crumb=$('.crumb');if(crumb)crumb.insertAdjacentElement('afterend',tools);
    requestAnimationFrame(save);
  }
  function init(){loadCSS();apply();addSearchNav();addContinue();if(chapter)setupChapter();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
