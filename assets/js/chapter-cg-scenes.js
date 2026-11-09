/* 第零序列 · CG 场景段落整合 V3。精确锚定正文后追加小型视觉卡，不修改正文及阅读记录。 */
(()=>{'use strict';
const ROOT='/zero-sequence-public/';
const ANCHORS=Object.freeze({
 "01/001": "顾长渊走到镜子前",
 "02/001": "苏紫璃听到这里",
 "05/004": "两辆满载赤纹矿的车翻在岔道",
 "09/008": "林烈的重剑终于将已经受损的甲板掀开一线",
 "12/004": "第一只岩牙兽扑到坡前",
 "13/004": "这把展示重剑的结构与广告中的卓越品质不符",
 "14/001": "白烛医疗院的早钟敲到第三下时",
 "16/001": "林烈下午赶到，披着厚斗篷",
 "18/005": "奥德把三份订单压在铁砧旁",
 "21/006": "戴玄岳的盾面也需要换掉一块变形护板",
 "22/001": "仍是手中这柄会磨损的普通长剑",
 "22/008": "古言澈带着银月改装过的双记录探查器到场",
 "25/002": "一道巨浪把灰鲸号推得横向滑行",
 "25/003": "一头体型远超同类的裂鳍兽从深处升起",
 "26/005": "对岸的矿盐袋已经破开",
 "27/005": "三枚控制片按照规定交给公共设施管理者",
 "27/007": "裁判界面浮出名字：熔背龙蜥",
 "28/010": "顾长渊接过那枚寒镜护腕",
 "29/001": "顾长渊握着寒纹修复过的长剑"
});
const match=location.pathname.match(/\/chapters\/volume-(\d{2})\/chapter-(\d{3})\.html$/);
if(!match)return;
const key=match[1]+'/'+match[2],needle=ANCHORS[key];
if(!needle)return;
const source='chapters/volume-'+match[1]+'/chapter-'+match[2]+'.html';
const records=(Array.isArray(window.ZSVisualCodex)?window.ZSVisualCodex:[]).filter(r=>r.source===source);
if(!records.length)return;
const article=document.querySelector('.article');if(!article)return;
const paragraphs=[...article.querySelectorAll(':scope > p')],found=paragraphs.filter(p=>p.textContent.includes(needle));
if(found.length!==1)return; // 正文有改动时不猜测位置或错误插图
const el=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n;};
const progress=p=>{try{
 if(window.ZSUnlock?.get)return Math.max(0,Math.min(100,Number(window.ZSUnlock.get(p).max)||0));
 const d=JSON.parse(localStorage.getItem('zs:part-progress:v1')||'{}');
 return Math.max(0,Math.min(100,Number(d['p'+String(p).padStart(2,'0')]?.max)||0));
}catch{return 0;}};
const node=el('section','zs-chapter-cg-scene');node.id='zs-chapter-cg-scene';
node.setAttribute('aria-label','本章对应剧情CG视觉档案');
let folded=false; // 仅当前页面的可见状态；不写阅读进度或其他保存数据
const after=found[0].nextElementSibling?.classList?.contains('zs-story-illustration')?found[0].nextElementSibling:found[0];
after.insertAdjacentElement('afterend',node);
function render(){
 const unlocked=records.filter(r=>progress(r.p)>=r.n);
 node.replaceChildren();
 const title=el('h3','zs-chapter-cg-heading','本段对应的视觉图鉴');
 const hint=el('p','zs-chapter-cg-hint','已公开CG为装备、人物或魔物的艺术化演绎，不新增未确认的等级与属性。');
 if(!unlocked.length){
  node.append(title,hint,el('p','zs-chapter-cg-locked','◇ 相关视觉资料尚未解锁。请在对应篇章标记章节已读后查看。'));
  return;
 }
 const bar=el('div','zs-chapter-cg-toolbar');
 const toggle=el('button','zs-chapter-cg-toggle',folded?'展开本章CG':'收起本章CG');
 toggle.type='button';toggle.setAttribute('aria-expanded',String(!folded));toggle.setAttribute('aria-controls','zs-chapter-cg-grid');
 toggle.addEventListener('click',()=>{folded=!folded;render();});
 bar.append(title,toggle);node.append(bar,hint);
 if(folded){
  node.append(el('p','zs-chapter-cg-collapsed','已收起 '+unlocked.length+' 张已解锁CG。展开后可查看缩略图，不影响正文或阅读进度。'));
  return;
 }
 const grid=el('div','zs-chapter-cg-grid');grid.id='zs-chapter-cg-grid';
 for(const r of unlocked){
  const item=el('article','zs-chapter-cg-item');
  const link=el('a','zs-chapter-cg-art');link.href=ROOT+'assets/images/codex/'+r.file;
  link.target='_blank';link.rel='noopener';link.setAttribute('aria-label','查看'+r.name+'高清CG');
  const img=el('img');img.loading='lazy';img.decoding='async';img.alt=r.name+'（CG艺术演绎）';img.width=960;img.height=1200;
  img.addEventListener('error',()=>{link.replaceWith(el('span','zs-chapter-cg-error','图片加载失败，请进入图鉴查看。'));});
  img.src=link.href;link.append(img);
  const body=el('div','zs-chapter-cg-body');
  body.append(el('small','zs-chapter-cg-category',r.kind+(r.cg?' · CG演绎':'')),el('strong','zs-chapter-cg-name',r.name));
  const detail=el('a','zs-chapter-cg-detail','查看该CG及档案 →');
  detail.href=ROOT+'archive/visual-codex.html?art='+encodeURIComponent(r.id);
  body.append(detail);
  if(Array.isArray(r.views)&&r.views.length)body.append(el('small','zs-chapter-cg-category','另有 '+r.views.length+' 张补充视角，点击图鉴查看'));
  item.append(link,body);grid.append(item);
 }
 node.append(grid);
 if(unlocked.length<records.length){
  node.append(el('p','zs-chapter-cg-muted','本章另有后续阶段视觉资料，暂不展示名称与图片。'));
 }
}
document.addEventListener('zs:part-progress-changed',render);
window.addEventListener('pageshow',render);
window.addEventListener('storage',e=>{if(e.key==='zs:part-progress:v1')render();});
render();
})();
