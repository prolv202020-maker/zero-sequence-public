#!/usr/bin/env node
/* 内嵌CG回归：装备/道具/材料页面独立展示图像，而非只按文字条目名称匹配。 */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Script,runInNewContext} from 'node:vm';
const ROOT=resolve(fileURLToPath(new URL('../',import.meta.url)));
const read=path=>readFileSync(join(ROOT,path),'utf8');
const file='assets/js/archive-artworks.js',script=read(file);
assert.doesNotThrow(()=>new Script(script,{filename:file}));
assert.ok(!script.includes('localStorage.setItem'),'Archive art must never write reading progress');
assert.ok(script.includes("progress(r.p)>=r.n"),'CG display needs its own independent part gate');
assert.ok(script.includes('if(unlocked)'), 'No image element may be created in locked branch');
assert.ok(script.includes("img.src=full.href"),'Successful unlocked cards must load their WebP images');
assert.ok(read('assets/css/archive-artworks.css').includes('@media(max-width:720px)'),'Mobile gallery styles required');
const ctx={window:{}};
runInNewContext(read('assets/js/visual-codex-data.js'),ctx);
const art=ctx.window.ZSVisualCodex,groups={equipment:['武器','装备'],items:['道具'],materials:['材料']};
const counts={equipment:8,items:4,materials:2};
for(const [page,kinds] of Object.entries(groups)){
 const cards=art.filter(x=>kinds.includes(x.kind));
 assert.equal(cards.length,counts[page],'Unexpected '+page+' card count');
 for(const card of cards){
  assert.ok(existsSync(join(ROOT,'assets/images/codex',card.file)),'Missing image '+card.file);
  assert.ok(existsSync(join(ROOT,card.source)),'Missing source '+card.source);
 }
 const html=read('archive/'+page+'.html');
 assert.ok(html.includes('id="pa-artworks-grid"')&&html.includes('id="pa-artworks-status"'),page+' missing inline CG area');
 assert.ok(html.includes('archive-artworks.css?v=1'),page+' missing artwork CSS');
 const manifest=html.indexOf('visual-codex-data.js?v=4'),renderer=html.indexOf('archive-artworks.js?v=1');
 assert.ok(manifest>=0&&renderer>manifest,page+' must load manifest before inline artwork renderer');
}
// Run a minimal DOM simulation for the three independent reading tracks.
class FakeNode{
 constructor(tag){this.tag=tag;this.children=[];this.textContent='';this.className='';this.attributes={};}
 append(...nodes){this.children.push(...nodes);}
 replaceChildren(...nodes){this.children=[...nodes];}
 setAttribute(k,v){this.attributes[k]=v;}
 addEventListener(){}
 replaceWith(){}
}
function traverse(node,tag){
 return (node.tag===tag?[node]:[]).concat(...node.children.map(x=>traverse(x,tag)));
}
function mock(page,progress){
 const host=new FakeNode('section'),status=new FakeNode('span');
 const events={};
 const win={ZSVisualCodex:art,ZSUnlock:{get:p=>({max:progress[p]||0})},addEventListener:(k,f)=>{events[k]=f}};
 const doc={querySelector:()=>({dataset:{publicArchive:page}}),getElementById:k=>k==='pa-artworks-grid'?host:k==='pa-artworks-status'?status:null,createElement:tag=>new FakeNode(tag),addEventListener:(k,f)=>{events[k]=f}};
 runInNewContext(script,{window:win,document:doc,localStorage:{getItem:()=>null}});
 return{host,status,events};
}
for(const page of Object.keys(groups)){
 const locked=mock(page,{});
 assert.equal(traverse(locked.host,'img').length,0,page+' must not load unseen image');
 assert.equal(locked.host.children.length,counts[page]);
 assert.ok(!locked.host.children.some(x=>JSON.stringify(x).includes('矿盐粉末（CG演绎）')),'Locked names must stay hidden');
}
assert.equal(traverse(mock('equipment',{1:88,2:75} ).host,'img').length,4,'Equipment gallery should show four works');
assert.equal(traverse(mock('items',{2:31,3:65}).host,'img').length,4,'Items gallery should show four works');
assert.equal(traverse(mock('materials',{1:44,3:55}).host,'img').length,2,'Materials gallery should show two works');
assert.equal(traverse(mock('equipment',{2:75}).host,'img').length,3,'Only second-arc equipment art may unlock');
assert.equal(traverse(mock('equipment',{3:6}).host,'img').length,1,'Shield plate only unlocks at third-arc chapter 6');
assert.equal(traverse(mock('equipment',{3:11}).host,'img').length,2,'Ordinary sword unlocks at third-arc chapter 11');
assert.equal(traverse(mock('equipment',{3:80}).host,'img').length,3,'Wrist bracer unlocks at third-arc chapter 80');
assert.equal(traverse(mock('equipment',{3:81}).host,'img').length,4,'Cold-pattern repaired sword unlocks at third-arc chapter 81');
assert.equal(traverse(mock('equipment',{1:100,2:100,3:100}).host,'img').length,8,'All equipment CG art appears after all three parts are read');
assert.equal(traverse(mock('items',{3:28}).host,'img').length,1,'Single third-arc gate should not unlock future items');
console.log('[INLINE ARTWORK] PASS: three independent galleries, 14 anchored art cards, locked images never load, mobile styles, reader progress unchanged.');
