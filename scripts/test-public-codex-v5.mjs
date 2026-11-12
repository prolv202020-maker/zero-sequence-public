#!/usr/bin/env node
/* 《第零序列》V5：只验证公开正文章节、读者资料出处和防剧透链接。
 * 不修改文章、官方立绘、有声、BGM 或保存的阅读进度。 */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {runInNewContext,Script} from 'node:vm';
const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const path=p=>join(root,p),read=p=>readFileSync(path(p),'utf8');
const ctx={window:{}};runInNewContext(read('assets/js/reader-codex-data.js'),ctx);
const index=ctx.window.ZSReaderCodex;
assert.equal(index.length,232,'V5 encyclopedia must contain precisely 180 existing and 52 sourced additions');
assert.equal(index.filter(x=>x.p===4).length,71,'Fourth arc must include 30 previous + 41 new source records');
const seen=new Set();let sourceProofs=0;const kinds=new Set();
for(const item of index){
 assert.ok(Number.isInteger(item.p)&&item.p>=1&&item.p<=4&&Number.isInteger(item.n)&&item.n>=1&&item.n<=100,'Invalid unlock gate '+item.t);
 const key=[item.p,item.n,item.k,item.t].join('|');
 assert.ok(!seen.has(key),'Duplicate reader archive record '+key);seen.add(key);kinds.add(item.k);
 const volume=(item.p-1)*10+Math.ceil(item.n/10),chapter=(item.n-1)%10+1;
 const page='chapters/volume-'+String(volume).padStart(2,'0')+'/chapter-'+String(chapter).padStart(3,'0')+'.html';
 assert.ok(existsSync(path(page)),'Missing cited chapter '+page);
 if(item.proof){
   assert.ok(typeof item.proof==='string'&&item.proof.length>=2,'Invalid proof '+item.t);
   assert.ok(read(page).includes(item.proof),'Evidence not present in cited chapter: '+item.t+' at '+page+' ('+item.proof+')');
   sourceProofs++;
 }
}
assert.ok(sourceProofs>=82,'All 30 V4 and 52 V5 records require independently checkable proof');
for(const k of ['人物','武器','装备','道具','材料','魔物','构装体','势力','技能','地图'])assert.ok(kinds.has(k),'Missing public category '+k);
const beasts=JSON.parse(read('assets/data/bestiary.json')).entries;
assert.equal(beasts.length,37,'Keep 34 previous and three new source-based species/constructs');
for(const [name,part,first,vol,ch,proof] of [
 ['岩甲兽',3,55,26,5,'岩甲兽'],
 ['岩脊双首兽',4,20,32,10,'岩脊双首兽'],
 ['尖角铁兽',4,91,40,1,'尖角铁兽']
]){
 const e=beasts.find(x=>x.name===name);
 assert.ok(e&&e.p===part&&e.first===first&&e.vol===vol&&e.ch===ch,'Wrong species chapter gate '+name);
 assert.ok(read('chapters/volume-'+String(vol).padStart(2,'0')+'/chapter-'+String(ch).padStart(3,'0')+'.html').includes(proof),'Species source absent '+name);
 assert.ok(Array.isArray(e.sources)&&e.sources.some(x=>x.at===first&&x.vol===vol&&x.ch===ch),'Missing explicit species citation '+name);
 assert.ok(!e.level?.some(x=>/确定|100|级别/.test(x.text)),'Never invent a fixed monster level '+name);
}
const legacy=['city-economy','drops','ecology','economy','industry','laws','orders','production','recipes','rules-supplement'];
for(const name of legacy){
 const html=read('archive/'+name+'.html');
 assert.ok(html.includes('reader-codex-data.js?v=3'),'Legacy page not reading new source data: '+name);
 assert.ok(html.includes('public-archive.js?v=5'),'Legacy page not using four-part unlocks: '+name);
 assert.ok(html.includes('parts/part-04.html'),'Legacy page missing Fourth Part link: '+name);
}
const modern=['codex','characters','classes','equipment','items','materials','world','factions','special-classes','visual-codex','unlocks'];
for(const name of modern)assert.ok(read('archive/'+name+'.html').includes('reader-codex-data.js?v=3'),'Modern page missing current source index: '+name);
assert.ok(read('parts/final-archive.html').includes('reader-codex-data.js?v=3'),'Final archive must merge 4 arcs');
for(const name of ['codex','equipment','items','materials','bestiary','visual-codex'])
 assert.ok(read('archive/'+name+'.html').includes('visual-codex-data.js?v=7'),'Reader visual index should receive alias refresh: '+name);
assert.ok(read('archive/bestiary.html').includes('bestiary.js?v=6'),'Monster page needs current archive renderer');
assert.ok(read('assets/js/bestiary.js').includes('bestiary.json?v=3'),'Monster JSON cache version is stale');
const visual=read('assets/js/visual-codex-data.js');
for(const alias of ['林烈惯用重剑','北境厚斗篷','矿盐粉末','顾长渊普通长剑','戴玄岳盾面护板','寒镜护腕'])assert.ok(visual.includes(alias),'Missing explicitly verified visual alias '+alias);
for(const filename of ['assets/js/public-archive.js','assets/js/atlas-v2.js','assets/js/visual-codex.js','assets/js/bestiary.js','assets/js/progressive-archive.js']){
 const src=read(filename);assert.doesNotThrow(()=>new Script(src,{filename}));
 if(filename!=='assets/js/progressive-archive.js')assert.ok(!src.includes('localStorage.setItem'),'Read-only atlas must not edit progress: '+filename);
}
assert.ok(read('assets/js/public-archive.js').includes('[1,2,3,4]'),'Generic archive must use four independently gated parts');
assert.ok(read('archive/world.html').includes('data-scope="地图,地点,世界"'),'World atlas must include published locations');
assert.ok(read('archive/drops.html').includes('并不等于已验证具体掉落关系'),'Drop index must not invent material yield');
assert.ok(read('archive/recipes.html').includes('不是已确定配方清单'),'Recipe index must distinguish clues from true formulas');
console.log('[PUBLIC CODEX V5] PASS: 232 reader entries / '+sourceProofs+' cited evidence strings / 37 species or constructs / four independent unlocks / 10 restored legacy pages / explicit official CG links.');
