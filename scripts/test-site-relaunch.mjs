#!/usr/bin/env node
/* UI release smoke test. No network, no user data, no source mutation. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Script} from 'node:vm';
const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const read=p=>readFileSync(join(root,p),'utf8');
const home=read('index.html'),search=read('search.html');
const homeJS=read('assets/js/home-relaunch.js'),homeCSS=read('assets/css/home-relaunch.css');
const reader=read('assets/js/reader-experience.js'),readerCSS=read('assets/css/reader-experience.css');
const audio=read('assets/js/audio-player.js'),nav=read('assets/js/site-ui.js');
const sw=read('sw.js');
for(const [name,js] of [['home',homeJS],['reader',reader],['audio',audio],['nav',nav],['service worker',sw]]){
 assert.doesNotThrow(()=>new Script(js,{filename:name+'.js'}),name+' must parse as JavaScript');
}
const searchScripts=[...search.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(x=>x.trim());
assert.equal(searchScripts.length,1,'Search page must retain one inline search program');
assert.doesNotThrow(()=>new Script(searchScripts[0],{filename:'search-inline.js'}),'Search must parse correctly');
for(const id of ['world-entry','quick-jump','zs-quick-volumes','zs-number-jump','zs-chapter-number','zs-jump-feedback']){
 assert.ok(home.includes('id="'+id+'"'),'Home missing '+id);
}
assert.ok(home.includes('assets/css/home-relaunch.css?v=1'),'Home needs current redesign CSS');
assert.ok(home.includes('assets/js/home-relaunch.js?v=1'),'Home needs quick-navigation script');
assert.ok(home.includes('VOL 21—30 · COMPLETE'),'Part III cover must reflect completed volumes');
assert.ok(!home.includes('VOL 21—26 · NOW READING'),'Outdated home status must not recur');
assert.ok(home.includes('gu-changyuan-approved.webp'),'Keep user-approved protagonist artwork');
assert.ok(!home.includes('80级'),'Keep the author-only early fusion trigger private');
assert.ok(homeCSS.includes('@media(max-width:650px)'),'Responsive home grid required');
assert.ok(homeCSS.includes('focus-visible'),'Keyboard focus must remain visible');
assert.match(homeJS,/zs:part-progress:v1/,'Volume navigator must read original per-part progress');
assert.match(homeJS,/zs:reader:last:v1/,'Volume navigator must use existing continue-reading data');
assert.ok(!homeJS.includes('localStorage.setItem'),'Home browsing must not rewrite reading data');
assert.ok(homeJS.includes('num>300'),'Chapter-number jump must enforce published upper bound');
for(let n=1;n<=300;n++){
 const vol=Math.ceil(n/10),chapter=(n-1)%10+1;
 const path='chapters/volume-'+String(vol).padStart(2,'0')+'/chapter-'+String(chapter).padStart(3,'0')+'.html';
 assert.ok(existsSync(join(root,path)),'Jump target missing: '+path);
}
assert.ok(search.includes('id="s-include-unread"'),'Reader must explicitly opt into seeing unread chapter titles');
assert.ok(!/<input[^>]*id="s-include-unread"[^>]*\bchecked\b/.test(search),'Unread titles must not be shown by default');
assert.match(search,/showUnread\?\.checked/,'Reader consent should gate unread chapter and volume results');
assert.match(search,/Promise\.all\(urls\.map/,'Index chunks should download in parallel');
assert.ok(search.includes('index.html#quick-jump'),'Search should link to no-spoiler chapter-number navigation');
assert.ok(reader.includes('zs-chapter-jump-form'),'Every chapter needs non-fixed jump control');
assert.ok(reader.includes('zs-chapter-stats'),'Reader must display position and estimated reading time');
assert.match(reader,/zs:reader:last:v1/,'Preserve reading position key');
assert.match(reader,/zs:reader:options:v1/,'Preserve reader settings key');
assert.ok(readerCSS.includes('zs-chapter-jump'),'Reader dropdown needs styling');
assert.ok(readerCSS.includes('env(safe-area-inset-bottom)'),'Mobile safe areas must remain supported');
assert.ok(reader.includes('reader-experience.css?v=5'),'New reader CSS version must be loaded');
assert.ok(audio.includes('reader-experience.js?v=24'),'Direct loads should get upgraded reader script');
assert.ok(sw.includes('reader-experience.js?v=24'),'Service Worker navigation must get upgraded reader script');
assert.ok(nav.includes("['输入章号快速跳转','index.html#quick-jump']"),'Mobile and desktop navigation must include quick chapter jump');
assert.ok(reader.includes('volume-(0[23456789]|1[0123])'),'Cached volume 13 pages must recover their Zi Yue audiobook');
assert.ok(reader.includes("13:'十三'"),'Recovered volume 13 downloads need correct Chinese volume numbering');
console.log('[SITE RELAUNCH] PASS: accessible homepage, 30-volume navigator, 300 real chapter targets, spoiler opt-in, parallel search, upgraded reader UX, existing progress/BGM keys.');
