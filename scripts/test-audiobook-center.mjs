#!/usr/bin/env node
/* Static smoke / regression checks for the audiobook center. Never calls ElevenLabs. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync,openSync,readSync,closeSync,statSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Script} from 'node:vm';
const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const file=p=>join(root,p),read=p=>readFileSync(file(p),'utf8');
const page=read('audiobooks.html'),home=read('index.html'),center=read('assets/js/audiobook-center.js');
const chapter=read('assets/js/audiobook-chapter.js'),reader=read('assets/js/reader-experience.js'),volume=read('assets/js/volume-page.js');
const bgm=read('assets/js/audio-player.js'),sw=read('sw.js'),nav=read('assets/js/site-ui.js');
const css=read('assets/css/audiobook-center.css'),chapterCss=read('assets/css/audiobook-chapter.css');
for(const [name,js] of [['center',center],['chapter',chapter],['reader',reader],['volume',volume],['bgm',bgm],['service-worker',sw],['navigation',nav]])
 assert.doesNotThrow(()=>new Script(js,{filename:name+'.js'}),name+' must compile');
for(const name of ['zs-listening-audio','zs-listening-volumes','zs-listening-chapters','zs-listening-prev','zs-listening-next','zs-listening-auto','zs-listening-seek','zs-listening-download','zs-listening-read'])
 assert.ok(page.includes('id="'+name+'"'),'Missing audiobook center control: '+name);
assert.ok(page.includes('audiobook-center.js?v=1')&&page.includes('audiobook-center.css?v=1'),'Audiobook assets not loaded');
assert.ok(home.includes('href="audiobooks.html"')&&home.includes('有声阅读中心'),'Homepage lacks listening entry');
assert.ok(nav.includes("{label:'有声小说',url:ROOT+'audiobooks.html'}"),'Global mobile navigation lacks listening entry');
assert.ok(volume.includes("vol<=13?'🎧 已配音")&&volume.includes("vol<=13){const listen"),'30 volume directories must distinguish narrated / text-only');
assert.ok(center.includes("const maxVolume=TITLES.length")&&center.includes("v<=30"),'30 volume statuses must be drawn');
assert.equal((center.match(/'[^']+'/g)||[]).filter(s=>['重返','初临','暗流'].includes(s.slice(1,-1))).length,3,'Volume metadata damaged');
assert.ok(center.includes("n<10?{v,n:n+1}:v<maxVolume?{v:v+1,n:1}:null"),'Next chapter must cross volume boundaries');
assert.ok(center.includes("if(auto.checked&&upcoming)")&&center.includes("await audio.play()"),'Next chapter should attempt seamless, opt-in playback');
assert.ok(center.includes("zs:audiobook:positions:v1")&&chapter.includes("zs:audiobook:positions:v1"),'Center and chapter must share only audiobook progress keys');
assert.ok(center.includes("zs:audiobook:last:v1")&&chapter.includes("zs:audiobook:last:v1"),'Resume latest track must be shared');
assert.ok(center.includes("audio.addEventListener('ended'")&&center.includes('positions[trackKey(completed.v,completed.n)]=0'),'Playback must end/reset appropriately');
assert.ok(center.includes("stopBgm();")&&chapter.includes("const bgm=document.querySelector('#zs-audio.is-playing .zs-play')"),'Playing narrated audio must pause BGM');
assert.ok(!center.includes('autoplay=true')&&!page.includes(' autoplay'),'No unsolicited audiobook autoplay');
assert.ok(reader.includes("audiobook-chapter.js?v=1")&&reader.includes("audiobook-chapter.css?v=1"),'Chapter player enhancer must be loaded without touching original HTML');
assert.ok(!chapter.includes('zs:reader:last:v1')&&!chapter.includes('zs:part-progress:v1'),'Audio enhancements must not overwrite novel reading progress or spoiler gates');
assert.ok(bgm.includes('zs_audio_volume')&&bgm.includes("file:'quiet.mp3'")&&bgm.includes('requestAnimationFrame(tick)'),'BGM configuration must remain intact');
assert.ok(sw.includes("reader-experience.js?v=26")&&bgm.includes("reader-experience.js?v=26"),'Cached chapter readers must receive audio enhancements');
assert.ok(css.includes('env(safe-area-inset-bottom)')&&css.includes('max-width:650px')&&chapterCss.includes('max-width:650px'),'Mobile layout must have safe-area and responsive controls');
assert.ok(!/ELEVENLABS_API_KEY|elevenlabs_narrate|tts-output|--produce/.test(center+chapter+page),'Audiobook center must never invoke paid voice generation');
let count=0;
for(let v=1;v<=13;v++){
 const vol=String(v).padStart(2,'0'),part=v<=10?'part-01':'part-02';
 const dir='assets/audio/audiobook/'+part+'/volume-'+vol+'/';
 const first=read('chapters/volume-'+vol+'/chapter-001.html');
 assert.ok(first.includes('zs-audiobook-player')&&first.includes('chapter-001.mp3'),'Volume '+v+' must be natively narrated');
 for(let n=1;n<=10;n++){
  const mp3=dir+'chapter-'+String(n).padStart(3,'0')+'.mp3';
  assert.ok(existsSync(file(mp3)),'Missing chapter audio '+mp3);
  assert.ok(statSync(file(mp3)).size>250000,'Truncated chapter audio '+mp3);
  const fd=openSync(file(mp3),'r'),buf=Buffer.alloc(3);try{readSync(fd,buf,0,3,0);}finally{closeSync(fd);}
  assert.ok(buf.toString()==='ID3'||buf[0]===255,'Invalid MP3 header '+mp3);
  count++;
 }
}
assert.ok(existsSync(file('assets/audio/audiobook/part-01/volume-01/prologue.mp3')),'Missing narrated prologue');
assert.ok(read('chapters/volume-14/chapter-001.html').includes('<div class="article">'),'Text-only later chapters must remain readable');
console.log('[AUDIOBOOK CENTER] PASS: '+count+' complete existing chapter MP3s plus prologue, all 30 volume labels, continuation/resume, mobile UI, BGM coexistence, no paid TTS.');
