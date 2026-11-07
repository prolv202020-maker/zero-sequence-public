#!/usr/bin/env node
/* Official chapter 001 audiobook must publish the verified existing MP3 and never hide text or disturb progress. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync,statSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Script} from 'node:vm';
const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const read=p=>readFileSync(join(root,p),'utf8');
const file='assets/audio/audiobook/part-01/volume-01/chapter-001.mp3';
assert.ok(existsSync(join(root,file)),'Published MP3 not committed');
const data=readFileSync(join(root,file));
assert.ok(data.length>5_000_000 && data.length<15_000_000,'Unexpected audiobook size');
assert.equal(data.subarray(0,3).toString('utf8'),'ID3','Not a valid MP3 ID3 header');
const page=read('chapters/volume-01/chapter-001.html');
const volume=read('volumes/volume-01.html');
assert.ok(page.includes('controls preload="none"'),'No autoplay or prefetch allowed');
assert.ok(!/<audio[^>]+autoplay/.test(page),'Audio must only start by user action');
assert.ok(page.includes(file.replace('assets/audio','../../assets/audio')),'MP3 relative source path missing');
assert.ok(page.includes('download="第零序列_第一篇_第一卷_第一章_死亡与重生.mp3"'));
assert.ok(volume.includes('chapter-001.html#zs-audiobook-player'),'Chapter directory audiobook link missing');
assert.ok(page.includes('<p>滴答。</p>')&&page.includes('——【零】。'),'Original story body must remain unchanged');
assert.equal((page.match(/<div class="article">/g)||[]).length,1,'Must retain one original story article');
const js=read('assets/js/chapter-audiobook.js');
assert.doesNotThrow(()=>new Script(js,{filename:'chapter-audiobook.js'}));
assert.ok(!js.includes('localStorage'),'Audiobook must not touch reading progress');
assert.ok(js.includes('#zs-audio.is-playing .zs-play'),'BGM should pause on narration start');
assert.ok(read('assets/css/chapter-audiobook.css').includes('@media(max-width:650px)'),'Mobile player styling required');
console.log('[AUDIOBOOK] PASS: original 1st chapter published with a '+data.length+'-byte opt-in MP3, mobile controls, progress and BGM preserved.');
