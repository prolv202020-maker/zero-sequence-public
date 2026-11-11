#!/usr/bin/env node
/* All thirty volume chapter catalogs must match the original Part I reader design. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Script} from 'node:vm';
const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const read=path=>readFileSync(join(root,path),'utf8');
const script=read('assets/js/volume-page.js');
assert.doesNotThrow(()=>new Script(script,{filename:'volume-page.js'}),'Shared volume script must parse');
assert.match(script,/zs-volume-chapters/,'All volumes must receive uniform chapter layout');
assert.match(script,/zs-chapter-index/,'Chapter serial numbers must have their own line');
assert.match(script,/zs-chapter-state/,'Reading status badge must exist');
assert.match(script,/zs:part-progress:v1/,'Preserve original per-part reading progress');
assert.match(script,/zs:reader:last:v1/,'Preserve original last-read chapter key');
assert.ok(!script.includes('localStorage.setItem'),'Volume catalog must never overwrite progress');
assert.ok(script.includes('全书第\\s*\\d+'),'Remove duplicate global-number suffix in chapter titles');
assert.match(script,/const han=\['','一','二'/,'Display uniform Chinese local chapter names');
const style=read('assets/css/volume-page.css');
assert.match(style,/\.zs-volume-page \.list\.zs-volume-chapters/,'Volume catalog needs common visual system');
assert.match(style,/@media\(max-width:650px\)/,'Mobile reading chapter layout must work');
assert.match(style,/zs-chapter-current/,'Highlight the last read chapter without revealing spoilers');
const volumes=readdirSync(join(root,'volumes')).filter(f=>/^volume-\d{2}\.html$/.test(f))
 .map(f=>Number(f.match(/\d{2}/)[0])).sort((a,b)=>a-b);
assert.ok(volumes.length>=30,'Do not accidentally remove a published volume');
assert.deepEqual(volumes,Array.from({length:volumes.at(-1)},(_,i)=>i+1),'Published volume catalogs must be contiguous');
const latest=volumes.at(-1);
assert.ok(script.includes('vol>'+latest),'Shared catalog script must include latest published volume');
assert.ok(script.includes('vol<'+latest),'Shared catalog pager must link through latest published volume');
let verified=0;
for(const n of volumes){
 const id=String(n).padStart(2,'0');
 const path='volumes/volume-'+id+'.html',html=read(path);
 assert.match(html,/<main class="page">/,'Volume needs main page: '+path);
 assert.match(html,/<h1\b/,'Volume heading missing: '+path);
 assert.match(html,/<p class="eyebrow"/,'Volume eyebrow missing: '+path);
 assert.match(html,/<p class="lead"/,'Volume description missing: '+path);
 assert.match(html,/<div class="list">/,'Volume chapter list missing: '+path);
 for(const [asset,expected] of [
  ['assets/css/style.css','v=6'],['assets/css/volume-page.css','v=3'],
  ['assets/js/volume-page.js',n>=40?'v=21':n>=39?'v=20':n>=38?'v=19':n>=37?'v=18':n>=36?'v=17':n>=35?'v=16':n>=34?'v=15':n>=33?'v=14':n>=31?'v=13':n>=30?'v=12':'v=11'],['assets/js/progressive-archive.js',n>=40?'v=33':n>=39?'v=32':n>=38?'v=31':n>=37?'v=30':n>=36?'v=29':n>=35?'v=28':n>=34?'v=27':n>=33?'v=26':n>=31?'v=25':n>=30?'v=23':'v=22']
 ]){
   const basename=asset.replace(/^assets\//,'');
   assert.ok(html.includes('../assets/'+basename+'?'+expected),path+' missing current '+asset+'?'+expected);
 }
 assert.equal((html.match(/volume-page\.js\?v=(?:11|12|13|14|15|16|17|18|19|20|21)/g)||[]).length,1,'No duplicate volume renderer '+path);
 const listHtml=html.match(/<div class="list">([\s\S]*?)<\/div>/)?.[1]||'';
 const chapterLinks=[...listHtml.matchAll(/href="\.\.\/chapters\/volume-(\d{2})\/chapter-(\d{3})\.html"/g)];
 const expectedChapters=10;
 assert.equal(chapterLinks.length,expectedChapters,path+' must link only currently published chapters');
 for(let i=1;i<=expectedChapters;i++){
  const suffix=String(i).padStart(3,'0'),rel='chapters/volume-'+id+'/chapter-'+suffix+'.html';
  assert.ok(chapterLinks.some(m=>m[1]===id&&m[2]===suffix),'Chapter index mismatch: '+rel);
  assert.ok(existsSync(join(root,rel)),'Missing published text '+rel);
 }
 if(n===1){
  assert.ok(html.includes('../chapters/volume-01/prologue.html'),'Volume 1 must keep the prologue');
 }
 if(n===21){
  assert.ok(!html.includes('zs-v21-list'),'Volume 21 must not keep its obsolete catalog class');
  assert.ok(!html.includes('zs-v21-art'),'Volume 21 must not duplicate its cover hero');
 }
 if(n===22)assert.ok(!html.includes('<h2 style="color:#f0d89f">远域双钟</h2>'),'Volume 22 must not duplicate its hero');
 verified++;
}
// All four parts use Part I's shared portrait grid, progress key and card renderer.
const catalog=read('assets/js/volume-catalog.js');
assert.doesNotThrow(()=>new Script(catalog,{filename:'volume-catalog.js'}),'Shared part catalog script must parse');
assert.ok(catalog.includes(':scope > div[role="img"]'),'Fourth-part text-art covers must occupy the common portrait slot');
assert.ok(catalog.includes('Math.min(max,100)'),'All parts must use the full 100-chapter counter');
assert.ok(!catalog.includes('part===4?30:100'),'Fourth-part 30-chapter limit must be eliminated');
assert.ok(!catalog.includes('localStorage.setItem'),'Directory must not overwrite saved reading progress');
const coverCSS=read('assets/css/volume-directory.css');
assert.ok(coverCSS.includes('grid-template-columns:repeat(5,minmax(0,1fr))'),'Desktop grid must match Part I');
assert.ok(coverCSS.includes('@media(max-width:600px)'),'Mobile grid must remain responsive');
assert.ok(coverCSS.includes('zs-cover-media>.zs-volume-cover'),'Fourth-part art must fill the same portrait frame');
for(let part=1;part<=4;part++){
 const html=read('parts/part-0'+part+'.html');
 assert.ok(html.includes('class="grid zs-cover-grid"'),'Part '+part+' must use the shared grid');
 assert.ok(html.includes('volume-catalog.js?v=6'),'Part '+part+' must use the shared catalog script');
 assert.ok(html.includes('volume-directory.css?v=4'),'Part '+part+' must use the shared directory CSS');
 const cards=html.split('class="card zs-cover-card').length-1;
 assert.equal(cards,10,'Part '+part+' must have exactly 10 cards');
}
const fourth=read('parts/part-04.html');
assert.equal((fourth.match(/role="img"/g)||[]).length,10,'Fourth-part art needs 10 functioning media elements');
assert.ok(fourth.includes('第四篇完整完结'),'Fourth-part published status must remain complete');

console.log('[UNIFIED VOLUME CATALOGS] PASS: '+verified+' uniform directories, '+(latest*10)+' linked chapters + prologue, unchanged reading keys and spoiler boundaries.');
