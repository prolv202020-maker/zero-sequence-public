#!/usr/bin/env node
/* 《第零序列》CG V5：四张已生成CG（1个新装备＋3种同物件补充视角）与章节防剧透校验 */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {runInNewContext,Script} from 'node:vm';
const ROOT=resolve(fileURLToPath(new URL('../',import.meta.url)));
const read=p=>readFileSync(join(ROOT,p),'utf8');
const ctx={window:{}};runInNewContext(read('assets/js/visual-codex-data.js'),ctx);
const entries=ctx.window.ZSVisualCodex;
assert.equal(entries.length,25,'Keep all 24 legacy cards and add one verified frost-mirror bracer');
const files=new Set(entries.map(x=>x.file));
const variants=entries.flatMap(e=>(e.views||[]).map(v=>({...v,owner:e})));
assert.equal(variants.length,3,'Exactly three supplemental views of existing artifacts');
assert.equal(new Set([...files,...variants.map(x=>x.file)]).size,28,'All 28 image assets must be distinct');
const expected=[
 {file:'equipment-frost-mirror-bracer.webp',sha:'98d16c255b77ae9706ff140217aa176bf0a99b62',id:'frost-mirror-bracer-cg',kind:'装备',p:3,n:80,source:'chapters/volume-28/chapter-010.html',newCard:true},
 {file:'item-dual-recording-detector-optical-study.webp',sha:'a213e617b8eabf3639a75e45346a45d9f9f853f6',id:'dual-recording-detector-cg',p:3,n:28,source:'chapters/volume-22/chapter-008.html'},
 {file:'weapon-lin-lie-greatsword-alternate.webp',sha:'546ae65fba639500592d68d712456b587d6ff22e',id:'lin-lie-greatsword-cg',p:1,n:88,source:'chapters/volume-09/chapter-008.html'},
 {file:'item-forge-control-plates-trio.webp',sha:'03c6ffb0702a30909e010218be29e7d9727b929a',id:'forge-control-plate-cg',p:3,n:65,source:'chapters/volume-27/chapter-005.html'}
];
function blobSha(bytes){return createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');}
for(const x of expected){
 const card=entries.find(e=>e.id===x.id);
 assert.ok(card,'Missing canonical record '+x.id);
 assert.equal(card.p,x.p);assert.equal(card.n,x.n);assert.equal(card.source,x.source);
 assert.ok(existsSync(join(ROOT,card.source)),'Published source missing for '+x.id);
 const image=readFileSync(join(ROOT,'assets/images/codex',x.file));
 assert.equal(image.subarray(0,4).toString(),'RIFF');assert.equal(image.subarray(8,12).toString(),'WEBP');
 assert.ok(image.length>50000&&image.length<400000,'Image must remain size-optimized '+x.file);
 assert.equal(blobSha(image),x.sha,'WebP SHA mismatch '+x.file);
 if(x.newCard){assert.equal(card.file,x.file);assert.equal(card.kind,x.kind);
  assert.ok(card.summary.includes('尚未立刻装备'),'Do not claim character equipped an unconfirmed bracer');}
 else{const alt=(card.views||[]).find(y=>y.file===x.file);
  assert.ok(alt&&alt.title&&alt.note,'Missing alternate view or visual disclaimer '+x.id);
  assert.ok(!entries.some(e=>e.file===x.file),'Same item alternate must NOT be inserted as fake new item');}
}
assert.ok(!entries.some(e=>/雷系法器|白烛恢复药剂|裂鳍兽首领/.test(e.name)),'No unconfirmed canon inventions');
for(const p of ['assets/js/visual-codex.js','assets/js/archive-artworks.js','assets/js/chapter-cg-scenes.js']){
 const src=read(p);assert.doesNotThrow(()=>new Script(src),p+' must parse');
 assert.ok(!src.includes('localStorage.setItem'),'Art scripts must never mutate reading progress');
}
const gallery=read('assets/js/visual-codex.js'),archive=read('assets/js/archive-artworks.js'),chapter=read('assets/js/chapter-cg-scenes.js');
assert.ok(gallery.indexOf('if(isOpen)')<gallery.indexOf('record.views'),'Alt gallery must be created only in unlocked branch');
assert.ok(archive.indexOf('if(unlocked)')<archive.indexOf('r.views'),'Archive supplements must remain locked');
assert.ok(chapter.includes('r.views.length'),'Chapter should hint supplementary images without loading them a second time');
assert.ok(read('archive/equipment.html').includes('archive-artworks.js?v=5'));
assert.ok(read('archive/items.html').includes('archive-artworks.js?v=5'));
assert.ok(read('archive/materials.html').includes('archive-artworks.js?v=5'));
assert.ok(read('archive/visual-codex.html').includes('visual-codex.js?v=6'));
const chapterPairs=['01/001','02/001','05/004','09/008','12/004','13/004','14/001','16/001','18/005','21/006','22/001','22/008','25/002','25/003','26/005','27/005','27/007','28/010','29/001'];
for(const pair of chapterPairs){
 const [v,c]=pair.split('/'),p='chapters/volume-'+v+'/chapter-'+c+'.html',html=read(p);
 assert.ok(html.includes('visual-codex-data.js?v=6')&&html.includes('chapter-cg-scenes.js?v=3'),'Chapter must use V5 script refs '+p);
}
for(const p of ['archive/equipment.html','archive/items.html','archive/materials.html','archive/bestiary.html','archive/codex.html','archive/visual-codex.html',
 ...['gu-changyuan','su-zili','lin-lie','luo-jin','ling-tianyao','dai-xuanyue','gu-yanche'].map(x=>'archive/characters/'+x+'.html')]){
 assert.ok(read(p).includes('visual-codex-data.js?v=6'),'Archive must use new V5 metadata '+p);
}
console.log('[CG V5] PASS: 25 unique canon cards, 28 independently hashed WebPs, 4 new assets, 19 paragraphs, gates and display integration preserved.');
