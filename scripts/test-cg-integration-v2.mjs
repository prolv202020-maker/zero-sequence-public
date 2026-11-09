#!/usr/bin/env node
/* 全站CG图鉴 V2：锁定分篇进度、同物种多场景、链接路径、无图片泄露与客户端画廊回归。 */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {runInNewContext,Script} from 'node:vm';
const ROOT=resolve(fileURLToPath(new URL('../',import.meta.url)));
const read=p=>readFileSync(join(ROOT,p),'utf8');
const ctx={window:{}};runInNewContext(read('assets/js/visual-codex-data.js'),ctx);
const records=ctx.window.ZSVisualCodex;
assert.equal(records.length,25,'V2 must keep all 24 approved image cards');
assert.equal(new Set(records.map(x=>x.id)).size,25,'CG ids must remain unique');
assert.equal(new Set(records.map(x=>x.file)).size,25,'Do not copy duplicate art binaries');
const types={};for(const x of records){
 types[x.kind]=(types[x.kind]||0)+1;
 assert.ok(existsSync(join(ROOT,'assets/images/codex',x.file)),'Missing artwork '+x.file);
 assert.ok(existsSync(join(ROOT,x.source)),'Missing published source '+x.source);
 assert.ok([1,2,3].includes(x.p)&&x.n>=1&&x.n<=100,'Invalid independently gated chapter');
}
assert.deepEqual(types,{人物:2,魔物:8,武器:4,装备:5,材料:2,道具:4});
for(const id of ['large-rift-fin-beast-cg','rift-fin-swarm-voyage-cg'])
 assert.equal(records.find(x=>x.id===id)?.subject,'裂鳍兽','Related creatures need explicit approved species, not substring guessing');
const aliases=new Map([
 ['gu-changyuan-ordinary-longsword-cg','顾长渊的普通长剑'],
 ['dai-xuanyue-shield-plate-cg','盾面护板'],
 ['cold-pattern-repaired-longsword-cg','寒纹修复长剑']]);
for(const [id,term] of aliases)assert.ok(records.find(x=>x.id===id)?.indexTerms.includes(term),'Missing exact released archive alias: '+term);
const sources=new Set(records.map(x=>x.source));
assert.equal(sources.size,19,'Every original CG source chapter should have one back-link');
for(const path of sources){
 const html=read(path);
 assert.ok(html.includes('zs-cg-chapter-bridge'),'Source chapter must include CG back-link: '+path);
 assert.ok(html.includes('visual-codex.html?source='+encodeURIComponent(path)),'CG source filtering not correct: '+path);
 assert.equal((html.match(/zs-cg-chapter-bridge/g)||[]).length,1,'Do not duplicate chapter CG links: '+path);
}
const pages=['archive/visual-codex.html','archive/codex.html','archive/equipment.html','archive/items.html','archive/materials.html','archive/bestiary.html',
 ...['gu-changyuan','su-zili','lin-lie','luo-jin','ling-tianyao','dai-xuanyue','gu-yanche'].map(x=>'archive/characters/'+x+'.html')];
for(const path of pages){
 const html=read(path);
 assert.ok(html.includes('visual-codex-data.js?v=6'),'Manifest cache update missing: '+path);
 assert.ok(html.includes('cg-lightbox.js?v=1')&&html.includes('cg-lightbox.css?v=1'),'Full-screen CG component not linked: '+path);
}
const visualHtml=read('archive/visual-codex.html');
for(const id of ['zs-visual-search','zs-visual-part','zs-visual-kind','zs-visual-codex-grid'])
 assert.ok(visualHtml.includes('id="'+id+'"'),'Missing CG gallery control '+id);
