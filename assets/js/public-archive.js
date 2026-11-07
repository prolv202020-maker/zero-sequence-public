/* 第零序列 · 已发表读者图鉴：三篇独立阅读进度、按章节引用、绝不写入进度。 */
(()=>{'use strict';
const main=document.querySelector('[data-public-archive]');if(!main)return;
const ROOT='/zero-sequence-public/',scope=(main.dataset.scope||'').split(',').map(x=>x.trim()).filter(Boolean);
const codex=Array.isArray(window.ZSReaderCodex)?window.ZSReaderCodex:[];
const legacy=Array.isArray(window.ZSUnlock?.entries)?window.ZSUnlock.entries:[];
const entries=[],seen=new Set();
for(const entry of [...codex,...legacy]){
 if(!entry||![1,2,3].includes(entry.p)||!Number.isInteger(entry.n)||entry.n<1||entry.n>100)continue;
 if(scope.length&&!scope.includes(entry.k))continue;
 const key=[entry.p,entry.n,entry.k,entry.t].join('|');
 if(seen.has(key))continue;seen.add(key);entries.push(entry);
}
entries.sort((a,b)=>a.p-b.p||a.n-b.n||a.k.localeCompare(b.k,'zh-CN'));
const progress=p=>{try{
 if(window.ZSUnlock?.get)return Math.max(0,Math.min(100,Number(window.ZSUnlock.get(p).max)||0));
 const x=JSON.parse(localStorage.getItem('zs:part-progress:v1')||'{}');
 return Math.max(0,Math.min(100,Number(x['p'+String(p).padStart(2,'0')]?.max)||0));
}catch{return 0}};
const el=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n;};
const chapter=e=>ROOT+'chapters/volume-'+String((e.p-1)*10+Math.ceil(e.n/10)).padStart(2,'0')+'/chapter-'+String((e.n-1)%10+1).padStart(3,'0')+'.html';
const input=document.getElementById('public-archive-search'),host=document.getElementById('public-archive-records'),status=document.getElementById('public-archive-status'),toolbar=main.querySelector('.pa-tools');
if(!host)return;
const partSelect=el('select','pa-select');partSelect.setAttribute('aria-label','按已发布篇章筛选');
[['','全部篇章'],['1','第一篇'],['2','第二篇'],['3','第三篇']].forEach(([v,t])=>{const option=el('option','',t);option.value=v;partSelect.append(option);});
const catSelect=el('select','pa-select');catSelect.setAttribute('aria-label','图鉴类别筛选');
if(toolbar){toolbar.insertBefore(partSelect,status);toolbar.insertBefore(catSelect,status);}
const mapping={'人物':'characters.html','魔物':'bestiary.html','构装体':'bestiary.html','未知生命':'bestiary.html','契约伙伴':'bestiary.html','野生生物':'bestiary.html','武器':'equipment.html','装备':'equipment.html','道具':'items.html','技能':'classes.html','材料':'materials.html','势力':'factions.html','地图':'world.html','世界':'world.html','地点':'world.html'};
function render(){
 const p={1:progress(1),2:progress(2),3:progress(3)};
 const unlocked=entries.filter(e=>p[e.p]>=e.n),q=(input?.value||'').trim().toLocaleLowerCase('zh-Hans');
 const currentCat=catSelect.value,catNames=[...new Set(unlocked.map(e=>e.k))].sort((a,b)=>a.localeCompare(b,'zh-CN'));
 catSelect.replaceChildren();let all=el('option','','全部类别');all.value='';catSelect.append(all);
 for(const k of catNames){const option=el('option','',k);option.value=k;catSelect.append(option);}
 catSelect.value=catNames.includes(currentCat)?currentCat:'';
 const visible=unlocked.filter(e=>(!partSelect.value||e.p===Number(partSelect.value))&&(!catSelect.value||e.k===catSelect.value)&&(!q||[e.k,e.t,e.d].join(' ').toLocaleLowerCase('zh-Hans').includes(q)));
 host.replaceChildren();
 for(const e of visible){
  const card=el('article','pa-item');
  card.append(el('small','pa-card-meta','第'+e.p+'篇 · 读至第'+e.n+'章 · '+e.k),el('h3','',e.t),el('p','',e.d));
  const links=el('div','pa-related');
  const src=el('a','','查看对应正文 →');src.href=chapter(e);links.append(src);
  if(mapping[e.k]&&main.dataset.publicArchive!=='codex'){const cat=el('a','','相关图鉴');cat.href=ROOT+'archive/'+mapping[e.k];links.append(cat);}
  card.append(links);host.append(card);
 }
 if(!visible.length)host.append(el('p','pa-empty','当前筛选没有已解锁的资料。可以继续阅读对应章节或调整筛选条件。'));
 if(status)status.textContent='第一篇 '+p[1]+'/100 · 第二篇 '+p[2]+'/100 · 第三篇 '+p[3]+'/100 · 显示 '+visible.length+' 条 · 另有 '+(entries.length-unlocked.length)+' 条等待章节解锁';
}
input?.addEventListener('input',render);partSelect.addEventListener('change',render);catSelect.addEventListener('change',render);
document.addEventListener('zs:part-progress-changed',render);window.addEventListener('pageshow',render);render();
})();
