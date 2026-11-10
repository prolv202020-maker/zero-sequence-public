#!/usr/bin/env node
/* Verify Zi Yue v4 narration lives intact on the separately anchored public audio archive. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {Script} from 'node:vm';
const read=p=>readFileSync(p,'utf8');
const manifest=JSON.parse(read('assets/data/audio-archive-manifest.json'));
const BASE='https://raw.githubusercontent.com/prolv202020-maker/zero-sequence-public/audio-archive-v1/';
assert.equal(manifest.base,BASE);
assert.equal(manifest.branch,'audio-archive-v1');
assert.equal(manifest.count,131);
assert.equal(manifest.files.length,131);
assert.ok(manifest.totalBytes>900_000_000);
assert.equal(manifest.files.reduce((n,x)=>n+x.size,0),manifest.totalBytes);
const paths=new Set();
for(const file of manifest.files){
 assert.ok(file.path.startsWith('assets/audio/audiobook/')&&file.path.endsWith('.mp3'));
 assert.match(file.sha,/^[0-9a-f]{40}$/);
 assert.ok(file.size>250000,'Incomplete archived MP3 '+file.path);
 assert.ok(!paths.has(file.path),'Duplicate MP3 '+file.path);
 paths.add(file.path);
 assert.ok(!existsSync(file.path),'Oversized MP3 must stay outside the Pages publish tree '+file.path);
}
const center=read('assets/js/audiobook-center.js'),chapterPlayer=read('assets/js/chapter-audiobook.js');
assert.doesNotThrow(()=>new Script(center));
assert.doesNotThrow(()=>new Script(chapterPlayer));
assert.ok(center.includes(BASE),'Listening center must stream preserved archive');
assert.ok(chapterPlayer.includes(BASE)&&chapterPlayer.includes('source.src=url')&&chapterPlayer.includes('anchor.href=url'),'Native chapter player and downloads must route to archive');
assert.ok(!chapterPlayer.includes('localStorage'),'Native playback code must not change reading progress');
let chapters=0;
for(let v=1;v<=13;v++){
 const vol=String(v).padStart(2,'0'),part=v<=10?'part-01':'part-02';
 for(let n=1;n<=10;n++){
  const ch='chapter-'+String(n).padStart(3,'0'),path='assets/audio/audiobook/'+part+'/volume-'+vol+'/'+ch+'.mp3';
  assert.ok(paths.has(path),'Archived narration missing '+path);
  const page=read('chapters/volume-'+vol+'/'+ch+'.html');
  assert.ok(page.includes(ch+'.mp3?v=zi-yue-v4'),'Original chapter narration identity missing');
  assert.ok(page.includes('id="zs-chapter-narration"')&&page.includes('chapter-audiobook.js'),'Original player or archive adapter missing');
  assert.ok(page.includes('download='),'Narration download entry missing');
  assert.ok(page.includes('<div class="article">'),'Original prose missing');
  chapters++;
 }
}
const prologue='assets/audio/audiobook/part-01/volume-01/prologue.mp3';
assert.ok(paths.has(prologue));
assert.ok(read('chapters/volume-01/prologue.html').includes('chapter-audiobook.js'));
assert.ok(read('volumes/volume-01.html').includes('子悦 Zi Yue 女声有声版'),'Official voice metadata lost');
assert.ok(read('chapters/volume-01/chapter-001.html').includes('<p>滴答。</p>'),'Opening prose changed');
console.log('[AUDIO ARCHIVE] PASS '+chapters+' chapter pages + prologue, preserved Git blob SHA/byte counts, archive routing and unmodified reader progress');
