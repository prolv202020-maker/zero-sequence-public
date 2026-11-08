#!/usr/bin/env node
/* Third-arc illustration gallery regression suite; reads only published files, no paid generation. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync,statSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Script} from 'node:vm';
import {createHash} from 'node:crypto';
const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const file=p=>join(root,p),read=p=>readFileSync(file(p),'utf8');
const gallery=read('parts/illustrations-03.html'),third=read('parts/part-03.html');
const home=read('index.html'),nav=read('assets/js/site-ui.js');
assert.match(gallery,/<title>第三篇插画画廊 · 第零序列<\/title>/);
assert.ok(third.includes('href="illustrations-03.html"'),'Third part must link to dedicated art gallery');
assert.ok(home.includes('href="parts/illustrations-03.html"'),'Homepage must link to third-part gallery');
assert.ok(nav.includes("['第三篇 · 临界回声画廊','parts/illustrations-03.html']"),'Global mobile menu must expose third gallery');
for(const id of ['art-list','cover-list','art-count'])assert.ok(gallery.includes('id="'+id+'"'),'Missing third gallery host '+id);
const scripts=[...gallery.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).filter(Boolean);
assert.equal(scripts.length,1,'Third gallery should have one inline renderer');
assert.doesNotThrow(()=>new Script(scripts[0],{filename:'gallery-third.js'}),'Third gallery renderer must parse as JavaScript');
assert.match(scripts[0],/localStorage\.getItem\('zs:part-progress:v1'\)/,'Preserve existing per-part progress only');
assert.match(scripts[0],/d\.p03\?\.max/,'Third gallery must never use Part I or Part II progress');
assert.ok(!scripts[0].includes('d.p01')&&!scripts[0].includes('d.p02'),'Third gallery must not share another part unlock state');
assert.match(scripts[0],/if\(unlocked\)\{/,'Scene images should only be created after progress unlock');
assert.match(scripts[0],/frameContent\(frame,ok,file,name\+'概念插画',cover\)/,'Cover images must be progress gated too');
assert.match(scripts[0],/h\.textContent=ok\?name:'未揭晓的画面'/,'Lock card must not reveal unseen image titles');
assert.match(scripts[0],/for\(let v=21;v<=30;v\+\+\)/,'Gallery must enumerate all ten third-part covers');
assert.match(scripts[0],/const need=\(v-21\)\*10\+1/,'Cover unlocks must use third-arc local chapter positions');
assert.match(scripts[0],/art\.filter\(x=>progress>=x\.need\)/,'Count must use third-arc read progress');
assert.ok(gallery.includes('part-03-star-ring-expedition.webp'),'The author-approved Part III key visual must be the gallery hero');
assert.ok(third.includes('part-03-star-ring-expedition.webp'),'Part III title page must show its author-approved cover');
assert.ok(home.includes('part-03-star-ring-expedition.webp'),'Homepage Part III entry must show the correct cover');
assert.ok(scripts[0].includes("length+'/'+art.length+' 张"),'Art counter must include high-fidelity CG additions');
assert.ok(!/<img[^>]+scene-03-/.test(gallery),'Scene art cannot be eagerly loaded outside the unlock script');
const slugs=['echo-ridge','lost-city','storm-voyage','outer-ring','molten-valley','zero-corridor'];
const needs=[1,21,41,51,61,91];
for(let i=0;i<slugs.length;i++){
 const name='scene-03-'+slugs[i]+'.svg',asset='assets/images/illustrations/'+name;
 assert.ok(existsSync(file(asset)),'Missing third-arc visual '+name);
 assert.ok(statSync(file(asset)).size>4000&&statSync(file(asset)).size<120000,'Unexpectedly small or heavy visual '+name);
 const image=read(asset);
 assert.ok(image.startsWith('<?xml version="1.0" encoding="UTF-8"?>'),'SVG must use a real XML header '+name);
 assert.match(image,/<svg[^>]*xmlns="http:\/\/www\.w3\.org\/2000\/svg"[^>]*viewBox="0 0 1600 900"/,'Invalid SVG canvas '+name);
 assert.ok(image.includes('<title>')&&image.includes('</svg>'),'SVG alt metadata / closing tag missing '+name);
 assert.ok(!/<script\b|<foreignObject\b|onload=|onerror=|href="https?:/i.test(image),'Untrusted or external SVG content '+name);
 for(const m of image.matchAll(/<([a-zA-Z][\w:-]*)([^<>]*?)\/?>/g)){
   const attrs=[...m[2].matchAll(/(?:^|\s)([a-zA-Z_:][\w:.-]*)\s*=/g)].map(x=>x[1]);
   assert.equal(new Set(attrs).size,attrs.length,'Duplicate SVG XML attributes in '+name);
 }
 assert.ok(scripts[0].includes("file:'"+name+"'"),'Gallery not wired to '+name);
 assert.ok(scripts[0].includes('need:'+needs[i]),'Missing unlock checkpoint for '+name);
}
const gitBlob=buffer=>createHash('sha1').update('blob '+buffer.length+'\\0').update(buffer).digest('hex');
const newCG=[
 {file:'part-03-star-ring-expedition.webp',sha:'a3cd7191caefa71d53b127ff73f44b060f9a2164',kind:'author-approved hero'},
 {file:'part-03-ring-ensemble.webp',sha:'f1260c9521272c2b27ff6e4f6a6ab7d0315c023d',kind:'new character concept CG'},
 {file:'part-03-starlit-oath.webp',sha:'7fee44e87049662dbcb3cb80f569a7338d1e87b1',kind:'new character concept CG'}
];
for(const art of newCG){
 const location='assets/images/illustrations/'+art.file;
 assert.ok(existsSync(file(location)),'Missing Part III new CG: '+art.file);
 const bytes=readFileSync(file(location));
 assert.ok(bytes.length>100000&&bytes.length<1000000,'Unexpected web-optimized CG size: '+art.file);
 assert.equal(bytes.subarray(0,4).toString(),'RIFF','Invalid CG header '+art.file);
 assert.equal(bytes.subarray(8,12).toString(),'WEBP','Invalid CG format '+art.file);
 assert.equal(gitBlob(bytes),art.sha,'Unexpected change to approved image: '+art.file);
}
for(const [name,need] of [['part-03-ring-ensemble.webp',61],['part-03-starlit-oath.webp',91]]){
 assert.ok(scripts[0].includes("file:'"+name+"'"),'CG not registered as reader-gated art: '+name);
 assert.ok(scripts[0].includes('need:'+need),'Incorrect CG unlock chapter '+name);
}
assert.ok(!/<img[^>]+part-03-(?:ring-ensemble|starlit-oath)/.test(gallery),'Do not expose reader-gated CGs in static hero HTML');
for(let v=21;v<=30;v++){
 const cover='assets/images/covers/volume-'+String(v).padStart(2,'0')+'.webp';
 assert.ok(existsSync(file(cover)),'Missing official third volume cover '+cover);
 const binary=readFileSync(file(cover));assert.equal(binary.subarray(0,4).toString(),'RIFF');assert.equal(binary.subarray(8,12).toString(),'WEBP');
}
assert.ok(!gallery.includes('80级'),'Do not leak author-only merge trigger in gallery');
console.log('[PART III ART] PASS: six existing SVGs, two newly-gated cinematic CGs, author-approved Part III hero, ten unchanged official covers, independent p03 unlocks and mobile links.');
