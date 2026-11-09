#!/usr/bin/env node
/* 第零序列 V7 · Audio integrity and migration preflight (read-only; no uploads or URL rewrites). */
import assert from 'node:assert/strict';
import {readFileSync,statSync,openSync,readSync,closeSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const read=path=>readFileSync(join(root,path),'utf8');
const manifest=JSON.parse(read('docs/v7-audio-inventory.json'));
assert.equal(manifest.schema,'zs-audio-audit-v7');
assert.equal(manifest.preserve_original_urls,true);
assert.equal(manifest.files.length,131,'Narrated prologue plus 130 chapters must all be preserved');
const seen=new Set();
let total=0;
for(const [index,file] of manifest.files.entries()){
 assert.ok(!seen.has(file.path),'Duplicate filename '+file.path);
 seen.add(file.path);
 assert.match(file.path,/^assets\/audio\/audiobook\/part-0[12]\/volume-\d{2}\/(?:chapter-\d{3}|prologue)\.mp3$/);
 assert.ok(Number.isInteger(file.bytes)&&file.bytes>250000,'Too short '+file.path);
 assert.match(file.gitBlobSha,/^[0-9a-f]{40}$/);
 const local=join(root,file.path);
 assert.ok(existsSync(local),'Missing MP3 '+file.path);
 const meta=statSync(local);assert.equal(meta.size,file.bytes,'Original MP3 byte count changed: '+file.path);
 const descriptor=openSync(local,'r');const head=Buffer.alloc(4);
 try{readSync(descriptor,head,0,4,0);}finally{closeSync(descriptor);}
 assert.ok(head.subarray(0,3).toString('ascii')==='ID3'||head[0]===0xff,'Bad MP3 magic '+file.path);
 const sha=execFileSync('git',['hash-object','--',file.path],{cwd:root,encoding:'utf8'}).trim();
 assert.equal(sha,file.gitBlobSha,'MP3 content hash changed or corrupt: '+file.path);
 total+=file.bytes;
 if((index+1)%25===0)console.log('[V7] hash-verified '+(index+1)+'/131');
}
assert.equal(total,929684308,'Published full-quality audio must not be silently deleted or recompressed');
for(let volume=1;volume<=13;volume++){
 const v=String(volume).padStart(2,'0');
 for(let chapter=1;chapter<=10;chapter++){
  const path='assets/audio/audiobook/'+(volume<=10?'part-01':'part-02')+'/volume-'+v+'/chapter-'+String(chapter).padStart(3,'0')+'.mp3';
  assert.ok(seen.has(path),'Missing official chapter MP3 '+path);
  const html=read('chapters/volume-'+v+'/chapter-'+String(chapter).padStart(3,'0')+'.html');
  assert.ok(html.includes('chapter-'+String(chapter).padStart(3,'0')+'.mp3'),'Chapter page must retain native MP3 link '+path);
  assert.ok(html.includes('download='),'The reader download link must remain available '+path);
  assert.ok(html.includes('<audio')&&!/<audio[^>]*\bautoplay\b/i.test(html),'Audio must be user initiated '+path);
 }
}
assert.ok(seen.has('assets/audio/audiobook/part-01/volume-01/prologue.mp3'),'Missing narrated prologue');
assert.ok(read('chapters/volume-01/prologue.html').includes('prologue.mp3'),'Prologue must keep the audio link');
const center=read('assets/js/audiobook-center.js');
assert.ok(center.includes("const pathFor=(v,n)=>ROOT+'assets/audio/audiobook/'"),'Center should still use original page-owned files until hosting verified');
assert.ok(center.includes('audio.src=pathFor(v,n)'),'Center audio must remain intact');
assert.ok(center.includes('download.download'),'Download filename must be preserved');
assert.ok(center.includes('positions[trackKey('),'Do not discard playback progress');
const bgm=['heroic','mystery','quiet','sorrow'].map(x=>'assets/audio/'+x+'.mp3');
for(const f of bgm)assert.ok(existsSync(join(root,f)),'BGM track must not be removed '+f);
const source=read('scripts/test-v6-browser.mjs');
assert.ok(source.includes('chapter-narration-metadata')&&source.includes('audiobook-center-navigation'),'V6 browser playback tests remain active');
const approx=total+bgm.reduce((n,f)=>n+statSync(join(root,f)).size,0);
console.log('[V7] PASS: 131/131 MP3 hashes, '+total+' bytes original narration, 4 BGM files, 130 chapter playback links, prologue, audiobook resume unchanged.');
console.log('[V7] WARN: audio payload '+(approx/1024/1024).toFixed(1)+' MiB, Pages deployment remains near capacity; DO NOT remove originals before verified alternate hosting and link compatibility.');
