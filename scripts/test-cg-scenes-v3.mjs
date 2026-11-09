#!/usr/bin/env node
/* 《第零序列》CG V3：章节精确插画锚点、分类展示与未读安全门禁。 */
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {runInNewContext,Script} from 'node:vm';
const ROOT=resolve(fileURLToPath(new URL('../',import.meta.url)));
const read=p=>readFileSync(join(ROOT,p),'utf8');
const chapterJS=read('assets/js/chapter-cg-scenes.js');
assert.doesNotThrow(()=>new Script(chapterJS),'Chapter CG module must parse');
assert.ok(!chapterJS.includes('localStorage.setItem'),'Chapter CG must not mutate reading progress');
const match=chapterJS.match(/const ANCHORS=Object.freeze\((\{[\s\S]*?\})\);/);
assert.ok(match,'Exact prose anchors must be declared in the module');
const anchors=JSON.parse(match[1]);
assert.equal(Object.keys(anchors).length,19,'V3 must cover exactly 19 chapter locations');
const ctx={window:{}};runInNewContext(read('assets/js/visual-codex-data.js'),ctx);
const arts=ctx.window.ZSVisualCodex;
assert.equal(arts.length,24,'All previously published 24 CG cards remain intact');
const perSource=new Map();
for(const art of arts){
 const old=perSource.get(art.source)||[];old.push(art);perSource.set(art.source,old);
}
assert.equal(perSource.size,19,'24 arts must link to 19 verified source chapters');
assert.ok(read('assets/js/immersive-illustrations.js').includes('三篇共23幅已发布插画'),'Keep the original 23 immersive story illustrations');
class FakeNode{
 constructor(tag,text=''){this.tag=tag;this.textContent=text;this.children=[];this.className='';this.id='';this.style={};this.inserted=[];this.nextElementSibling=null;}
 append(...x){this.children.push(...x)} replaceChildren(...x){this.children=[...x]}
 setAttribute(){} addEventListener(){} replaceWith(){} insertAdjacentElement(_pos,node){this.inserted.push(node)}
}
function getAll(node,tag){return (node.tag===tag?[node]:[]).concat(...node.children.flatMap(x=>getAll(x,tag)))}
function simulate(path,progress){
 const html=read(path);
 const paragraphs=[...html.matchAll(/<p>([\s\S]*?)<\/p>/g)].map(z=>z[1].replace(/<[^>]+>/g,'').trim());
 const fake=paragraphs.map(x=>new FakeNode('p',x));
 const article={querySelectorAll:sel=>sel===':scope > p'?fake:[]};
 const dom={querySelector:sel=>sel==='.article'?article:null,createElement:t=>new FakeNode(t),addEventListener(){}};
 const win={ZSVisualCodex:arts,ZSUnlock:{get:p=>({max:progress[p]||0})},addEventListener(){}};
 runInNewContext(chapterJS,{document:dom,window:win,location:{pathname:'/zero-sequence-public/'+path},localStorage:{getItem:()=>null},encodeURIComponent});
 const inserted=fake.flatMap(x=>x.inserted);
 return{inserted,paragraphs,original:fake.map(x=>x.textContent),html};
}
let artCount=0;
for(const [key,needle] of Object.entries(anchors)){
 const [vol,ch]=key.split('/'),path='chapters/volume-'+vol+'/chapter-'+ch+'.html';
 assert.ok(existsSync(join(ROOT,path)),'Missing source chapter '+path);
 const initial=simulate(path,{});
 assert.equal(initial.paragraphs.filter(x=>x.includes(needle)).length,1,'Scene needle must match exactly once '+path);
 assert.deepEqual(initial.paragraphs,initial.original,'Original prose must not be modified '+path);
 assert.equal(initial.inserted.length,1,'Insert exactly one CG section after the verified prose anchor '+path);
 assert.equal(getAll(initial.inserted[0],'img').length,0,'Unread chapter must not load CG '+path);
 assert.ok(!arts.some(x=>getAll(initial.inserted[0],'strong').some(n=>n.textContent===x.name)),'Unread chapter must never reveal an item name '+path);
 assert.ok(initial.html.includes('chapter-cg-scenes.js?v=2'),'CG renderer missing in '+path);
 assert.ok(initial.html.includes('visual-codex-data.js?v=5'),'CG data missing in '+path);
 assert.ok(initial.html.includes('chapter-cg-scenes.css?v=2'),'CG adaptive styles missing in '+path);
 assert.ok(initial.html.includes('cg-lightbox.js?v=1'),'Chapter fullscreen viewer missing in '+path);
 assert.ok(initial.html.includes('zs-cg-chapter-bridge'),'Preserve the existing V2 backlink '+path);
 const fullyRead=simulate(path,{1:100,2:100,3:100});
 const n=perSource.get(path)?.length||0;artCount+=n;
 assert.equal(getAll(fullyRead.inserted[0],'img').length,n,'Display all approved visuals in '+path);
 const allNames=getAll(fullyRead.inserted[0],'strong').map(x=>x.textContent);
 for(const item of perSource.get(path)||[])assert.ok(allNames.includes(item.name),'Missing approved art '+item.id);
}
assert.equal(artCount,24,'All published image cards must have a chapter-level representation');
assert.equal(getAll(simulate('chapters/volume-25/chapter-003.html',{3:42}).inserted[0],'img').length,0,'Third-arc beast must remain locked before its real chapter');
assert.equal(getAll(simulate('chapters/volume-25/chapter-003.html',{3:43}).inserted[0],'img').length,2,'Third-arc beast variants should unlock together at 43');
assert.equal(getAll(simulate('chapters/volume-01/chapter-001.html',{1:1}).inserted[0],'img').length,0,'Early protagonist portrait remains locked until chapter 11');
assert.equal(getAll(simulate('chapters/volume-01/chapter-001.html',{1:11}).inserted[0],'img').length,1,'Protagonist approved CG unlock gate remains chapter 11');
assert.equal(getAll(simulate('chapters/volume-29/chapter-001.html',{3:80}).inserted[0],'img').length,0,'Frost-repaired sword cannot unlock in prior chapter');
assert.equal(getAll(simulate('chapters/volume-29/chapter-001.html',{3:81}).inserted[0],'img').length,1,'Frost-repaired sword unlocks correctly at chapter 81');
const equipment=read('archive/equipment.html');
for(const id of ['pa-equipment-kind','pa-equipment-part','pa-equipment-sort','pa-equipment-search'])assert.ok(equipment.includes('id="'+id+'"'),'Equipment must have real filtering control '+id);
assert.ok(equipment.includes('archive-artworks.js?v=4')&&equipment.includes('archive-artworks.css?v=3'),'Equipment browser must bust old CSS/JS cache');
const gearCode=read('assets/js/archive-artworks.js');
assert.doesNotThrow(()=>new Script(gearCode),'Equipment browser V3 JS should parse');
assert.ok(!gearCode.includes('localStorage.setItem'),'Equipment browsers must never write progress');
assert.ok(gearCode.includes('progress(r.p)>=r.n')&&gearCode.includes('if(unlocked)'),'Equipment images must respect independent per-part gates');
assert.ok(gearCode.includes('!keyword||(progress(r.p)>=r.n'),'Search may match only unlocked equipment');
assert.ok(read('assets/css/archive-artworks.css').includes('.pa-equipment-filters'),'Equipment controls must be mobile styled');
function gearSim(type,part,search,progress){
 const host=new FakeNode('host'),status=new FakeNode('status');
 const nodes={'pa-artworks-grid':host,'pa-artworks-status':status};
 for(const [id,value] of Object.entries({'pa-equipment-kind':type,'pa-equipment-part':part,'pa-equipment-search':search,'pa-equipment-sort':'story'})){
  const node=new FakeNode('input');node.value=value;nodes[id]=node;
 }
 const doc={querySelector:()=>({dataset:{publicArchive:'equipment'}}),getElementById:id=>nodes[id]||null,createElement:tag=>new FakeNode(tag),addEventListener(){}};
 const win={ZSVisualCodex:arts,ZSUnlock:{get:p=>({max:progress[p]||0})},addEventListener(){}};
 runInNewContext(gearCode,{document:doc,window:win,localStorage:{getItem:()=>null},encodeURIComponent});
 return host;
}
assert.equal(getAll(gearSim('武器','0','',{1:100,2:100,3:100}),'img').length,4,'Weapon filter should show four approved weapons');
assert.equal(getAll(gearSim('装备','0','',{1:100,2:100,3:100}),'img').length,4,'Armor filter should show four approved armors');
assert.equal(getAll(gearSim('all','3','',{3:81}),'img').length,4,'Third-arc equipment is four unique artworks');
assert.equal(getAll(gearSim('all','3','寒纹',{3:80}),'img').length,0,'Do not reveal not-yet-read equipment from search');
assert.equal(getAll(gearSim('all','3','寒纹',{3:81}),'img').length,1,'Search should show one confirmed unlocked frost repair sword');
console.log('[CG V3] PASS: 19 exact prose anchors, 24 separately gated CGs, unchanged 23 immersive illustrations, 8 gear works with mobile category and spoiler-safe search.');
