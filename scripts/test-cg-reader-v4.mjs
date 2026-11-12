#!/usr/bin/env node
/* 《第零序列》V4 CG 阅读体验：只显示已解锁、临时收起、版本刷新与防剧透测试 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Script,runInNewContext} from 'node:vm';
const ROOT=resolve(fileURLToPath(new URL('../',import.meta.url)));
const read=p=>readFileSync(join(ROOT,p),'utf8');
const ctx={window:{}};runInNewContext(read('assets/js/visual-codex-data.js'),ctx);
const arts=ctx.window.ZSVisualCodex;
assert.equal(arts.length,25,'Previously approved 24 art cards must be preserved');
class Node{
 constructor(tag,text=''){this.tag=tag;this.textContent=text;this.children=[];this.listeners={};this.id='';this.className='';this.value='';this.checked=false;this.insertions=[];this.nextElementSibling=null;this.style={};this.attributes={};}
 append(...nodes){this.children.push(...nodes)}
 replaceChildren(...nodes){this.children=[...nodes]}
 setAttribute(k,v){this.attributes[k]=v}
 addEventListener(k,fn){this.listeners[k]=fn}
 insertAdjacentElement(_where,node){this.insertions.push(node)}
 replaceWith(){} scrollIntoView(){}
}
const nested=(x,tag)=>[...(x.tag===tag?[x]:[]),...x.children.flatMap(y=>nested(y,tag))];
const nodesByClass=(x,cls)=>[...(x.className===cls?[x]:[]),...x.children.flatMap(y=>nodesByClass(y,cls))];
const allScripts=['assets/js/chapter-cg-scenes.js','assets/js/visual-codex.js','assets/js/archive-artworks.js'];
for(const p of allScripts){
 const src=read(p);assert.doesNotThrow(()=>new Script(src),p+' must parse');
 assert.ok(!src.includes('localStorage.setItem'),p+' must not modify stored reading history');
}
const sceneJS=read('assets/js/chapter-cg-scenes.js');
function chapter(progress){
 const html=read('chapters/volume-25/chapter-003.html');
 const pars=[...html.matchAll(/<p>([\s\S]*?)<\/p>/g)].map(m=>new Node('p',m[1].replace(/<[^>]+>/g,'')));
 const doc={querySelector:s=>s==='.article'?{querySelectorAll:t=>t===':scope > p'?pars:[]}:null,createElement:tag=>new Node(tag),addEventListener(){}};
 const win={ZSVisualCodex:arts,ZSUnlock:{get:p=>({max:progress[p]||0})},addEventListener(){}};
 runInNewContext(sceneJS,{window:win,document:doc,location:{pathname:'/zero-sequence-public/chapters/volume-25/chapter-003.html'},localStorage:{getItem:()=>null},encodeURIComponent});
 const panel=pars.flatMap(x=>x.insertions)[0];assert.ok(panel,'Need anchored CG section');
 return panel;
}
let p=chapter({3:43});
assert.equal(nested(p,'img').length,2,'Two rift-fin CGs should be shown once third arc chapter 43 is read');
let t=nodesByClass(p,'zs-chapter-cg-toggle')[0];
assert.equal(t.attributes['aria-expanded'],'true','Expanded CG panel should be accessible');
assert.ok(t.listeners.click,'Reader should have a working CG fold control');
t.listeners.click();
assert.equal(nested(p,'img').length,0,'Collapsed chapter CG must not retain displayed image elements');
t=nodesByClass(p,'zs-chapter-cg-toggle')[0];
assert.equal(t.attributes['aria-expanded'],'false','Collapsed state should be exposed to assistive technology');
t.listeners.click();
assert.equal(nested(p,'img').length,2,'Expanding restores previously unlocked art without touching progress');
assert.equal(nested(chapter({3:42}),'img').length,0,'Unread chapter must not load spoiler images');
assert.equal(nodesByClass(chapter({3:42}),'zs-chapter-cg-toggle').length,0,'Locked panel cannot expose art control prematurely');
function gallery(progress,only){
 const host=new Node('grid'),status=new Node('status'),kind=new Node('select'),part=new Node('select'),search=new Node('input'),toggle=new Node('input');
 kind.value='all';part.value='0';search.value='';toggle.checked=only;
 const map={'zs-visual-codex-grid':host,'zs-visual-codex-status':status,'zs-visual-kind':kind,'zs-visual-part':part,'zs-visual-search':search,'zs-visual-only-unlocked':toggle};
 const doc={getElementById:id=>map[id],createElement:tag=>new Node(tag),addEventListener(){}};
 const win={ZSVisualCodex:arts,ZSUnlock:{get:p=>({max:progress[p]||0})},addEventListener(){}};
 runInNewContext(read('assets/js/visual-codex.js'),{document:doc,window:win,location:{search:''},URLSearchParams,localStorage:{getItem:()=>null},requestAnimationFrame:f=>f()});
 return host;
}
const ready=arts.filter(x=>x.p===3&&x.n<=43).length;
assert.equal(nested(gallery({3:43},true),'img').length,ready+1,'Gallery unlocked-only filter must include exactly the released CGs');
assert.equal(gallery({3:43},true).children.length,ready,'Gallery unlocked-only filter should hide all locked placeholders');
assert.equal(gallery({3:43},false).children.length,25,'Default discovery mode keeps existing 24 card slots');
assert.equal(nested(gallery({},true),'img').length,0,'First-time reader cannot load CG through unlocked-only view');
function equipment(progress,only,kindValue='all'){
 const host=new Node('grid'),status=new Node('status'),kind=new Node('select'),part=new Node('select'),search=new Node('input'),sort=new Node('select'),toggle=new Node('input');
 kind.value=kindValue;part.value='0';search.value='';sort.value='story';toggle.checked=only;
 const map={'pa-artworks-grid':host,'pa-artworks-status':status,'pa-equipment-kind':kind,'pa-equipment-part':part,'pa-equipment-search':search,'pa-equipment-sort':sort,'pa-equipment-only-unlocked':toggle};
 const doc={querySelector:()=>({dataset:{publicArchive:'equipment'}}),getElementById:id=>map[id],createElement:tag=>new Node(tag),addEventListener(){}};
 const win={ZSVisualCodex:arts,ZSUnlock:{get:p=>({max:progress[p]||0})},addEventListener(){}};
 runInNewContext(read('assets/js/archive-artworks.js'),{window:win,document:doc,localStorage:{getItem:()=>null},encodeURIComponent});
 return host;
}
assert.equal(equipment({3:11},true).children.length,2,'Partial third-arc reader should see only shield and basic sword');
assert.equal(nested(equipment({3:11},true),'img').length,2);
assert.equal(equipment({3:11},true,'武器').children.length,1,'Weapon-only filter should work with unlocked-only');
assert.equal(equipment({3:11},false).children.length,9,'Default equipment page retains locked placeholders');
assert.equal(nested(equipment({},true),'img').length,0,'New readers must not load locked equipment');
const galleryHTML=read('archive/visual-codex.html'),gearHTML=read('archive/equipment.html');
for(const marker of ['zs-visual-only-unlocked','visual-codex.js?v=6','visual-codex.css?v=5'])assert.ok(galleryHTML.includes(marker),'Visual gallery missing V4 '+marker);
for(const marker of ['pa-equipment-only-unlocked','archive-artworks.js?v=5','archive-artworks.css?v=4','progressive-archive.js?v=34'])assert.ok(gearHTML.includes(marker),'Equipment page missing V4 '+marker);
const anchors=JSON.parse(read('assets/js/chapter-cg-scenes.js').match(/const ANCHORS=Object.freeze\((\{[\s\S]*?\})\);/)[1]);
assert.equal(Object.keys(anchors).length,19,'Do not change V3 prose anchors');
for(const key of Object.keys(anchors)){
 const [v,c]=key.split('/'),path='chapters/volume-'+v+'/chapter-'+c+'.html',html=read(path);
 assert.ok(html.includes('chapter-cg-scenes.js?v=3')&&html.includes('chapter-cg-scenes.css?v=2'),'Chapter asset cache-bust missing '+path);
}
console.log('[CG V4+] PASS: 19 stable prose anchors, fold/unfold in chapter, independent unlocked-only gallery and gear filters, 24 original visuals, intact reader progress.');
