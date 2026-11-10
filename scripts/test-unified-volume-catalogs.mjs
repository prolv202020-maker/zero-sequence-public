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
  ['assets/js/volume-page.js',n>=33?'v=14':n>=31?'v=13':n>=30?'v=12':'v=11'],['assets/js/progressive-archive.js',n>=33?'v=26':n>=31?'v=25':n>=30?'v=23':'v=22']
 ]){
   const basename=asset.replace(/^assets\//,'');
   assert.ok(html.includes('../assets/'+basename+'?'+expected),path+' missing current '+asset+'?'+expected);
 }
 assert.equal((html.match(/volume-page\.js\?v=(?:11|12|13|14)/g)||[]).length,1,'No duplicate volume renderer '+path);
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
console.log('[UNIFIED VOLUME CATALOGS] PASS: '+verified+' uniform directories, '+(latest*10)+' linked chapters + prologue, unchanged reading keys and spoiler boundaries.');
