/* 《第零序列》首页：39卷快速导航。不写入、覆盖或重置阅读进度。 */
(() => {
  'use strict';
  const root=document.getElementById('zs-quick-jump')||document.getElementById('quick-jump');
  if(!root)return;
  const grid=document.getElementById('zs-quick-volumes'),title=document.getElementById('zs-quick-arc-title');
  const label=document.getElementById('zs-quick-arc-progress');
  const tabs=[...root.querySelectorAll('[data-zs-arc]')];
  const meta=[null,['轮回启幕',1],['百城星火',11],['临界回声',21],['烽火临界',31]];
  const pad=(n,w)=>String(n).padStart(w,'0');
  const last=(()=>{
    try{const v=JSON.parse(localStorage.getItem('zs:reader:last:v1')||'null');
      const m=String(v?.url||'').match(/\/chapters\/volume-(\d{2})\//);
      return m?Number(m[1]):0;
    }catch{return 0;}
  })();
  let current=last>=1&&last<=39?Math.ceil(last/10):1;
  const getProgress=p=>{
    if(window.ZSUnlock?.get)return Math.max(0,Math.min(100,Number(window.ZSUnlock.get(p)?.max)||0));
    try{const v=JSON.parse(localStorage.getItem('zs:part-progress:v1')||'{}');
      return Math.max(0,Math.min(100,Number(v['p'+pad(p,2)]?.max)||0));}catch{return 0;}
  };
  const make=(tag,className,content)=>{
    const x=document.createElement(tag);if(className)x.className=className;
    if(content!==undefined)x.textContent=content;return x;
  };
  function draw(){
    const data=meta[current],progress=getProgress(current);
    title.textContent='第'+current+'篇 · '+data[0];
    label.textContent='本篇已读 '+progress+' / '+(current===4?90:100)+'章 · 已发布章节免费开放';
    tabs.forEach(btn=>btn.setAttribute('aria-pressed',String(Number(btn.dataset.zsArc)===current)));
    const fragment=document.createDocumentFragment();
    for(let i=0;i<(current===4?9:10);i++){
      const vol=data[1]+i,readStart=i*10,readEnd=readStart+10;
      const publishedEnd=readEnd;
      const state=progress>=publishedEnd?'complete':progress>readStart?'current':'unread';
      const a=make('a');a.href='volumes/volume-'+pad(vol,2)+'.html';a.dataset.state=state;
      a.setAttribute('aria-label','第'+vol+'卷，包含全书第'+((vol-1)*10+1)+'至'+(vol*10)+'章，进入本卷目录');
      a.append(make('span','zs-quick-volume-number','VOL '+pad(vol,2)+' · 第'+vol+'卷'));
      a.append(make('span','zs-quick-volume-info','全书 '+((vol-1)*10+1)+('—'+(vol*10)+'章')));
      a.append(make('span','zs-quick-volume-state',state==='complete'?'✓ 本卷已读':state==='current'?'继续阅读':'打开目录 →'));
      fragment.append(a);
    }
    grid.replaceChildren(fragment);
  }
  tabs.forEach(btn=>btn.addEventListener('click',()=>{current=Number(btn.dataset.zsArc);draw();}));
  document.addEventListener('zs:part-progress-changed',draw);
  const form=document.getElementById('zs-number-jump'),input=document.getElementById('zs-chapter-number');
  const message=document.getElementById('zs-jump-feedback');
  if(form&&input&&message)form.addEventListener('submit',event=>{
    event.preventDefault();
    const raw=input.value.trim(),num=Number(raw);
    if(!/^\d{1,3}$/.test(raw)||!Number.isInteger(num)||num<1||num>390){
      message.textContent='请输入1—390之间的完整章节编号。';input.focus();return;
    }
    message.textContent='';
    const volume=Math.ceil(num/10),chapter=((num-1)%10)+1;
    location.assign('chapters/volume-'+pad(volume,2)+'/chapter-'+pad(chapter,3)+'.html');
  });
  draw();
})();