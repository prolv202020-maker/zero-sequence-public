/* Visual reader codex: no image request or identity before the chapter gate. */
(()=>{"use strict";
const host=document.getElementById("zs-visual-codex-grid"),status=document.getElementById("zs-visual-codex-status");
if(!host||!status)return;
const ROOT="/zero-sequence-public/",records=Array.isArray(window.ZSVisualCodex)?window.ZSVisualCodex:[];
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n};
const progress=p=>{try{if(window.ZSUnlock?.get)return Math.max(0,Math.min(100,Number(window.ZSUnlock.get(p).max)||0));
 const a=JSON.parse(localStorage.getItem("zs:part-progress:v1")||"{}");
 return Math.max(0,Math.min(100,Number(a["p"+String(p).padStart(2,"0")]?.max)||0));}catch{return 0}};
const tab=document.getElementById("zs-visual-kind");
function makeImage(record){
 const wrapper=el("a","zs-visual-art");wrapper.href=ROOT+"assets/images/codex/"+record.file;
 wrapper.target="_blank";wrapper.rel="noopener";wrapper.setAttribute("aria-label","放大查看"+record.name+"视觉档案");
 const picture=el("img");picture.loading="lazy";picture.decoding="async";picture.width=960;picture.height=1200;picture.alt=record.name+"视觉图鉴插画";
 picture.addEventListener("error",()=>{const box=el("div","zs-visual-fallback","插画文件正在同步，文字档案已可阅读。");wrapper.replaceWith(box);});
 picture.src=wrapper.href;wrapper.append(picture);return wrapper;
}
function render(){
 const amounts={1:progress(1),2:progress(2),3:progress(3)},kind=tab?.value||"all";
 const available=records.filter(x=>amounts[x.p]>=x.n);
 host.replaceChildren();
 for(const record of records){
  if(kind!=="all"&&record.kind!==kind)continue;
  const unlocked=amounts[record.p]>=record.n;
  const card=el("article","zs-visual-card"+(unlocked?"":" is-locked"));
  if(unlocked){
   card.append(makeImage(record));
   const copy=el("div","zs-visual-copy");
   copy.append(el("small","","第"+record.p+"篇 · 已解锁 · "+record.kind),el("h2","",record.name),el("p","",record.summary));
   const links=el("div","zs-visual-links"),origin=el("a","","查看原文章节 →"),detail=el("a","","查看文字图鉴 →");
   origin.href=ROOT+record.source;detail.href=ROOT+record.detail;links.append(origin,detail);copy.append(links);card.append(copy);
  }else{
   card.append(el("div","zs-visual-locked-art","◇"),el("div","zs-visual-copy"));
   const copy=card.lastElementChild;
   copy.append(el("small","","第"+record.p+"篇 · 第"+record.n+"章"),el("h2","","尚未解锁的视觉档案"),el("p","","继续阅读对应篇章后开放插画与名称。"));
  }
  host.append(card);
 }
 status.textContent="第一篇 "+amounts[1]+"/100 · 第二篇 "+amounts[2]+"/100 · 第三篇 "+amounts[3]+"/100 · 已解锁视觉图鉴 "+available.length+"/"+records.length;
}
tab?.addEventListener("change",render);document.addEventListener("zs:part-progress-changed",render);window.addEventListener("pageshow",render);render();
})();
