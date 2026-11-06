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
assert.ok(unlock.entries.every(e=>e.p===1||e.p===2));
assert.ok(unlock.entries.every(e=>e.n>=1&&e.n<=100));
for(let volume=1;volume<=20;volume++){
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
assert.ok(existsSync(p('chapters/volume-01/prologue.html')));
const volPage=readFileSync(p('assets/js/volume-page.js'),'utf8');
assert.match(volPage,/if\(read===10\)\{resume\.href=startHref/,'Completed volume should restart from its opening chapter');
const readingScript=readFileSync(p('assets/js/reader-experience.js'),'utf8');
assert.match(readingScript,/else if\(num===1&&vol>1\)/,'First chapter should link back across volume boundary');
assert.match(readingScript,/else if\(vol<20\)/,'Last chapter should link forward across volume boundary');
assert.match(readingScript,/if\(num===0\)/,'Prologue should link into chapter one');
assert.match(readingScript,/oldProgress\.index>0/,'Resume reader must offer saved paragraph position');

const audio=readFileSync(p('assets/js/audio-player.js'),'utf8');
assert.match(audio,/reader-experience\.js/,'Reader should initialize on direct chapter visits');
assert.match(audio,/progressive-archive\.js/,'Unlock engine should initialize on direct chapter visits');
const reader=readFileSync(p('assets/js/reader-experience.js'),'utf8');
assert.match(reader,/zs:reader:last:v1/,'Resume key must remain stable');
assert.match(reader,/zs:reader:options:v1/,'Preferences key must remain stable');
const navCode=readFileSync(p('assets/js/reader-experience.js'),'utf8');
assert.match(navCode,/footerPager\.replaceChildren\(\.\.\.bottom\)/,'All chapters should normalize the footer navigation');
assert.match(navCode,/if\(num===0\)bottom\.push/,'Prologue bottom navigation must go to chapter one');
assert.match(navCode,/else if\(vol<20\)bottom\.push/,'Volume and part boundaries must link forward');
assert.match(navCode,/vol===10\?'下一篇/,'First part should lead directly to second part');
const sitemap=readFileSync(p('sitemap.xml'),'utf8');
const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
assert.equal(urls.length,224,'Sitemap should cover 201 reading pages, 20 volumes, 2 parts and home');
assert.equal(new Set(urls).size,urls.length,'Sitemap should have no duplicate URLs');
for(const url of urls){
 const prefix='https://prolv202020-maker.github.io/zero-sequence-public/';
 assert.ok(url.startsWith(prefix),'Unexpected sitemap hostname');
 assert.ok(existsSync(p(url.slice(prefix.length)||'index.html')),'Missing indexed page: '+url);
}
for(const file of ['index.html','parts/part-01.html','parts/part-02.html']){
 const html=readFileSync(p(file),'utf8');
 for(const metadata of ['property="og:title"','property="og:description"','property="og:image"','name="twitter:card"','rel="canonical"'])
  assert.ok(html.includes(metadata),'Missing social/SEO metadata '+metadata+' in '+file);
}
assert.ok(readFileSync(p('robots.txt'),'utf8').includes('Sitemap: https://prolv202020-maker.github.io/zero-sequence-public/sitemap.xml'));
console.log('[PUBLICATION SEO] PASS: 224 index URLs, canonical social previews, sitemap and robots.');
const homepage=readFileSync(p('index.html'),'utf8');
for(const id of ['id="start-here"','id="zs-hero-resume"','id="zs-path-resume-link"','id="updates"','id="zs-home-resume"'])
 assert.ok(homepage.includes(id),'Missing landing page feature: '+id);
assert.ok(homepage.includes('href="chapters/volume-01/prologue.html"'),'First-time readers should start at prologue');
assert.ok(homepage.includes('第三篇正在创作准备中'),'Spoiler-safe update notice missing');
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
console.log('[READING FLOW] PASS: 201 text files, 20 volumes, direct-load bootstrap, progress monotonicity, independent parts, prologue, resume keys.');
