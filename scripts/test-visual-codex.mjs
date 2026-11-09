#!/usr/bin/env node
/* 视觉图鉴共20张：前六张保留，新增十四幅CG须有准确章节、二进制哈希与各篇进度门禁。 */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
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
const added=[
 ['林烈·重剑（CG演绎）','武器',1,88,'weapon-lin-lie-greatsword.webp','818de5ba5f04684cc36a94b2f9f1486ba280b79f'],
 ['北境防寒斗篷（CG演绎）','装备',2,51,'equipment-northern-cloak.webp','2a27be60d616216b5b7d8549c0c66dca58f27fa5'],
 ['赤纹矿','材料',1,44,'material-red-vein-ore.webp','758e0783a28b3a6fd9bb15a7fad7b5c9c175f2ff'],
 ['双记录探查器','道具',3,28,'item-dual-recording-detector.webp','28cad1c4883cab158918778ee908f39fc70e121f'],
 ['旧炉控制片','道具',3,65,'item-forge-control-plate.webp','9b32102ba88a4a6cd5f3bdf1693ca315eee263fa'],
 ['旧炉设施钥匙 · 视觉演绎','道具',3,65,'item-forge-access-key-impression.webp','4fc3a49d48ac0d5475c53ac127cff355e505e82a'],
 ['风喉兽','魔物',1,88,'monster-wind-throat-beast.webp','cafd4d8903713f8fa1d29d08477795976e17c08c'],
 ['裂鳍兽','魔物',3,43,'monster-rift-fin-beast.webp','b47630c087993ccce2883d9c910d277ff1235c68'],
 ['岩甲兽','魔物',3,55,'monster-rock-armor-beast.webp','8c7b75f1f4117e08ab2296570ec1d28d3099a3ab'],
 ['熔背龙蜥','魔物',3,67,'monster-molten-back-drake.webp','837b11442ebaba8f39cb5d8a9d1366b3eb8a30fb'],
 ["矿盐粉末（CG演绎）","材料",3,55,"material-mineral-salt-powder.webp","ca828b11131c5034f9a9d7e3185d1045b9bc324d"],
 ["常用医疗药剂（CG演绎）","道具",2,31,"item-ordinary-medical-supplies.webp","d96c52d307d5504e9ba4be08cdddad7845633159"],
 ["大型裂鳍兽个体（CG演绎）","魔物",3,43,"monster-large-rift-fin-beast.webp","9da40996a6b8d17339e39eb94257ed5aa94ad0c8"],
 ["裂鳍兽群追船（CG演绎）","魔物",3,42,"monster-rift-fin-swarm-voyage.webp","6aa6bf203840a25c81129de33207ae79683344c3"]
];
assert.equal(a.length,expected.length+added.length,'Exactly six original and fourteen source-verified CG cards');
const all=[...expected,...added.map(([name,,p,n,file])=>[name,p,n,file])];
const blobSha=bytes=>createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
for(const [name,kind,p,n,file,sha] of added){
 const item=a.find(x=>x.name===name);
 assert.ok(item&&item.kind===kind&&item.cg===true,'New card metadata missing for '+name);
 assert.equal(item.p,p,'Wrong separate part '+name);
 assert.equal(item.n,n,'Wrong chapter unlock '+name);
 assert.ok(item.summary.includes('CG')||item.summary.includes('演绎')||item.summary.includes('美术'),'Do not present invented CGI shapes as canon: '+name);
 const bytes=readFileSync(join(ROOT,'assets/images/codex',file));
 assert.equal(bytes.subarray(0,4).toString(),'RIFF','Invalid WebP header '+file);
 assert.equal(bytes.subarray(8,12).toString(),'WEBP','Invalid WebP format '+file);
 assert.ok(bytes.length>50000&&bytes.length<400000,'Unexpected compressed CG file size '+file);
 assert.equal(blobSha(bytes),sha,'Exact artwork digest mismatch '+file);
}
assert.ok(a.find(x=>x.name==='旧炉设施钥匙 · 视觉演绎').summary.includes('并非新增一件实体钥匙'),'Must not invent a separate key item');
assert.ok(!a.some(x=>/裂鳍兽首领|白烛恢复药剂/.test(x.name)),'Do not invent unconfirmed boss rank or named medicine');
const names=new Set(),files=new Set();
for(const [name,p,n,file] of all){
 const x=a.find(v=>v.name===name);
 assert.ok(x,'Visual missing: '+name);
 assert.equal(x.p,p);assert.equal(x.n,n);assert.equal(x.file,file);
 assert.ok(!names.has(name)&&!files.has(file));names.add(name);files.add(file);
 assert.ok(existsSync(join(ROOT,x.source)), 'Every image needs a verified published chapter: '+name);
 assert.ok(x.file.endsWith('.webp')&&!x.file.includes('..'));
 assert.ok(['人物','魔物','装备','武器','道具','材料'].includes(x.kind));
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
 ['archive/items.html','public-archive.js'],
 ['archive/materials.html','public-archive.js'],
 ['archive/bestiary.html','bestiary.js'],
 ...['gu-changyuan','su-zili','lin-lie','luo-jin','ling-tianyao','dai-xuanyue','gu-yanche'].map(x=>['archive/characters/'+x+'.html','profile-v2.js'])
]){
 const h=read(page),manifest=h.indexOf('visual-codex-data.js'),renderer=h.indexOf(script);
 assert.ok(manifest>0&&renderer>manifest,page+' must load visual manifest before renderer');
}
assert.ok(read('archive/visual-codex.html').includes('data-public-archive="visual"'),'New gallery must bypass old all-parts global wall and use its own gates');
assert.ok(existsSync(join(ROOT,'assets/images/codex/.gitkeep')),'Author image upload directory must exist');
assert.ok(read('index.html').includes('archive/visual-codex.html'),'Home page needs a visual gallery entry');
assert.ok(read('archive/visual-codex.html').includes('<option value="道具">道具</option>')&&read('archive/visual-codex.html').includes('<option value="材料">材料</option>'),'Missing new item/material category filters');
assert.ok(read('archive/items.html').includes('visual-codex-data.js?v=3'),'Item text archive must load visual card data');
assert.ok(read('archive/materials.html').includes('visual-codex-data.js?v=3'),'Material text archive must load visual card data');
assert.ok(read('archive/visual-codex.html').includes('visual-codex-data.js?v=3'),'New artwork manifest version must be used');
const installed=a.filter(x=>existsSync(join(ROOT,'assets/images/codex',x.file))).length;
console.log('[VISUAL CODEX] PASS: 6 original cards + 14 source-verified cinematic CGs, correct chapter gates, hashes, protected reader progress, monster/equipment/item integration. Image binaries: '+installed+'/20.');
