#!/usr/bin/env node
/* 可持续发布：只有读过对应章节才会请求新插画，6 张视觉档案皆有正文来源。 */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {runInNewContext,Script} from 'node:vm';
const ROOT=resolve(fileURLToPath(new URL('../',import.meta.url)));
const read=p=>readFileSync(join(ROOT,p),'utf8');
const context={window:{}};
runInNewContext(read('assets/js/visual-codex-data.js'),context);
const a=context.window.ZSVisualCodex;
const expected=[
['顾长渊',1,11,'character-gu-changyuan.webp'],
['苏紫璃',1,11,'character-su-zili.webp'],
['岩牙兽',2,14,'monster-yan-ya-shou.webp'],
['灰刺兽',3,6,'monster-hui-ci-shou.webp'],
['嵌晶展示重剑',2,24,'weapon-inlaid-display-greatsword.webp'],
['普通守卫盾牌',2,75,'equipment-guard-shield.webp']
];
assert.equal(a.length,expected.length);
const names=new Set(),files=new Set();
for(const [name,p,n,file] of expected){
 const x=a.find(v=>v.name===name);
 assert.ok(x,'Visual missing: '+name);
 assert.equal(x.p,p);assert.equal(x.n,n);assert.equal(x.file,file);
 assert.ok(!names.has(name)&&!files.has(file));names.add(name);files.add(file);
 assert.ok(existsSync(join(ROOT,x.source)), 'Every image needs a verified published chapter: '+name);
 assert.ok(x.file.endsWith('.webp')&&!x.file.includes('..'));
 assert.ok(x.kind==='人物'||x.kind==='魔物'||x.kind==='装备'||x.kind==='武器');
}
for(const file of ['assets/js/visual-codex.js','assets/js/public-archive.js','assets/js/bestiary.js','assets/js/profile-v2.js','assets/js/visual-codex-data.js']){
 assert.doesNotThrow(()=>new Script(read(file),{filename:file}),file+' JavaScript parse error');
 assert.ok(!read(file).includes('localStorage.setItem'),file+' must never alter reader progress');
}
const gallery=read('assets/js/visual-codex.js');
assert.ok(gallery.includes('if(unlocked)')&&gallery.includes('makeImage(record)'),'Gallery must not insert unrevealed art');
assert.ok(gallery.includes("picture.addEventListener(\"error\""),'Missing images need safe fallback');
assert.ok(read('assets/js/profile-v2.js').includes('x>=visual.n'),'Profile art must not reveal future relations');
assert.ok(read('assets/js/bestiary.js').includes('progress(visual.p)>=visual.n'),'Monster art must use correct part progress');
assert.ok(read('assets/js/public-archive.js').includes('p[art.p]>=art.n'),'Equipment art must check source gate');
for(const [page,script] of [
 ['archive/visual-codex.html','visual-codex.js'],
 ['archive/equipment.html','public-archive.js'],
 ['archive/codex.html','public-archive.js'],
 ['archive/bestiary.html','bestiary.js'],
 ...['gu-changyuan','su-zili','lin-lie','luo-jin','ling-tianyao','dai-xuanyue','gu-yanche'].map(x=>['archive/characters/'+x+'.html','profile-v2.js'])
]){
 const h=read(page),manifest=h.indexOf('visual-codex-data.js'),renderer=h.indexOf(script);
 assert.ok(manifest>0&&renderer>manifest,page+' must load visual manifest before renderer');
}
assert.ok(read('archive/visual-codex.html').includes('data-public-archive="visual"'),'New gallery must bypass old all-parts global wall and use its own gates');
assert.ok(existsSync(join(ROOT,'assets/images/codex/.gitkeep')),'Author image upload directory must exist');
assert.ok(read('index.html').includes('archive/visual-codex.html'),'Home page needs a visual gallery entry');
const installed=a.filter(x=>existsSync(join(ROOT,'assets/images/codex',x.file))).length;
console.log('[VISUAL CODEX] PASS: 6 staged entries, 3 independently gated parts, 7 character pages, monster & equipment integration. Image binaries uploaded: '+installed+'/6.');
