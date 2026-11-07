/* 第零序列 · 怪物图鉴：按首次出现章、后续观察记录逐项解锁 */
(()=>{'use strict';
const KEY='zs:part-progress:v1';
const root=document.getElementById('bestiary-root');
if(!root)return;
const search=document.getElementById('beast-search'),kind=document.getElementById('beast-kind'),region=document.getElementById('beast-region'),state=document.getElementById('beast-state');
const count=document.getElementById('beast-count'),bar=document.getElementById('beast-bar'),meter=document.getElementById('beast-meter');
const volnames=['重返','初临','暗流','无声之城','灰石盟约','失落商道','白霜边境','百城之约','黑风试炼','无名之门'];const p2volnames=['契约之外','无影商路','锻火账本','白烛与月','镜路歧途','北境长墙','分道与雷鸣','万家灯火','被改写的信','星火未熄'];const p3volnames=['无声偏差','远域双钟','失去编号的城','外缘旧门','断潮回廊','外环裂线','熔谷争锋','双轨冷光','无钟之夜','零刻回廊'];
const labels={habitats:'栖息地',skills:'已知能力 / 战斗表现',habits:'习性与生态',tactics:'实战观察与应对',observations:'待考证 / 附注'};
let records=[];
function progress(p=1){try{if(window.ZSUnlock?.get)return Math.max(0,Math.min(100,Number(window.ZSUnlock.get(p).max)||0));const x=JSON.parse(localStorage.getItem(KEY)||'{}');return Math.max(0,Math.min(100,Number(x['p'+String(p).padStart(2,'0')]?.max)||0));}catch{return 0;}}
function elem(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
function link(at,volume,chapter,text){const a=elem('a','beast-source',text);a.href='../chapters/volume-'+String(volume).padStart(2,'0')+'/chapter-'+String(chapter).padStart(3,'0')+'.html';a.setAttribute('aria-label',text+'，打开原文章节');return a;}
function span(cls,text){return elem('span',cls,text);}
function available(list,up){return (list||[]).filter(d=>d.at<=up);}
function chapterLabel(item){const title=item.vol<=10?volnames[item.vol-1]:item.vol<=20?p2volnames[item.vol-11]:p3volnames[item.vol-21];return '第'+item.vol+'卷'+(title?'《'+title+'》':'')+' · 第'+item.ch+'章';}
function unlocked(entry,up){return entry.first<=up;}
function normalize(t){return String(t||'').toLocaleLowerCase('zh-Hans').replace(/\s+/g,'');}
function keywords(entry,up){return [entry.name,entry.type,entry.region,entry.summary,...['habitats','skills','habits','tactics','observations','level'].flatMap(k=>available(entry[k],up).map(x=>x.text))].join(' ');}
function moreDetails(entry,up){
 const details=elem('div','beast-details');
 for(const key of ['habitats','skills','habits','tactics','observations']){
  const list=available(entry[key],up);if(!list.length)continue;
  const sec=elem('section','beast-fact'),h=elem('h4','',labels[key]);sec.append(h);
  const ul=elem('ul');for(const it of list){const li=elem('li');li.append(span('',it.text));if(it.at>entry.first)li.append(span('beast-record-tag','后续记录 · 第'+it.at+'章'));ul.append(li)}sec.append(ul);details.append(sec);
 }
 if(!details.children.length)details.append(elem('p','beast-muted','目前只有基础遭遇记录，尚无可靠技能或习性数据。'));
 return details;
}
function one(entry,up){
 const card=elem('article','beast-card'),header=elem('div','beast-card-head');
 const identity=elem('div','beast-identity');
 identity.append(span('beast-taxonomy',entry.type+' · '+entry.region),elem('h3','',entry.name),elem('p','beast-description',entry.summary));
 const icon=elem('div','beast-glyph',({魔物:'✦',未知生命:'◌',野生生物:'☘',契约伙伴:'✧',构装体:'⚙'})[entry.type]||'✦');icon.setAttribute('aria-hidden','true');
 header.append(identity,icon);card.append(header);
 const visual=(Array.isArray(window.ZSVisualCodex)?window.ZSVisualCodex:[]).find(x=>x.kind==='魔物'&&x.name===entry.name);
 if(visual && progress(visual.p)>=visual.n){
   const art=elem('a','beast-visual-preview');art.href='/zero-sequence-public/assets/images/codex/'+visual.file;art.target='_blank';art.rel='noopener';art.setAttribute('aria-label','放大查看'+entry.name+'魔物插画');
   const picture=elem('img');picture.src=art.href;picture.loading='lazy';picture.decoding='async';picture.alt=entry.name+'魔物视觉图鉴';picture.width=960;picture.height=1200;
   picture.addEventListener('error',()=>art.remove());art.append(picture);card.append(art);
 }
 const stats=elem('div','beast-facts-inline');
 stats.append(span('beast-chip','首次记录 · '+chapterLabel(entry)));
 const level=available(entry.level,up);
 stats.append(span('beast-chip',level.length?level.map(v=>v.text).join(' / '):'等级：未确认'));
 card.append(stats);
 const line=elem('div','beast-sources'),sourceTitle=elem('b','', '剧情记录');line.append(sourceTitle);
 const seen=new Set();for(const item of entry.sources||[]){if(item.at>up)continue;const key=item.vol+'-'+item.ch;if(seen.has(key))continue;seen.add(key);line.append(link(item.at,item.vol,item.ch,'第'+item.vol+'卷第'+item.ch+'章'));}
 const disclosure=elem('details','beast-expand');disclosure.open=false;
 disclosure.append(elem('summary','', '查看技能、习性、栖息地与调查记录'),moreDetails(entry,up),line);
 card.append(disclosure);
 return card;
}
function lockedCard(i,needed,part){const card=elem('article','beast-card beast-locked');
 card.append(elem('div','beast-lock-emblem','◈'),elem('h3','','未解锁生物档案'),elem('p','','继续阅读对应篇章，在故事出现后才会公开身份、栖息地及能力资料。'));
 card.append(span('beast-chip','第'+part+'篇 · 第'+needed+'章后解锁'));card.setAttribute('aria-label','未解锁条目 '+(i+1));return card;}
function setAreas(){
 const current=region.value||'all';const names=[...new Set(records.filter(x=>unlocked(x,progress(x.p||1))).map(x=>x.region))].sort((a,b)=>a.localeCompare(b,'zh-CN'));
 region.replaceChildren(new Option('全部已解锁地区','all'));names.forEach(n=>region.add(new Option(n,n)));region.value=names.includes(current)?current:'all';
}
function render(){
 const up=progress(1),up2=progress(2),up3=progress(3);const unlockedList=records.filter(x=>unlocked(x,progress(x.p||1)));const lockedList=records.filter(x=>!unlocked(x,progress(x.p||1)));
 setAreas();root.replaceChildren();
 const query=normalize(search.value),k=kind.value,z=region.value,st=state.value;
 const shown=unlockedList.filter(x=>(k==='all'||x.type===k)&&(z==='all'||x.region===z)&&(!query||normalize(keywords(x,progress(x.p||1))).includes(query)));
 const showLocked=(st==='all'||st==='locked')&&!query&&k==='all'&&z==='all';
 count.textContent=unlockedList.length+' / '+records.length+' 种已解锁 · 第一篇 '+up+'/100 · 第二篇 '+up2+'/100 · 第三篇 '+up3+'/100';
 bar.style.width=(unlockedList.length/Math.max(1,records.length)*100)+'%';
 meter.setAttribute('aria-valuenow',String(unlockedList.length));meter.setAttribute('aria-valuemax',String(records.length));
 if(st!=='locked'){
  if(shown.length){for(const x of shown)root.append(one(x,progress(x.p||1)));}
  else if(st==='unlocked'||query||k!=='all'||z!=='all')root.append(elem('p','beast-empty','没有找到符合条件的已公开档案。可以继续阅读或更换筛选条件。'));
 }
 if(showLocked){
  const heading=elem('div','beast-section-title');heading.append(elem('h2','','未解锁档案'),elem('p','','档案名称与具体信息不会提前展示'));root.append(heading);
  for(let i=0;i<lockedList.length;i++)root.append(lockedCard(i,lockedList[i].first,lockedList[i].p||1));
 }
 if(st==='locked'&&!showLocked)root.append(elem('p','beast-empty','未解锁档案仅在「全部地区 / 全部类别 / 无关键词」下展示，以免提前揭晓信息。'));
}
function error(text){root.replaceChildren(elem('p','beast-empty',text));count.textContent='图鉴数据暂不可用';}
async function init(){
 try{
  const res=await fetch('../assets/data/bestiary.json?v=2',{cache:'no-cache'});if(!res.ok)throw Error('network');
  const data=await res.json();if(!Array.isArray(data.entries))throw Error('schema');records=data.entries.sort((a,b)=>(a.p||1)-(b.p||1)||a.first-b.first||a.name.localeCompare(b.name,'zh-CN'));
  const p=new URLSearchParams(location.search),q=p.get('q');if(q)search.value=q.slice(0,80);
  for(const input of [search,kind,region,state])input.addEventListener(input===search?'input':'change',render);
  window.addEventListener('storage',e=>{if(e.key===KEY)render();});
  document.addEventListener('zs:part-progress-changed',render);
  render();
 }catch(e){error('怪物图鉴暂时无法加载，请确认网络连接或返回章节目录。');}
}
init();
})();