#!/usr/bin/env node
/* 第四篇插画V1：不改变正文、身份立绘或阅读进度。 */
import assert from 'node:assert/strict';
import {existsSync, readFileSync, statSync} from 'node:fs';
import {Script} from 'node:vm';
const read=p=>readFileSync(p,'utf8');
const script=read('assets/js/part04-illustrations.js');
assert.doesNotThrow(()=>new Script(script,{filename:'part04-illustrations.js'}));
assert.ok(!script.includes('localStorage.setItem'),'Artwork must never write reading progress');
assert.match(script,/d\.p04\?\.max/,'Only fourth-part progress may unlock artworks');
assert.match(script,/matches\.length===1/,'Never insert art on ambiguous paragraph anchors');
const cases=[
 ['31','008','part04-snowline-watercolor.webp','黑槲的第一波冲锋比任何人预想得都快'],
 ['35','009','part04-hundred-flags-ink.webp','钟声响起，燧河城东门首先爆发战斗'],
 ['38','009','part04-border-siege.webp','战鼓响起，斩契团先从正面冲来']
];
for(const [v,c,file,anchor] of cases){
 const src=read('chapters/volume-'+v+'/chapter-'+c+'.html');
 assert.ok(src.includes('part04-illustrations.css?v=1')&&src.includes('part04-illustrations.js?v=1'),'Chapter integration missing '+v+'/'+c);
 assert.equal(src.split(anchor).length-1,1,'Exact unique anchor missing '+v+'/'+c);
 assert.ok(script.includes(anchor)&&script.includes(file),'Script mapping missing '+file);
}
for(const file of ['part04-snowline-watercolor.webp','part04-hundred-flags-ink.webp','part04-border-siege.webp','part04-fourth-arc-poster.webp']){
 const path='assets/images/illustrations/'+file;
 assert.ok(existsSync(path),'Missing fourth-part art '+path);
 const bin=readFileSync(path);
 assert.equal(bin.toString('ascii',0,4),'RIFF','Not WebP '+file);
 assert.equal(bin.toString('ascii',8,12),'WEBP','Not WebP '+file);
 assert.ok(statSync(path).size<500000,'Oversized art '+file);
}
const gallery=read('parts/illustrations-04.html'),part=read('parts/part-04.html');
assert.ok(gallery.includes('zs-p4-gallery')&&gallery.includes('part04-illustrations.js?v=1'));
assert.ok(part.includes('href="illustrations-04.html"'));
assert.ok(existsSync('assets/images/characters/gu-changyuan-approved.webp'),'Approved portrait must remain in place');
console.log('[PART04 ART] PASS: 4 verified WebP, 3 exact chapter anchors, progress gate and gallery link.');
