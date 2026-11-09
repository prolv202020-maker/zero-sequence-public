/* 第零序列：武器、装备、道具、材料页直接展示已制作CG；只读分篇进度，不改变正文或已读状态。 */
(()=>{'use strict';
const main=document.querySelector('[data-public-archive]');
const page=main?.dataset.publicArchive;
const allowed={equipment:['武器','装备'],items:['道具'],materials:['材料']};
if(!Object.prototype.hasOwnProperty.call(allowed,page))return;
const host=document.getElementById('pa-artworks-grid'),status=document.getElementById('pa-artworks-status');
if(!host||!status)return;
const ROOT='/zero-sequence-public/';
const gearType=document.getElementById('pa-equipment-kind'),gearPart=document.getElementById('pa-equipment-part'),gearSearch=document.getElementById('pa-equipment-search'),gearSort=document.getElementById('pa-equipment-sort');

const records=(Array.isArray(window.ZSVisualCodex)?window.ZSVisualCodex:[]).filter(x=>allowed[page].includes(x.kind)&&x.file&&Number.isInteger(x.p)&&Number.isInteger(x.n));
const el=(tag,cls,value)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(value!==undefined)node.textContent=value;return node;};
const progress=p=>{try{
 if(window.ZSUnlock?.get)return Math.max(0,Math.min(100,Number(window.ZSUnlock.get(p).max)||0));
 const data=JSON.parse(localStorage.getItem('zs:part-progress:v1')||'{}');
 return Math.max(0,Math.min(100,Number(data['p'+String(p).padStart(2,'0')]?.max)||0));
}catch{return 0}};
const chapter=r=>ROOT+r.source;
function makeLink(url,label){const a=el('a','pa-artwork-link',label);a.href=url;return a;}
function show(r){
 const card=el('article','pa-artwork-card'),unlocked=progress(r.p)>=r.n;
 const meta=el('small','pa-artwork-meta','第'+r.p+'篇 · '+r.kind+' · 第'+r.n+'章');
 if(unlocked){
  const full=el('a','pa-artwork-image');full.href=ROOT+'assets/images/codex/'+r.file;
  full.target='_blank';full.rel='noopener';full.setAttribute('aria-label','查看'+r.name+'高清CG');
  const img=el('img');img.alt=r.name+'高清CG';img.loading='lazy';img.decoding='async';img.width=960;img.height=1200;
  img.addEventListener('error',()=>{full.replaceWith(el('div','pa-artwork-unavailable','图片暂时无法加载，请打开视觉图鉴查看。'));});
  img.src=full.href;full.append(img);card.append(full);
  card.id='archive-cg-'+r.id;
  const body=el('div','pa-artwork-body');
  body.append(meta,el('h3','',r.name),el('p','',r.summary));
  const links=el('div','pa-artwork-links');links.append(makeLink(chapter(r),'阅读对应章节'));
  links.append(makeLink(ROOT+'archive/visual-codex.html?art='+encodeURIComponent(r.id),'在总图鉴中定位'));
  const detail=makeLink(ROOT+r.detail,'查看文字图鉴');links.append(detail);
  body.append(links);card.append(body);
 }else{
  card.className+=' is-locked';
  const blank=el('div','pa-artwork-locked-image','◇');blank.setAttribute('aria-hidden','true');
  const body=el('div','pa-artwork-body');
  body.append(meta,el('h3','','尚未解锁的视觉档案'),el('p','','读完对应篇章第'+r.n+'章，标记本章已读后即可查看高清插画。'));
  const links=el('div','pa-artwork-links');links.append(makeLink(chapter(r),'前往对应章节'));
  body.append(links);card.append(blank,body);
 }
 return card;
}
function render(){
 const shown=records.filter(r=>progress(r.p)>=r.n).length;
 const kind=gearType?.value||'all',part=Number(gearPart?.value||0);
 const keyword=(gearSearch?.value||'').trim().toLocaleLowerCase('zh-Hans');
 const eligible=records.filter(r=>
  (kind==='all'||r.kind===kind)&&(!part||r.p===part)&&
  (!keyword||(progress(r.p)>=r.n&&[r.name,r.summary,r.kind].join(' ').toLocaleLowerCase('zh-Hans').includes(keyword))));
 const filtered=[...eligible];
 if(gearSort?.value==='story')filtered.sort((a,b)=>a.p-b.p||a.n-b.n||a.name.localeCompare(b.name,'zh-CN'));
 status.textContent='已解锁 '+shown+'/'+records.length+' 张 · 当前展示 '+filtered.length+' 张 · 三篇进度独立计算';
 host.replaceChildren();
 if(!filtered.length){host.append(el('p','pa-empty',keyword?'没有符合搜索的已解锁装备CG。':'当前分类暂时没有作品。'));return;}
 for(const r of filtered)host.append(show(r));
}
for(const input of [gearType,gearPart,gearSearch,gearSort])input?.addEventListener(input===gearSearch?'input':'change',render);
document.addEventListener('zs:part-progress-changed',render);
window.addEventListener('pageshow',render);
window.addEventListener('storage',e=>{if(e.key==='zs:part-progress:v1')render();});
render();
})();
