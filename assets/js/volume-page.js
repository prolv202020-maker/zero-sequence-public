/* 第零序列 · 已公开卷目统一章节目录，允许最新卷连载与完结。阅读状态只读，保留全部原始链接和阅读进度。 */
(() => {
  'use strict';
  const m=location.pathname.match(/\/volumes\/volume-(\d{2})\.html$/);
  if(!m)return;
  const vol=Number(m[1]),part=Math.floor((vol-1)/10)+1;
  if(vol<1||vol>34)return;
  const partName=part===1?'轮回启幕':part===2?'百城星火':part===3?'临界回声':'烽火临界';
  const ROOT='/zero-sequence-public/';
  const main=document.querySelector('main.page'), chapters=main?.querySelector('.list');
  if(!main||!chapters||document.querySelector('.zs-volume-hero'))return;
  document.body.classList.add('zs-volume-page');
  document.body.dataset.zsPart=String(part);
  const title=main.querySelector('h1'),intro=main.querySelector('p.lead'),eyebrow=main.querySelector('p.eyebrow');
  const existingFigure=main.querySelector('figure');
  const existingComplete=main.querySelector('.complete');
  const publishedCount=chapters.querySelectorAll('a[href*="chapter-"]').length;
  // All chapters are public; only the additional archive data is progress gated.
  const heading=main.querySelector('.crumb');
  if(!title||!intro||!eyebrow)return;
  const el=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;};
  const hero=el('section','zs-volume-hero');
  let figure=existingFigure;
  if(!figure){
    figure=el('figure');
    const cover=el('img','zs-volume-official-cover');
    cover.src=ROOT+'assets/images/covers/volume-'+String(vol).padStart(2,'0')+'.webp';
    cover.alt='第'+vol+'卷独立正式封面';
    cover.width=750;cover.height=1080;
    figure.append(cover);
    figure.append(el('figcaption','', '第'+part+'篇《'+partName+'》 · 独立卷封面'));
  } else {
    // 早期卷封面存在内联尺寸与边距，统一以同一份CSS为准。
    figure.removeAttribute('style');
    const image=figure.querySelector('img');
    if(image){image.removeAttribute('style');image.loading='eager';}
    figure.querySelector('figcaption')?.removeAttribute('style');
  }
  const info=el('div','zs-volume-info');
  info.append(eyebrow,title);
  const tags=el('div','zs-volume-tags');
  tags.append(el('span','', '第'+part+'篇 · '+partName),el('span','', '第'+vol+'卷'),el('span','', '本卷'+publishedCount+'章 · '+(publishedCount===10?'已发布':'连载中')));
  tags.append(el('span','zs-volume-audio-status',vol<=13?'🎧 已配音 · 完整10章':'仅正文 · 尚未配音'));
  info.append(tags,intro);
  if(existingComplete)existingComplete.remove();
  const actions=el('div','zs-volume-actions');
  const links=[...chapters.querySelectorAll('a[href*="/chapters/"]')];
  // 第一篇与后续各篇使用同一结构，原始页面可保留不同的章号写法。
  const first=links.find(a=>/chapter-001\.html$/.test(a.getAttribute('href')||''))||links[0];
  const begin=links.find(a=>/prologue\.html$/.test(a.getAttribute('href')||''))||first;
  const startHref=begin?.getAttribute('href')||'';
  const start=el('a','zs-start-reading','开始本卷阅读');
  start.href=startHref;
  const resume=el('a','zs-resume-volume','继续阅读');
  resume.href=first?.getAttribute('href')||startHref;
  const back=el('a','zs-return-part','返回本篇目录');
  back.href=ROOT+'parts/part-0'+part+'.html';
  actions.append(start,resume,back);
  if(vol<=13){const listen=el('a','zs-listen-volume','🎧 收听本卷');listen.href=ROOT+'audiobooks.html?volume='+vol+'&chapter='+(vol===1?0:1);actions.append(listen);}
  else {const note=el('span','zs-volume-not-voiced','本卷暂未配音 · 可免费阅读');actions.append(note);}
  info.append(actions);
  const progress=el('div','zs-volume-progress');
  const progressLabel=el('label','','本卷阅读进度 0 / '+publishedCount+' 章');
  const meter=el('div','zs-volume-meter');
  meter.setAttribute('role','progressbar');meter.setAttribute('aria-label','本卷已读章节');meter.setAttribute('aria-valuemin','0');meter.setAttribute('aria-valuemax',String(publishedCount));
  const meterFill=el('i');
  meter.append(meterFill);progress.append(progressLabel,meter);info.append(progress);
  hero.append(figure,info);
  if(heading)heading.insertAdjacentElement('afterend',hero);
  else main.insertBefore(hero,chapters);
  const chapterHeading=el('div','zs-volume-chapter-head');
  const chapTitle=el('h2','','本卷章节目录');
  const chapCount=el('span','',String(links.filter(a=>/chapter-\d{3}\.html$/.test(a.href)).length)+'章 · 章节均可直接阅读');
  chapterHeading.append(chapTitle,chapCount);
  chapters.parentNode.insertBefore(chapterHeading,chapters);
  chapters.classList.add('zs-volume-chapters');
  const globalFirst=(vol-1)*10+1, localStart=((vol-1)%10)*10;
  for(const [i,a] of links.entries()){
    const href=a.getAttribute('href')||'';
    const n=Number(href.match(/chapter-(\d{3})\.html$/)?.[1]||0);
    const prologue=/prologue\.html$/.test(href);
    const mainTitle=a.querySelector('span')||a;
    a.classList.add('row','zs-chapter-row');
    if(!mainTitle.classList.contains('zs-chapter-name')){
      let raw=mainTitle.textContent.trim();
      raw=raw.replace(/^【正式正文】\s*/,'')
        .replace(/\s*·\s*全书第\s*\d+\s*章\s*$/,'')
        .replace(/\s*·\s*正式正文\s*$/,'').trim();
      if(!prologue&&n>=1&&n<=10){
        const han=['','一','二','三','四','五','六','七','八','九','十'][n];
        raw=raw.replace(/^第\s*(?:\d{1,2}|[一二三四五六七八九十]+)\s*章[\s　]*/,'第'+han+'章　');
      }
      mainTitle.textContent=raw;
      mainTitle.classList.add('zs-chapter-name');
      const serial=el('span','zs-chapter-index',prologue?'PROLOGUE · 序章':'CHAPTER '+String(globalFirst+n-1).padStart(3,'0'));
      mainTitle.insertBefore(serial,mainTitle.firstChild);
    }
    const oldState=a.querySelector(':scope > span:not(.zs-chapter-name)');
    if(oldState)oldState.remove();
    let status=a.querySelector('.zs-chapter-state');
    if(!status){status=el('span','zs-chapter-state','未读');a.append(status);}
    a.dataset.chapterIndex=String(n);
    if(prologue)a.dataset.prologue='1';
  }
  // The existing volume URLs stay unchanged; normalize the navigation order.
  const pager=main.querySelector('.pager');
  if(pager){
    pager.classList.add('zs-volume-bottom');
    const nav=[];
    if(vol>1){
      const previous=el('a','','← 上一卷');
      previous.href=ROOT+'volumes/volume-'+String(vol-1).padStart(2,'0')+'.html';
      nav.push(previous);
    }
    const directory=el('a','','返回第'+part+'篇目录');
    directory.href=ROOT+'parts/part-0'+part+'.html';nav.push(directory);
    if(vol<34){
      const next=el('a','',vol===10?'进入第二篇 →':vol===20?'进入第三篇 →':vol===30?'进入第四篇 →':'下一卷 →');
      next.href=ROOT+'volumes/volume-'+String(vol+1).padStart(2,'0')+'.html';
      nav.push(next);
    }
    pager.replaceChildren(...nav);
    pager.setAttribute('aria-label','卷目导航');
  }
  const hint=el('p','zs-volume-hint','章节均可直接阅读；已读状态仅参考当前浏览器进度。人物与世界档案仍遵守独立的防剧透解锁规则。');
  chapters.insertAdjacentElement('afterend',hint);
  function loadProgress(){
    if(window.ZSUnlock?.get)return window.ZSUnlock.get(part);
    try{
      const v=JSON.parse(localStorage.getItem('zs:part-progress:v1')||'{}');
      return v['p'+String(part).padStart(2,'0')]||{};
    }catch{return {};}
  }
  function loadLast(){
    try{return JSON.parse(localStorage.getItem('zs:reader:last:v1')||'null');}
    catch{return null;}
  }
  function update(){
    const data=loadProgress();
    const max=Math.max(0,Math.min(100,Number(data.max)||0));
    const read=Math.min(publishedCount,Math.max(0,max-localStart));
    const prologueDone=!!data.prologue;
    const last=loadLast();
    const currentHref=last?.url;
    let currentLink=null,nextUnread=null;
    for(const a of links){
      const number=Number(a.dataset.chapterIndex||0);
      const isPrologue=a.dataset.prologue==='1';
      const done=isPrologue?prologueDone:(number>0&&max>=localStart+number);
      const current=typeof currentHref==='string'&&currentHref===new URL(a.href).pathname;
      a.classList.toggle('zs-chapter-read',done);
      a.classList.toggle('zs-chapter-current',!!current);
      const state=a.querySelector('.zs-chapter-state');
      if(state)state.textContent=done?'✓ 已读':current?'继续阅读':'未读';
      const chapterTitle=a.querySelector('.zs-chapter-name')?.textContent?.trim()||'';
      a.setAttribute('aria-label',(isPrologue?'序章':'全书第'+(globalFirst+number-1)+'章')+' '+chapterTitle+'，'+(done?'已读':current?'继续阅读':'未读')+'，点击进入阅读');
      if(current)currentLink=a;
      if(!done&&!nextUnread)nextUnread=a;
    }
    let target=currentLink||nextUnread||links.at(-1)||begin;
    if(target){resume.href=target.getAttribute('href');resume.textContent=currentLink?'继续上次阅读':'阅读下一章 →';}
    progressLabel.textContent='本卷已读 '+read+' / '+publishedCount+' 章'+(vol===1&&prologueDone?' · 序章已读':'');
    meterFill.style.width=(publishedCount?read/publishedCount*100:0)+'%';
    meter.setAttribute('aria-valuenow',String(read));
    if(read===publishedCount){resume.href=startHref;resume.textContent='从本卷开头重温 →';}
    if(currentLink&&last&&Number(last.percent)>0&&Number(last.percent)<100){
      resume.title='上次读到约 '+Math.round(Number(last.percent))+'%，进入章节后可继续阅读';
    }else resume.removeAttribute('title');
  }
  update();
  document.addEventListener('zs:part-progress-changed',update);
  window.addEventListener('pageshow',update);
})();