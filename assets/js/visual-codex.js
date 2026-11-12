/* 第零序列 CG 图鉴 V2：按篇章已读门槛展示与检索；不提前加载未解锁作品。 */
(()=>{'use strict';
const ROOT='/zero-sequence-public/',records=Array.isArray(window.ZSVisualCodex)?window.ZSVisualCodex:[];
const host=document.getElementById('zs-visual-codex-grid'),status=document.getElementById('zs-visual-codex-status');
if(!host||!status)return;
const kindSelect=document.getElementById('zs-visual-kind'),partSelect=document.getElementById('zs-visual-part'),search=document.getElementById('zs-visual-search');
const onlyUnlocked=document.getElementById('zs-visual-only-unlocked');
const query=new URLSearchParams(location.search),targetId=query.get('art'),source=query.get('source');
const types=new Set(['人物','魔物','武器','装备','道具','材料']);
const el=(tag,cls,value)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(value!==undefined)n.textContent=value;return n;};
const progress=p=>{try{
 if(window.ZSUnlock?.get)return Math.max(0,Math.min(100,Number(window.ZSUnlock.get(p).max)||0));
 const data=JSON.parse(localStorage.getItem('zs:part-progress:v1')||'{}');
 return Math.max(0,Math.min(100,Number(data['p'+String(p).padStart(2,'0')]?.max)||0));
}catch{return 0;}};
const available=record=>progress(record.p)>=record.n;
function makeImage(record){
 const wrapper=el('a','zs-visual-art');wrapper.href=ROOT+'assets/images/codex/'+record.file;
 wrapper.target='_blank';wrapper.rel='noopener';wrapper.setAttribute('aria-label','放大查看'+record.name+'视觉档案');
 const picture=el('img');picture.loading='lazy';picture.decoding='async';picture.width=960;picture.height=1200;picture.alt=record.name+'视觉图鉴插画';
 picture.addEventListener("error",()=>{wrapper.replaceWith(el('div','zs-visual-fallback','插画载入失败，可先查看原文章节。'));});
 picture.src=wrapper.href;wrapper.append(picture);return wrapper;
}
function render(){
 const p={1:progress(1),2:progress(2),3:progress(3),4:progress(4)},kind=kindSelect?.value||'all',part=Number(partSelect?.value||0);
 const term=(search?.value||'').trim().toLocaleLowerCase('zh-Hans');
 const unlocked=records.filter(r=>p[r.p]>=r.n);
 const scoped=records.filter(r=>(!part||r.p===part)&&(kind==='all'||r.kind===kind)&&(!source||r.source===source)&&(!onlyUnlocked?.checked||available(r)));
 host.replaceChildren();
 let count=0;
 for(const record of scoped){
  const isOpen=available(record);
  if(term&&(!isOpen||![record.name,record.kind,record.summary].join(' ').toLocaleLowerCase('zh-Hans').includes(term)))continue;
  const card=el('article','zs-visual-card'+(isOpen?'':' is-locked'));
  if(isOpen){
   card.id='cg-'+record.id;
   if(record.id===targetId)card.className+=' zs-visual-highlight';
   card.append(makeImage(record));
   // Extra images are alternate views of the same published item, never separate new items.
   // They are not requested or named unless this item's own part and chapter unlock have passed.
   if(Array.isArray(record.views)&&record.views.length){
    const variants=el('div','zs-visual-variants');
    variants.append(el('strong','zs-visual-variants-title','同一物品的补充CG视角'));
    for(const v of record.views){
     const tile=el('div','zs-visual-variant'),a=el('a','zs-visual-variant-art');
     a.href=ROOT+'assets/images/codex/'+v.file;a.target='_blank';a.rel='noopener';a.setAttribute('aria-label','查看'+v.title);
     const image=el('img');image.loading='lazy';image.decoding='async';image.width=960;image.height=1200;image.alt=v.title;
     image.addEventListener('error',()=>{a.replaceWith(el('p','zs-visual-fallback','补充CG暂时无法载入。'));});
     image.src=a.href;a.append(image);
     const body=el('div','zs-visual-variant-copy');body.append(el('b','',v.title),el('p','',v.note));
     tile.append(a,body);variants.append(tile);
    }
    card.append(variants);
   }
   const body=el('div','zs-visual-copy');
   body.append(el('small','','第'+record.p+'篇 · 已解锁 · '+record.kind+(record.cg?' · 高清CG':'')),el('h2','',record.name),el('p','',record.summary));
   const links=el('div','zs-visual-links');
   const chapter=el('a','','查看原文章节 →');chapter.href=ROOT+record.source;
   const detail=el('a','','查看对应档案 →');detail.href=ROOT+record.detail;
   links.append(chapter,detail);body.append(links);card.append(body);
  }else{
   card.append(el('div','zs-visual-locked-art','◇'));
   const body=el('div','zs-visual-copy');
   body.append(el('small','','第'+record.p+'篇 · 第'+record.n+'章'),el('h2','','尚未解锁的视觉档案'),el('p','','阅读并标记本章已读后，才会开放名称、CG及来源链接。'));
   card.append(body);
  }
  host.append(card);count++;
 }
 if(!count)host.append(el('p','zs-visual-empty','当前条件下没有可展示的视觉档案。关键词仅搜索已经解锁的作品。'));
 status.textContent='第一篇 '+p[1]+'/100 · 第二篇 '+p[2]+'/100 · 第三篇 '+p[3]+'/100 · 第四篇 '+p[4]+'/100 · 已解锁 '+unlocked.length+'/'+records.length+' · 当前显示 '+count+' 张';
 if(targetId){
  const target=records.find(r=>r.id===targetId);
  if(target&&available(target)){
   const node=document.getElementById('cg-'+targetId);
   if(node&&node.scrollIntoView)requestAnimationFrame(()=>node.scrollIntoView({block:'center',behavior:'smooth'}));
  }
 }
}
if(targetId){
 const target=records.find(r=>r.id===targetId);
 if(target&&available(target)){if(kindSelect)kindSelect.value=types.has(target.kind)?target.kind:'all';if(partSelect)partSelect.value=String(target.p);}
}
for(const field of [kindSelect,partSelect,search,onlyUnlocked])field?.addEventListener(field===search?'input':'change',render);
document.addEventListener('zs:part-progress-changed',render);
window.addEventListener('pageshow',render);
window.addEventListener('storage',e=>{if(e.key==='zs:part-progress:v1')render();});
render();
})();
