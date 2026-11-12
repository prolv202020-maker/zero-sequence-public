/* 第四篇剧情插画 V1：仅在原文唯一锚点后插入；不修改正文与阅读记录。 */
(()=>{'use strict';
const ROOT='/zero-sequence-public/';
const illustrations=Object.freeze([
 {id:'snowline',chapter:'31/008',need:8,file:'part04-snowline-watercolor.webp',title:'雪线会战 · 风雪护路',caption:'水彩风格化概念CG · 对应第308章雪线会战',needle:'黑槲的第一波冲锋比任何人预想得都快'},
 {id:'hundred-flags',chapter:'35/009',need:49,file:'part04-hundred-flags-ink.webp',title:'百旗城战 · 燧河决战',caption:'暗黑水墨风格化概念CG · 对应第349章百旗决战',needle:'钟声响起，燧河城东门首先爆发战斗'},
 {id:'border-siege',chapter:'38/009',need:79,file:'part04-border-siege.webp',title:'边境夺旗 · 营地反击',caption:'宏观战场风格化概念CG · 对应第379章双线认证',needle:'战鼓响起，斩契团先从正面冲来'},
 {id:'arc-poster',chapter:'40/010',need:100,file:'part04-fourth-arc-poster.webp',title:'烽火临界 · 第四篇主题海报',caption:'第四篇概念海报 · 艺术化群像，不作为人物正式定妆或新增剧情',needle:null}
]);
function progress(){try{const d=JSON.parse(localStorage.getItem('zs:part-progress:v1')||'{}');return Math.max(0,Math.min(100,Number(d.p04?.max)||0))}catch{return 0}}
let dlg,photo,previous;
function view(event){if(typeof HTMLDialogElement==='undefined'||!HTMLDialogElement.prototype.showModal)return;
 event.preventDefault();if(!dlg){dlg=document.createElement('dialog');dlg.className='zs-p4-lightbox';dlg.setAttribute('aria-label','第四篇高清插画');
 const close=document.createElement('button');close.type='button';close.textContent='关闭 ×';close.addEventListener('click',()=>dlg.close());
 photo=document.createElement('img');photo.alt='第四篇剧情概念插画';dlg.append(close,photo);document.body.append(dlg);
 dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close()});
 dlg.addEventListener('close',()=>{photo.removeAttribute('src');previous?.focus?.();previous=null})}
 previous=event.currentTarget;const img=previous.querySelector('img');photo.src=previous.href;photo.alt=img?.alt||'第四篇剧情概念插画';dlg.showModal()}
function picture(item){const a=document.createElement('a');a.href=ROOT+'assets/images/illustrations/'+item.file;a.className='zs-p4-scene-link';a.target='_blank';a.rel='noopener';a.setAttribute('aria-label','放大查看：'+item.title);
 const im=document.createElement('img');im.src=a.href;im.alt=item.title+'，风格化剧情概念插画';im.width=1360;im.height=765;im.loading='lazy';im.decoding='async';a.append(im);a.addEventListener('click',view);return a}
const m=location.pathname.match(/\/chapters\/volume-(\d{2})\/chapter-(\d{3})\.html$/);
if(m){const key=m[1]+'/'+m[2];const item=illustrations.find(x=>x.chapter===key&&x.needle);
 if(item){const article=document.querySelector('.article');const ps=[...article?.querySelectorAll(':scope > p')||[]];const matches=ps.filter(p=>p.textContent.includes(item.needle));
 if(matches.length===1&&!document.getElementById('zs-p4-art-'+item.id)){const fig=document.createElement('figure');fig.id='zs-p4-art-'+item.id;fig.className='zs-p4-scene';fig.append(picture(item));
 const caption=document.createElement('figcaption');caption.className='zs-p4-caption';const text=document.createElement('span');text.textContent=item.caption;
 const back=document.createElement('a');back.href=ROOT+'parts/illustrations-04.html#art-'+item.id;back.textContent='前往第四篇插画画廊';
 caption.append(text,back);fig.append(caption);matches[0].insertAdjacentElement('afterend',fig)}}}
const host=document.getElementById('zs-p4-gallery');if(!host)return;
function draw(){host.replaceChildren();const max=progress();for(const item of illustrations){const unlocked=max>=item.need;
 const card=document.createElement('article');card.className='zs-p4-gallery-card';card.id='art-'+item.id;
 const media=document.createElement('div');media.className='zs-p4-gallery-media';if(unlocked)media.append(picture(item));else{const lock=document.createElement('span');lock.className='zs-p4-gallery-locked';lock.textContent='◇ 未解锁插画';media.append(lock)}
 const body=document.createElement('div');body.className='zs-p4-gallery-info';const name=document.createElement('strong');name.textContent=unlocked?item.title:'尚未解锁的剧情画面';const summary=document.createElement('p');summary.textContent=unlocked?item.caption:'阅读至第四篇第'+item.need+'章并标记已读后解锁';
 body.append(name,summary);
 if(unlocked){const [v,c]=item.chapter.split('/');const jump=document.createElement('a');jump.href=ROOT+'chapters/volume-'+v+'/chapter-'+c+'.html'+(item.needle?'#zs-p4-art-'+item.id:'');jump.textContent=item.needle?'前往对应正文插画 →':'前往第四篇结尾 →';body.append(jump)}
 card.append(media,body);host.append(card)}
 const count=document.getElementById('zs-p4-gallery-status');if(count)count.textContent='第四篇进度 '+max+'/100 章 · 已解锁 '+illustrations.filter(x=>max>=x.need).length+'/4 张';
 const hash=location.hash.slice(1);if(hash.startsWith('art-'))document.getElementById(hash)?.scrollIntoView({block:'start'})}
draw();window.addEventListener('pageshow',draw);document.addEventListener('zs:part-progress-changed',draw);window.addEventListener('storage',e=>{if(e.key==='zs:part-progress:v1')draw()});
})();
