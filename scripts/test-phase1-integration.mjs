#!/usr/bin/env node
/* Site release: old and new archives must use one published reader dataset without writing progress. */
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {runInNewContext,Script} from 'node:vm';
const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const read=p=>readFileSync(join(root,p),'utf8');
const ctx={window:{}};runInNewContext(read('assets/js/reader-codex-data.js'),ctx);
const values=Array.isArray(ctx.window.ZSReaderCodex)?ctx.window.ZSReaderCodex:[];
const legacy=new Set(['人物','职业','地图','势力','世界','事件']);
const categories=new Set([...values.map(x=>x.k),...legacy]);
let checked=0;
for(const file of readdirSync(join(root,'archive')).filter(x=>x.endsWith('.html'))){
 const s=read('archive/'+file);
 if(!s.includes('data-public-archive='))continue;
 checked++;
 const p=s.indexOf('progressive-archive.js'),d=s.indexOf('reader-codex-data.js'),r=s.indexOf('public-archive.js');
 assert.ok(p>=0&&d>p&&r>d,'Must load published data before archive renderer: '+file);
 const scope=(s.match(/data-scope="([^"]*)"/)||[])[1]||'';
 for(const cat of scope.split(',').filter(Boolean))assert.ok(categories.has(cat),'Unknown public archive scope: '+file+'/'+cat);
 assert.ok(s.includes('codex.html')||file==='codex.html','Old public archive must link to encyclopedia: '+file);
}
assert.ok(checked>=16,'Expected all old and new reader archive pages to be integrated');
const bestiary=read('assets/js/bestiary.js');
assert.ok(bestiary.includes('p2volnames')&&bestiary.includes('p3volnames'),'All three parts need correct beast-volume titles');
assert.ok(!bestiary.includes('继续阅读第一篇，在对应剧情'),'Locked beasts must not point to wrong part');
const progressive=read('assets/js/progressive-archive.js');
assert.ok(progressive.includes('get(2).max>=100&&get(3).max>=100'),'Legacy sensitive archives must require all published parts');
for(const p of ['assets/js/audio-player.js','assets/js/public-archive.js','assets/js/bestiary.js','assets/js/progressive-archive.js'])assert.doesNotThrow(()=>new Script(read(p),{filename:p}));
const audio=read('assets/js/audio-player.js'),sw=read('sw.js');
assert.ok(audio.includes('.zs-audio.zs-audio-expanded')&&audio.includes('body.zs-has-audio footer'),'Audio must dock compactly and preserve bottom reading space');
assert.ok(sw.includes('audio-player.js?v=11')&&sw.includes('progressive-archive.js?v=32'),'SW must bust caches for updated scripts');
assert.ok(!read('assets/js/public-archive.js').includes('localStorage.setItem'),'Public archive must be progress read-only');
console.log('[PHASE 1] PASS: '+checked+' public archives, three-part sensitive gate, bestiary titles, compact audio and versioned resources.');