const scripts=['assets/js/visual-codex.js','assets/js/archive-artworks.js','assets/js/public-archive.js','assets/js/bestiary.js','assets/js/profile-v2.js','assets/js/cg-lightbox.js'];
for(const file of scripts){
 const src=read(file);assert.doesNotThrow(()=>new Script(src,{filename:file}),file+' JS syntax');
 assert.ok(!src.includes('localStorage.setItem'),file+' must never write reading progress');
}
const lightbox=read('assets/js/cg-lightbox.js');
assert.ok(lightbox.includes('HTMLDialogElement')&&lightbox.includes('dialog.showModal()'),'CG high-resolution modal must be accessible');
assert.ok(lightbox.includes("preview.removeAttribute('src')"),'Closing viewer must unload heavy full-resolution image');
const pageJs=read('assets/js/visual-codex.js');
assert.ok(pageJs.includes('if(isOpen)')&&pageJs.includes('makeImage(record)'),'No locked image should be constructed');
assert.ok(pageJs.includes('(!source||r.source===source)'),'Source-chapter deep links must work');
assert.ok(pageJs.includes('(!isOpen||'),'Locked records must not be searched by title or description');
const publicJs=read('assets/js/public-archive.js');
assert.ok(publicJs.includes('x.indexTerms.includes(e.t)'),'Explicit alternative terms must link old text cards to new CG');
assert.ok(publicJs.includes('p[art.p]>=art.n'),'Reader and image chapter gates must both pass');
const bestiary=read('assets/js/bestiary.js');
assert.ok(bestiary.includes('x.subject===entry.name')&&bestiary.includes('progress(x.p)>=x.n'),'Species variants may display only after their corresponding chapter');
assert.ok(read('assets/js/profile-v2.js').includes('encodeURIComponent(visual.id)'),'Character portrait must link to matching gallery card');
class FakeNode{
 constructor(tag){this.tag=tag;this.children=[];this.textContent='';this.className='';this.value='';this.id='';this.style={};}
 append(...items){this.children.push(...items);} replaceChildren(...items){this.children=[...items];}
 setAttribute(){} addEventListener(){} replaceWith(){} scrollIntoView(){}
}
const flatten=(node)=>[node,...node.children.flatMap(flatten)];
function renderGallery(up,opts={}){
 const nodes={};for(const id of ['zs-visual-codex-grid','zs-visual-codex-status','zs-visual-kind','zs-visual-part','zs-visual-search'])
  nodes[id]=new FakeNode(id);
 nodes['zs-visual-kind'].value=opts.kind||'all';
 nodes['zs-visual-part'].value=opts.part||'0';
 nodes['zs-visual-search'].value=opts.search||'';
 const doc={getElementById:id=>nodes[id]||null,createElement:tag=>new FakeNode(tag),addEventListener(){}};
 const win={ZSVisualCodex:records,ZSUnlock:{get:p=>({max:up[p]||0})},addEventListener(){}};
 runInNewContext(pageJs,{window:win,document:doc,location:{search:opts.query||''},URLSearchParams,localStorage:{getItem:()=>null},requestAnimationFrame:fn=>fn()});
 return{host:nodes['zs-visual-codex-grid'],status:nodes['zs-visual-codex-status']};
}
let locked=renderGallery({});
assert.equal(flatten(locked.host).filter(x=>x.tag==='img').length,0,'Unopened reader must never load CG image');
assert.ok(!flatten(locked.host).some(x=>String(x.textContent).includes('裂鳍兽群追船')),'Unopened reader must not receive visible CG titles');
let full=renderGallery({1:100,2:100,3:100});
assert.equal(flatten(full.host).filter(x=>x.tag==='img').length,28,'All 24 CG cards must display for fully-read readers');
let only3=renderGallery({3:43},{kind:'魔物',part:'3',search:'裂鳍兽'});
assert.equal(flatten(only3.host).filter(x=>x.tag==='img').length,3,'Three approved rift-fin depictions share independent gates');
let noLeak=renderGallery({},{search:'裂鳍兽'});
assert.equal(flatten(noLeak.host).filter(x=>x.tag==='img').length,0,'Unread search may not reveal or load CGs');
assert.ok(!flatten(noLeak.host).some(x=>String(x.textContent).includes('裂鳍兽')),'Unread search may not expose names');
console.log('[CG V2+] PASS: 25 cards, 3 same-item supplemental views, 19 bidirectional source links, 13 integrated reader pages, full-screen viewer, explicit aliases and species scenes, locked search/image privacy.');
