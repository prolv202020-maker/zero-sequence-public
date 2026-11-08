#!/usr/bin/env node
/* Third-arc illustration gallery regression suite; reads only published files, no paid generation. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync,statSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Script} from 'node:vm';
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
assert.ok(gallery.includes('zero-sequence-cover.webp'),'Public hero must be spoiler-neutral');
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
for(let v=21;v<=30;v++){
 const cover='assets/images/covers/volume-'+String(v).padStart(2,'0')+'.webp';
 assert.ok(existsSync(file(cover)),'Missing official third volume cover '+cover);
 const binary=readFileSync(file(cover));assert.equal(binary.subarray(0,4).toString(),'RIFF');assert.equal(binary.subarray(8,12).toString(),'WEBP');
}
assert.ok(!gallery.includes('80级'),'Do not leak author-only merge trigger in gallery');
console.log('[PART III ART] PASS: six original illustrations, ten official covers, independent p03-only unlocks, mobile grid, homepage/nav/part links.');
