#!/usr/bin/env node
/**
 * The Zero Sequence — reader progress regression tests.
 * Runs without network or browser dependencies.
 * Execute: node scripts/test-reading-flow.mjs
 */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
const root=fileURLToPath(new URL('../',import.meta.url));
const p=(file)=>resolve(root,file);
const storage=new Map();
const events=new Map();
const document={
 readyState:'loading',
 addEventListener(name,fn){events.set(name,fn)},
 dispatchEvent(evt){(events.get(evt.type)||(()=>{}))();},
 querySelector(){return null}
};
const localStorage={
 getItem(k){return storage.has(k)?storage.get(k):null},
 setItem(k,v){storage.set(k,String(v))}
};
const context={document,localStorage,location:{pathname:'/zero-sequence-public/index.html'},window:{},Event:class{constructor(type){this.type=type}},console};
vm.runInNewContext(readFileSync(p('assets/js/progressive-archive.js'),'utf8'),context,{filename:'progressive-archive.js'});
const unlock=context.window.ZSUnlock;
assert.ok(unlock && typeof unlock.get==='function' && typeof unlock.set==='function');
assert.equal(unlock.get(1).max,0);
assert.equal(unlock.get(2).max,0);
assert.equal(unlock.get(3).max,0);
unlock.set(1,1,false);
assert.equal(unlock.get(1).max,1,'first chapter unlock');
assert.equal(unlock.get(2).max,0,'second part must not change');
unlock.set(1,10,false);
unlock.set(1,2,false);
assert.equal(unlock.get(1).max,10,'progress must never decrease');
unlock.set(1,0,true);
assert.equal(unlock.get(1).prologue,true,'prologue separately saved');
assert.equal(unlock.get(2).prologue,false,'prologue must not spill into part 2');
unlock.set(2,1,false);
assert.equal(unlock.get(2).max,1,'second part unlock');
assert.equal(unlock.get(1).max,10,'first part remains intact');
unlock.set(2,100,false);
assert.equal(unlock.get(2).max,100,'second part completion');
unlock.set(1,100,false);
assert.equal(unlock.get(1).max,100,'first part completion');
assert.equal(unlock.partOf(1),1);
assert.equal(unlock.partOf(10),1);
assert.equal(unlock.partOf(11),2);
assert.equal(unlock.partOf(20),2);
assert.equal(unlock.partOf(21),3);
unlock.set(3,1,false);
assert.equal(unlock.get(3).max,1,'Part III should track its own opening chapter');
assert.equal(unlock.get(2).max,100,'Part III must not reset earlier part progress');
unlock.set(3,5,false);unlock.set(3,2,false);
assert.equal(unlock.get(3).max,5,'Part III progress must be monotonic');
assert.ok(unlock.entries.every(e=>[1,2,3].includes(e.p)));
assert.ok(unlock.entries.every(e=>e.n>=1&&e.n<=100));
for(let volume=1;volume<=27;volume++){
 const directory='volumes/volume-'+String(volume).padStart(2,'0')+'.html';
 assert.ok(existsSync(p(directory)),'Missing volume directory: '+directory);
 for(let chapter=1;chapter<=10;chapter++){
  const f='chapters/volume-'+String(volume).padStart(2,'0')+'/chapter-'+String(chapter).padStart(3,'0')+'.html';
  assert.ok(existsSync(p(f)),'Missing chapter: '+f);
  const html=readFileSync(p(f),'utf8');
  assert.match(html,/<main\b/i,'Missing main content: '+f);
  assert.match(html,/class=["'][^"']*article/i,'Missing article container: '+f);
  assert.match(html,/audio-player\.js/i,'Direct reading bootstrap missing: '+f);
 }
}
// A newly published volume must satisfy the author-approved length standard.
const partThreeTitles=['没有署名的偏差','第二份记录','明码标价的真相','断线之后','旧地图的新影子','剑的边界','留在原地的人','七道签名','不属于攻略的路','回声未尽'];
for(let i=1;i<=10;i++){
 const file='chapters/volume-21/chapter-'+String(i).padStart(3,'0')+'.html';
 const html=readFileSync(p(file),'utf8');
 const match=html.match(/<div class="article">([\s\S]*?)<div class="pager">/);
 assert.ok(match,'Chapter content missing for '+file);
 const paragraphs=[...match[1].matchAll(/<p>([\s\S]*?)<\/p>/g)].map(x=>x[1]);
 const chars=(paragraphs.join('').match(/\p{Script=Han}/gu)||[]).length;
 assert.ok(chars>=3000&&chars<=3500,'Chapter '+(200+i)+' fails 3000–3500 Han-character requirement: '+chars);
 assert.ok(html.includes(partThreeTitles[i-1]),'Wrong Chapter '+(200+i)+' title');
}
const volume22Titles=['两封邀请','在港口校准时间','被剪掉的十七秒','白塔旧航图','断桥上的猎手','不该出售的坐标','逆风撤离','两座钟','剑与证据','第三道刻痕'];
for(let i=1;i<=10;i++){
 const f='chapters/volume-22/chapter-'+String(i).padStart(3,'0')+'.html';
 const html=readFileSync(p(f),'utf8');
 const m=html.match(/<div class="article">([\s\S]*?)<div class="pager">/);
 assert.ok(m,'Chapter body missing '+f);
 const body=[...m[1].matchAll(/<p>([\s\S]*?)<\/p>/g)].map(v=>v[1]).join('');
 const han=(body.match(/\p{Script=Han}/gu)||[]).length;
 assert.ok(han>=3000&&han<=3500,'Chapter '+(210+i)+' is outside 3000–3500 Han characters: '+han);
 assert.ok(html.includes(volume22Titles[i-1]),'Wrong Chapter '+(210+i)+' title');
}
const volume23Titles=["失去编号的城","城外卸货","无主的回执","空白街名","借路的人","迟到的钟声","归档者","撤离线","两份城籍","留给活人的名字"];
for(let i=1;i<=10;i++){
 const f='chapters/volume-23/chapter-'+String(i).padStart(3,'0')+'.html';
 const html=readFileSync(p(f),'utf8');
 const m=html.match(/<div class="article">([\s\S]*?)<div class="pager">/);
 assert.ok(m,'Chapter body missing '+f);
 const paragraphs=[...m[1].matchAll(/<p>([\s\S]*?)<\/p>/g)].map(v=>v[1]).join('');
 const han=(paragraphs.match(/\p{Script=Han}/gu)||[]).length;
 assert.ok(han>=3000&&han<=3500,'Chapter '+(220+i)+' is outside 3000–3500 Han characters: '+han);
 assert.ok(html.includes(volume23Titles[i-1]),'Wrong Chapter '+(220+i)+' title');
}
const volume24Titles=["外缘旧门","画图的人","失效的通行证","石墙背面","没有回来的信使","同一刻的两份账","守门人","雨线之下","被替换的图例","门外仍有路"];
for(let i=1;i<=10;i++){
 const f='chapters/volume-24/chapter-'+String(i).padStart(3,'0')+'.html';
 const html=readFileSync(p(f),'utf8');
 const m=html.match(/<div class="article">([\s\S]*?)<div class="pager">/);
 assert.ok(m,'Chapter body missing '+f);
 const content=[...m[1].matchAll(/<p>([\s\S]*?)<\/p>/g)].map(v=>v[1]).join('');
 const han=(content.match(/\p{Script=Han}/gu)||[]).length;
 assert.ok(han>=3000&&han<=3500,'Chapter '+(230+i)+' is outside 3000–3500 Han characters: '+han);
 assert.ok(html.includes(volume24Titles[i-1]),'Wrong Chapter '+(230+i)+' title');
 assert.ok(html.includes('audio-player.js'),'Chapter reader scripts must load: '+f);
}
assert.ok(unlock.get(2).max===100,'Earlier part progress must remain unchanged');
const volume25Titles=["第二张路网","灰鲸号","断潮追猎","失序灯塔","盟友的价码","无声的七号站","双线突围","记忆失准","不该亮起的锚灯","断潮之后"];
for(let i=1;i<=10;i++){
 const f='chapters/volume-25/chapter-'+String(i).padStart(3,'0')+'.html';
 const html=readFileSync(p(f),'utf8');
 const m=html.match(/<div class="article">([\s\S]*?)<div class="pager">/);
 assert.ok(m,'Chapter body missing '+f);
 const content=[...m[1].matchAll(/<p>([\s\S]*?)<\/p>/g)].map(v=>v[1]).join('');
 const han=(content.match(/\p{Script=Han}/gu)||[]).length;
 assert.ok(han>=3000&&han<=3500,'Chapter '+(240+i)+' outside 3000–3500 Han chars: '+han);
 assert.ok(html.includes(volume25Titles[i-1]),'Wrong Chapter '+(240+i)+' title');
 assert.ok(html.includes('audio-player.js'),'Missing bootstrap '+f);
}
unlock.set(3,50,false);assert.equal(unlock.get(3).max,50,'Part III retains earlier fifty-chapter progress');
const volume26Titles=["未标定的岔路","碎石坡","第三根标尺","被出售的捷径","断线围猎","留在坡上的人","外环试锋","空白终点","谁在收过路费","路未封死"];
for(let i=1;i<=10;i++){
 const f='chapters/volume-26/chapter-'+String(i).padStart(3,'0')+'.html';
 const html=readFileSync(p(f),'utf8');
 const m=html.match(/<div class="article">([\s\S]*?)<div class="pager">/);
 assert.ok(m,'Chapter body missing '+f);
 const content=[...m[1].matchAll(/<p>([\s\S]*?)<\/p>/g)].map(v=>v[1]).join('');
 const han=(content.match(/\p{Script=Han}/gu)||[]).length;
 assert.ok(han>=3000&&han<=3500,'Chapter '+(250+i)+' outside 3000–3500 Han chars: '+han);
 assert.ok(html.includes(volume26Titles[i-1]),'Wrong Chapter '+(250+i)+' title');
 assert.ok(html.includes('audio-player.js'),'Missing bootstrap '+f);
}
unlock.set(3,60,false);assert.equal(unlock.get(3).max,60,'Part III must advance to sixty chapters');
const volume27Titles=["新战帖","灰烬谷口","三十步剑线","夜行火蜥","旧炉的钥匙","破盾与断刃","火脉之下","两份战利品","剑意有形","谷外仍有火"];
for(let i=1;i<=10;i++){
 const f='chapters/volume-27/chapter-'+String(i).padStart(3,'0')+'.html';
 const html=readFileSync(p(f),'utf8');
 const m=html.match(/<div class="article">([\s\S]*?)<div class="pager">/);
 assert.ok(m,'Chapter body missing '+f);
 const body=[...m[1].matchAll(/<p>([\s\S]*?)<\/p>/g)].map(v=>v[1]).join('');
 const han=(body.match(/\p{Script=Han}/gu)||[]).length;
 assert.ok(han>=3000&&han<=3500,'Chapter '+(260+i)+' outside 3000–3500 Han chars: '+han);
 assert.ok(html.includes(volume27Titles[i-1]),'Wrong Chapter '+(260+i)+' title');
 assert.ok(html.includes('audio-player.js'),'Missing bootstrap '+f);
}
unlock.set(3,70,false);assert.equal(unlock.get(3).max,70,'Part III must grow to seventy chapters');


const p3Index=readFileSync(p('parts/part-03.html'),'utf8');
assert.ok(p3Index.includes('volume-21.html')&&p3Index.includes('volume-22.html')&&p3Index.includes('volume-23.html')&&p3Index.includes('volume-24.html')&&p3Index.includes('volume-25.html')&&p3Index.includes('volume-26.html')&&p3Index.includes('volume-27.html'),'Third arc must link both published volumes');
assert.ok(readFileSync(p('index.html'),'utf8').includes('href="parts/part-03.html"'),'Homepage should link Part III');
assert.ok(readFileSync(p('assets/js/site-ui.js'),'utf8').includes("['第三篇 · 临界回声','parts/part-03.html']"),'Global navigation should include Part III');
assert.ok(readFileSync(p('assets/js/reader-experience.js'),'utf8').includes("vol===20?'第三篇"),'Chapter 200 should continue to Part III');
assert.ok(readFileSync(p('assets/js/progressive-archive.js'),'utf8').includes("p===3?70:100"),'Third part must use a seventy-chapter release meter');
console.log('[PART III] PASS: 70 complete full-length chapters, third-arc reading and unlock progress, official links.');
assert.ok(existsSync(p('chapters/volume-01/prologue.html')));
const volPage=readFileSync(p('assets/js/volume-page.js'),'utf8');
assert.match(volPage,/if\(read===10\)\{resume\.href=startHref/,'Completed volume should restart from its opening chapter');
const readingScript=readFileSync(p('assets/js/reader-experience.js'),'utf8');
assert.match(readingScript,/else if\(num===1&&vol>1\)/,'First chapter should link back across volume boundary');
assert.match(readingScript,/else if\(vol<27\)/,'Last chapter should link forward across volume boundary');
assert.match(readingScript,/if\(num===0\)/,'Prologue should link into chapter one');
assert.match(readingScript,/oldProgress\.index>0/,'Resume reader must offer saved paragraph position');

const audio=readFileSync(p('assets/js/audio-player.js'),'utf8');
for(const track of ['quiet','heroic','sorrow','mystery']){
 const path='assets/audio/'+track+'.mp3';
 assert.ok(existsSync(p(path)),'Missing original emotional soundtrack: '+path);
 const data=readFileSync(p(path));
 assert.ok(data.length>100000&&data.length<1000000,'Soundtrack should be complete and web-optimized: '+path);
 assert.ok(data.subarray(0,3).toString()==='ID3'||data[0]===255,'Soundtrack needs an MP3 signature: '+path);
 assert.ok(audio.includes("file:'"+track+".mp3'"),'Music player does not offer '+track);
}
assert.ok(audio.includes('zs_audio_volume'),'Preserve existing BGM volume setting');
assert.ok(audio.includes('zs_audio_mood_v2'),'Remember chosen music mood');
assert.ok(audio.includes("audio.loop=true"),'Soundtracks should continue during reading');
assert.ok(audio.includes("await next.play()"),'Mood changes must start the selected track');
assert.ok(audio.includes("requestAnimationFrame(tick)"),'Crossfade should be smooth');
assert.ok(!audio.includes('createOscillator'),'Remove old irritating repeated electronic oscillator music');
assert.ok(!audio.includes('setInterval'),'Do not use an endlessly repeating timer melody');
assert.ok(!audio.includes("addEventListener('pointerdown'"),'Background music should never start on first page touch');
assert.ok(readFileSync(p('sw.js'),'utf8').includes('audio-player.js?v=10'),'Service worker must invalidate old BGM script');

const mobileLayout=readFileSync(p('assets/css/style.css'),'utf8');
const mobileReader=readFileSync(p('assets/css/reader-experience.css'),'utf8');
const mobileNav=readFileSync(p('assets/js/site-ui.js'),'utf8');
const currentAudio=readFileSync(p('assets/js/audio-player.js'),'utf8');
const currentReader=readFileSync(p('assets/js/reader-experience.js'),'utf8');
assert.match(mobileLayout,/zs-mobile-menu-open/,'Mobile navigation must lock background scroll');
assert.match(mobileNav,/zs-mobile-menu-open/,'Mobile menu code must toggle background scroll lock');
assert.match(mobileLayout,/overflow-x:clip/,'Phone layout should prevent horizontal overflow');
assert.match(mobileReader,/env\(safe-area-inset-bottom\)/,'Reader settings need phone safe-area clearance');
assert.match(mobileReader,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/,'Chapter buttons must fit narrow screens');
assert.match(currentAudio,/zs-audio-expand/,'Music panel must be collapsible on phones');
assert.match(currentAudio,/zs-audio-expanded/,'Music panel must expand when requested');
assert.match(currentAudio,/zs:reader-panel-open/,'Reader settings should collapse an expanded BGM panel');
assert.match(currentReader,/visibilitychange/,'Reader progress should save when a mobile tab goes into the background');
assert.match(currentReader,/zs-chapter-reading/,'Chapters must expose mobile-specific bottom clearance');
assert.match(currentAudio,/site-ui\.js/,'Direct chapter loads should initialize accessible mobile navigation');
assert.match(currentAudio,/env\(safe-area-inset-bottom\)/,'Music controls should respect phone safe area');
assert.ok(currentReader.includes('assets/css/reader-experience.css?v=4'),'Reader stylesheet must invalidate old CSS');
assert.ok(readFileSync(p('sw.js'),'utf8').includes('reader-experience.js?v=7'),'Chapter navigation must use newest reader code');
assert.ok(readFileSync(p('index.html'),'utf8').includes('gu-changyuan-approved.webp'),'Homepage should use the optimized approved portrait');
console.log('[MOBILE READING] PASS: menu scrolling, safe areas, chapter buttons, compact music, CSS cache and official portrait.');
console.log('[EMOTIONAL BGM] PASS: 4 original MP3 themes, controls, smooth transitions, opt-in playback and no old synth loop.');
assert.match(audio,/reader-experience\.js/,'Reader should initialize on direct chapter visits');
assert.match(audio,/progressive-archive\.js/,'Unlock engine should initialize on direct chapter visits');
const reader=readFileSync(p('assets/js/reader-experience.js'),'utf8');
assert.match(reader,/zs:reader:last:v1/,'Resume key must remain stable');
assert.match(reader,/zs:reader:options:v1/,'Preferences key must remain stable');
const navCode=readFileSync(p('assets/js/reader-experience.js'),'utf8');
assert.match(navCode,/footerPager\.replaceChildren\(\.\.\.bottom\)/,'All chapters should normalize the footer navigation');
assert.match(navCode,/if\(num===0\)bottom\.push/,'Prologue bottom navigation must go to chapter one');
assert.match(navCode,/else if\(vol<27\)bottom\.push/,'Volume and part boundaries must link forward');
assert.match(navCode,/vol===10\?'下一篇/,'First part should lead directly to second part');
const sitemap=readFileSync(p('sitemap.xml'),'utf8');
const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
assert.equal(urls.length,302,'Sitemap should cover 271 reading pages, 27 volumes, 3 parts and home');
assert.equal(new Set(urls).size,urls.length,'Sitemap should have no duplicate URLs');
for(const url of urls){
 const prefix='https://prolv202020-maker.github.io/zero-sequence-public/';
 assert.ok(url.startsWith(prefix),'Unexpected sitemap hostname');
 assert.ok(existsSync(p(url.slice(prefix.length)||'index.html')),'Missing indexed page: '+url);
}
for(const file of ['index.html','parts/part-01.html','parts/part-02.html','parts/part-03.html']){
 const html=readFileSync(p(file),'utf8');
 for(const metadata of ['property="og:title"','property="og:description"','property="og:image"','name="twitter:card"','rel="canonical"'])
  assert.ok(html.includes(metadata),'Missing social/SEO metadata '+metadata+' in '+file);
}
assert.ok(readFileSync(p('robots.txt'),'utf8').includes('Sitemap: https://prolv202020-maker.github.io/zero-sequence-public/sitemap.xml'));
console.log('[PUBLICATION SEO] PASS: 302 index URLs, canonical social previews, sitemap and robots.');
const homepage=readFileSync(p('index.html'),'utf8');
for(const id of ['id="start-here"','id="zs-hero-resume"','id="zs-path-resume-link"','id="updates"','id="zs-home-resume"'])
 assert.ok(homepage.includes(id),'Missing landing page feature: '+id);
assert.ok(homepage.includes('href="chapters/volume-01/prologue.html"'),'First-time readers should start at prologue');
assert.ok(homepage.includes('《临界回声》第27卷正式开放'),'Spoiler-safe update notice missing');
const readerSource=readFileSync(p('assets/js/reader-experience.js'),'utf8');
assert.match(readerSource,/heroResume\.href=last\.url/,'Homepage hero must use saved reading URL');
assert.match(readerSource,/pathResume\.href=last\.url/,'Returning reader entry must use saved URL');
assert.match(readerSource,/zs:reader:last:v1/,'Keep original bookmark storage key');
assert.match(readerSource,/zs:reader:options:v1/,'Keep original reader settings key');
const visitorAnalytics=readFileSync(p('assets/js/visitor-analytics.js'),'utf8');
assert.match(visitorAnalytics,/const CLOUDFLARE_SITE_TOKEN='[a-f0-9]{32}';/,'Configured visitor analytics must use a valid public site token');
assert.match(visitorAnalytics,/navigator\.globalPrivacyControl===true/,'Respect privacy opt-out');
assert.ok(!/localStorage|sessionStorage|document\.cookie/.test(visitorAnalytics),'Analytics adapter must not read reader data or browser IDs');
assert.match(readFileSync(p('assets/js/audio-player.js'),'utf8'),/visitor-analytics\.js/,'All reading pages should initialize optional analytics');
assert.ok(homepage.includes('visitor-analytics.js'),'Homepage must load optional analytics');
console.log('[PROMOTION LANDING] PASS: new reader, resume URL, spoiler-safe announcements, opt-in statistics; original reader keys intact.');
const gallery2=readFileSync(p('parts/illustrations-02.html'),'utf8');
const gallery1=readFileSync(p('parts/illustrations-01.html'),'utf8');
assert.match(gallery2,/p02\?\.max/,'Second gallery must read independently tracked part 02 progress');
assert.match(gallery1,/p01\?\.max/,'First gallery must retain part 01 progress');
assert.match(gallery2,/if\(unlocked\)\{const img=/,'Scene art must not load before unlocking');
assert.match(gallery2,/if\(ok\)\{const img=/,'Volume artwork must not load before unlocking');
assert.match(gallery2,/const need=\(vol-11\)\*10\+1/,'Volume artwork must track relevant part two chapters');
assert.equal((gallery2.match(/tag:'SCENE \d\d'/g)||[]).length,6,'Second arc needs six original scene illustrations');
for(const name of [
 'scene-02-shadow-road.svg','scene-02-forge-ledger.svg','scene-02-white-candle.svg',
 'scene-02-mirror-path.svg','scene-02-north-wall.svg','scene-02-hundred-lights.svg'
]){
 const file='assets/images/illustrations/'+name;
 assert.ok(existsSync(p(file)),'Missing original second arc art: '+file);
 const svg=readFileSync(p(file),'utf8');
 assert.match(svg,/<svg /,'Invalid scene illustration: '+file);
}
for(let vol=11;vol<=20;vol++)
 assert.ok(existsSync(p('assets/images/covers/volume-'+String(vol).padStart(2,'0')+'.webp')),'Missing gallery volume cover '+vol);
assert.ok(readFileSync(p('parts/part-02.html'),'utf8').includes('href="illustrations-02.html"'),'Second arc directory must link to its gallery');
assert.ok(homepage.includes('href="parts/illustrations-02.html"'),'Homepage must link to second gallery');
assert.ok(readFileSync(p('assets/js/site-ui.js'),'utf8').includes("['第二篇 · 百城星火画廊','parts/illustrations-02.html']"),'Global navigation must link to second gallery');

for(const name of ['shadow-road','forge-ledger','white-candle','mirror-path','north-wall','hundred-lights']){
 const asset='assets/images/illustrations/scene-02-'+name+'.webp';
 assert.ok(existsSync(p(asset)),'Missing refined WebP artwork: '+asset);
 assert.ok(gallery2.includes('scene-02-'+name+'.webp'),'Gallery not wired to refined WebP artwork: '+name);
 const img=readFileSync(p(asset));
 assert.equal(img.toString('ascii',0,4),'RIFF','WebP file must begin with RIFF: '+asset);
 assert.equal(img.toString('ascii',8,12),'WEBP','File must be a true WebP: '+asset);
 assert.ok(img.length<500000,'WebP artwork should be web-optimized: '+asset);
}
console.log('[SECOND ARC GALLERY] PASS: 6 refined WebP scenes, 10 covers, independent unlocks and connected navigation.');
const characterGallery=readFileSync(p('archive/character-art.html'),'utf8');
const characterJs=readFileSync(p('assets/js/character-art.js'),'utf8');
assert.match(characterGallery,/id="zs-character-art-grid"/,'Missing dedicated character illustration gallery');
assert.match(characterGallery,/character-art\.js/,'Character gallery must load its renderer');
assert.match(characterJs,/zs:part-progress:v1/,'Character gallery must read the original saved progress');
assert.match(characterJs,/if\(shown\)\{/,'Unrevealed characters must not load portraits');
assert.match(characterJs,/pic\.src=ROOT\+'assets\/images\/characters\/'\+c\.slug\+'-approved\.webp'/,'Only unlocked characters may load approved portraits');
assert.equal((characterJs.match(/slug:'(?:gu-changyuan|su-zili|lin-lie|luo-jin|ling-tianyao|dai-xuanyue|gu-yanche)'/g)||[]).length,7,'All seven established character portraits should be included');
assert.match(characterJs,/need:21/,'Later first-part character must remain locked until the appropriate chapter');
assert.ok(readFileSync(p('archive/characters.html'),'utf8').includes('href="character-art.html"'),'Atlas must link to illustration gallery');
assert.ok(readFileSync(p('assets/js/site-ui.js'),'utf8').includes("['人物专属插画馆','archive/character-art.html']"),'Global navigation should link to character art');
assert.ok(readFileSync(p('assets/js/profile-v2.js'),'utf8').includes("ROOT+'archive/character-art.html'"),'Character profiles must link back to character artwork');
const approvedSlugs=['gu-changyuan','su-zili','lin-lie','luo-jin','ling-tianyao','dai-xuanyue','gu-yanche'];
for(const slug of approvedSlugs){
 const asset='assets/images/characters/'+slug+'-approved.webp';
 assert.ok(existsSync(p(asset)),'Missing approved portrait: '+asset);
 const img=readFileSync(p(asset));
 assert.equal(img.toString('ascii',0,4),'RIFF','Invalid portrait header: '+asset);
 assert.equal(img.toString('ascii',8,12),'WEBP','Invalid portrait format: '+asset);
 assert.ok(img.length<500000,'Portrait file should be web-optimized: '+asset);
}
const profileArt=readFileSync(p('assets/js/profile-v2.js'),'utf8');
const atlasArt=readFileSync(p('assets/js/atlas-v2.js'),'utf8');
assert.match(profileArt,/if\(read\)\{art\.src=ROOT/,'Character profile portrait should only load after unlock');
assert.match(atlasArt,/if\(art\)\{const pic=/,'Character atlas should only load pictures for revealed entries');
assert.match(atlasArt,/approvedSlug/,'Character atlas should resolve approved portrait slug');
assert.doesNotMatch(profileArt,/const art=node\('img','zs-profile-profile-art'\);art\.src=/,'Do not eagerly load hidden character portraits');
console.log('[CHARACTER ART] PASS: 7 user-approved portraits, independent visual themes, no advance image loading, progress gates and site links.');
console.log('[READING FLOW] PASS: 271 text files, 27 volumes, direct-load bootstrap, progress monotonicity, independent parts, prologue, resume keys.');
