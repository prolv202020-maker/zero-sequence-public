#!/usr/bin/env node
/* 有声阅读中心离线发布保护：无需浏览器网络、ElevenLabs API 或任何付费额度。 */
import assert from 'node:assert/strict';
import {readFileSync,existsSync,statSync,openSync,readSync,closeSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const read=file=>readFileSync(resolve(root,file),'utf8');
const center=read('audiobooks.html');
const controller=read('assets/js/audiobook-center.js');
const tracker=read('assets/js/audiobook-progress.js');
const css=read('assets/css/audiobook-center.css');
const catalog=JSON.parse(read('assets/data/audiobook-catalog.json'));
for(const [name,code] of [['center',controller],['tracker',tracker],['music',read('assets/js/audio-player.js')],['SW',read('sw.js')],['nav',read('assets/js/site-ui.js')]]){
  assert.doesNotThrow(()=>new vm.Script(code,{filename:name+'.js'}),name+' must parse as valid JS');
}
assert.equal(catalog.volumes.length,13,'Only the published 13 audiobook volumes should appear as voiced');
assert.equal(catalog.availableThroughVolume,13);
assert.equal(catalog.prologueTitle,'最后的时刻');
assert.ok(center.includes('id="zs-ab-audio"')&&center.includes('controls preload="none"'),'Native media player is essential');
assert.ok(!/<audio[^>]*autoplay\b/i.test(center),'Page must not autoplay on first visit');
for(const id of ['zs-ab-volume','zs-ab-chapter','zs-ab-autonext','zs-ab-prev','zs-ab-next','zs-ab-resume','zs-ab-status','zs-ab-show-titles','zs-ab-download','zs-ab-chapter-link','zs-ab-volume-grid','zs-ab-chapter-grid']){
  assert.ok(center.includes('id="'+id+'"'),id+' is missing');
}
assert.ok(center.includes('audiobook-progress.js?v=1')&&center.includes('audiobook-center.js?v=1'));
assert.ok(center.includes('aria-live="polite"'),'Player must announce audio loading errors');
assert.ok(read('index.html').includes('href="audiobooks.html"'),'Homepage audiobook entry missing');
assert.ok(read('assets/js/site-ui.js').includes("label:'有声阅读',url:ROOT+'audiobooks.html'"),'Global audiobook navigation missing');
assert.ok(read('assets/js/volume-page.js').includes('🎧 完整有声 · 10章')&&read('assets/js/volume-page.js').includes('暂未配音 · 可读正文'),'All 30 volume pages must distinguish voiced and unvoiced');
assert.ok(read('assets/js/audio-player.js').includes('assets/js/audiobook-progress.js?v=1'),'Direct chapter pages must receive progress script');
assert.ok(!read('assets/js/audiobook-progress.js').includes("localStorage.setItem('zs:reader:last:v1'"),'Audiobook cannot write reader last position');
assert.ok(css.includes('@media(max-width:700px)')&&css.includes('@media(max-width:420px)')&&css.includes('env(safe-area-inset-bottom)'),'Phone layout and safe area required');
assert.ok(css.includes('min-height:44px')&&css.includes(':focus-visible'),'Mobile touch targets and keyboard focus required');
assert.ok(controller.includes("audio.addEventListener('ended'")&&controller.includes('api.next(selected.volume,selected.chapter)'),'Queue must auto advance within published albums');
assert.ok(controller.includes('audio.play()')&&controller.includes('promise.catch'),'Autoplay failure must degrade to a manual play action');
assert.ok(controller.includes('api.pauseBgm()'),'Audio narration must pause the original BGM');
assert.ok(controller.includes("showTitles.checked")&&controller.includes('revealName(v,c)'),'Unseen chapter names must require opt-in');
assert.ok(controller.includes('new URL(api.audioUrl(v,c),location.href).href'),'Browser absolute media source URL must be matched for resume saves');
let files=0;
for(let v=1;v<=13;v++){
  const volume=catalog.volumes[v-1];
  assert.equal(volume.number,v,'Volume catalogue order incorrect');
  assert.ok(volume.title&&volume.chapters.length===10,'Missing chapter titles at '+v);
  assert.ok(!volume.chapters.some(t=>!t||/正式正文$|卷末$/.test(t)),'Dirty chapter labels at '+v);
  assert.ok(existsSync(resolve(root,'volumes/volume-'+String(v).padStart(2,'0')+'.html')),'Missing published volume page '+v);
  for(let c=v===1?0:1;c<=10;c++){
    const folder='volume-'+String(v).padStart(2,'0');
    const stem=c===0?'prologue':'chapter-'+String(c).padStart(3,'0');
    const audio='assets/audio/audiobook/'+(v<=10?'part-01':'part-02')+'/'+folder+'/'+stem+'.mp3';
    const chapter='chapters/'+folder+'/'+stem+'.html';
    assert.ok(existsSync(resolve(root,audio)),'Missing actual MP3 '+audio);
    assert.ok(existsSync(resolve(root,chapter)),'Missing chapter text '+chapter);
    const stats=statSync(resolve(root,audio));
    assert.ok(stats.size>100000,'MP3 appears truncated '+audio);
    const fd=openSync(resolve(root,audio),'r');
    const marker=Buffer.alloc(3);readSync(fd,marker,0,3,0);closeSync(fd);
    assert.ok(marker.toString('ascii')==='ID3'||marker[0]===255,'MP3 signature invalid '+audio);
    files++;
  }
}
assert.equal(files,131,'131 actual MP3 assets (including prologue) must exist');
for(let v=14;v<=30;v++)assert.ok(existsSync(resolve(root,'volumes/volume-'+String(v).padStart(2,'0')+'.html')),'Unvoiced volume must keep reading link: '+v);
assert.ok(controller.includes('for(let v=1;v<=30;v++)'),'All 30 status cards must be rendered');
const memory=new Map();
const mockDocument={readyState:'loading',addEventListener(){}};
const mockStorage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,String(v))};
const sandbox={window:{},document:mockDocument,localStorage:mockStorage,location:{pathname:'/zero-sequence-public/index.html'},Date,console};
vm.runInNewContext(tracker,sandbox,{filename:'audiobook-progress.js'});
const api=sandbox.window.ZSAudiobook;
assert.ok(api,'Playback helper missing');
assert.equal(api.available(1,0),true);
assert.equal(api.available(2,0),false);
assert.equal(api.available(13,10),true);
assert.equal(api.available(14,1),false);
assert.ok(api.audioUrl(1,0).includes('/part-01/volume-01/prologue.mp3'));
assert.ok(api.audioUrl(10,10).includes('/part-01/volume-10/chapter-010.mp3'));
assert.ok(api.audioUrl(11,1).includes('/part-02/volume-11/chapter-001.mp3'));
assert.equal(api.audioUrl(14,1),'','Unvoiced volumes must never request nonexistent MP3');
assert.equal(JSON.stringify(api.next(1,0)),JSON.stringify({volume:1,chapter:1}));
assert.equal(JSON.stringify(api.next(10,10)),JSON.stringify({volume:11,chapter:1}));
assert.equal(JSON.stringify(api.next(13,10)),'null');
assert.equal(JSON.stringify(api.previous(2,1)),JSON.stringify({volume:1,chapter:10}));
assert.equal(JSON.stringify(api.previous(1,1)),JSON.stringify({volume:1,chapter:0}));
assert.equal(JSON.stringify(api.previous(1,0)),'null');
api.save(1,0,37,120);
assert.equal(api.saved(1,0).seconds,37,'Prologue seek location should survive reload');
assert.equal(JSON.stringify(api.last()),JSON.stringify({volume:1,chapter:0}));
api.save(1,0,0,120,true);
assert.equal(JSON.stringify(api.last()),JSON.stringify({volume:1,chapter:1}),'Completed chapter should recommend the next');
api.save(13,10,0,300,true);
assert.equal(JSON.stringify(api.last()),JSON.stringify({volume:13,chapter:10}),'Final audiobook must not overflow to unvoiced volume');
assert.equal(api.autoNext(),true);
api.setAutoNext(false);
assert.equal(api.autoNext(),false);
assert.ok(memory.has('zs:audiobook:progress:v1')&&memory.has('zs:audiobook:last:v1'));
assert.equal(memory.has('zs:reader:last:v1'),false,'Audiobook must never change written reading position');
assert.equal(memory.has('zs:part-progress:v1'),false,'Audiobook must never unlock hidden material');
assert.equal(memory.has('zs:reader:options:v1'),false,'Audiobook must never change reader settings');
console.log('[AUDIOBOOK CENTER] PASS: 131 MP3 signatures and links, 30 volume labels, separate progress, autoplay and BGM safety, spoiler gates and phone styling.');
