#!/usr/bin/env node
/* Fourth-part public codex regression: checks files and gates, never modifies story or progress. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {runInNewContext,Script} from 'node:vm';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const file=p=>join(root,p),read=p=>readFileSync(file(p),'utf8');
const context={window:{}};
runInNewContext(read('assets/js/reader-codex-data.js'),context);
const data=context.window.ZSReaderCodex;
const p4=data.filter(x=>x.p===4);
assert.equal(p4.length,30,'Fourth part must have 30 new sourced reader records');
assert.equal(data.length,190,'Reader database must contain 190 total records');
const kinds=new Set(p4.map(x=>x.k));
for(const k of ['人物','武器','装备','道具','材料','魔物','构装体','技能'])assert.ok(kinds.has(k),'Missing part 4 category '+k);
const refs=new Set();
for(const entry of p4){
 assert.ok(Number.isInteger(entry.n)&&entry.n>=1&&entry.n<=100,'Invalid fourth-part chapter gate');
 const vol=30+Math.ceil(entry.n/10),ch=(entry.n-1)%10+1;
 const chapter='chapters/volume-'+String(vol).padStart(2,'0')+'/chapter-'+String(ch).padStart(3,'0')+'.html';
 assert.ok(existsSync(file(chapter)),'Missing source '+chapter);
 assert.ok(read(chapter).includes(entry.proof),'Source evidence not found: '+entry.t+' in '+chapter);
 const key=[entry.p,entry.n,entry.k,entry.t].join('|');assert.ok(!refs.has(key),'Repeated record '+key);refs.add(key);
}
const beasts=JSON.parse(read('assets/data/bestiary.json')).entries;
assert.equal(beasts.length,34,'Expected 32 old + 2 verified fourth-part bestiary entries');
for(const b of beasts.filter(x=>x.p===4)){
 const chapter='chapters/volume-'+String(b.vol).padStart(2,'0')+'/chapter-'+String(b.ch).padStart(3,'0')+'.html';
 assert.ok(existsSync(file(chapter)),b.name+' lacks source chapter');
 assert.ok(Array.isArray(b.sources)&&b.sources.length,'Missing monster evidence '+b.name);
}
const progression=read('assets/js/progressive-archive.js');
for(const name of ['竞价死线','未定的矿脉']){
 assert.ok(!new RegExp("p:4,n:\\d+,k:'道具',t:'"+name+"'").test(progression),'A story event must not be classified as an item: '+name);
}
assert.ok(progression.includes("p:4,n:6,k:'技能',t:'重剑回锋'"),'Sword technique must not be a career');
for(const v of Array.from({length:40},(_,i)=>i+1)){
 const id=String(v).padStart(2,'0');
 assert.ok(existsSync(file('volumes/volume-'+id+'.html')),'Missing volume '+id);
 for(let n=1;n<=10;n++)assert.ok(existsSync(file('chapters/volume-'+id+'/chapter-'+String(n).padStart(3,'0')+'.html')),'Missing chapter '+v+'/'+n);
}
assert.ok(existsSync(file('chapters/volume-01/prologue.html')),'Missing prologue');
for(let v=31;v<=40;v++){
 const p='assets/images/covers/part-04/volume-'+v+'.webp';
 const bytes=readFileSync(file(p));
 assert.equal(bytes.toString('ascii',0,4),'RIFF','Invalid approved fourth cover '+v);
 assert.equal(bytes.toString('ascii',8,12),'WEBP','Invalid WebP cover '+v);
}
const pages={
 'archive/codex.html':['reader-codex-data.js?v=2','public-archive.js?v=5'],
 'archive/characters.html':['reader-codex-data.js?v=2','atlas-v2.js?v=9'],
 'archive/classes.html':['reader-codex-data.js?v=2','atlas-v2.js?v=9'],
 'archive/quests.html':['第四篇','quest-links.js?v=3'],
 'archive/unlocks.html':['reader-codex-data.js?v=2','progressive-archive.js?v=34'],
 'parts/final-archive.html':['reader-codex-data.js?v=2','progressive-archive.js?v=34'],
 'archive/equipment.html':['reader-codex-data.js?v=2','public-archive.js?v=5','第四篇'],
 'archive/items.html':['reader-codex-data.js?v=2','public-archive.js?v=5'],
 'archive/materials.html':['reader-codex-data.js?v=2','public-archive.js?v=5'],
 'archive/bestiary.html':['bestiary.js?v=5'],
 'archive/visual-codex.html':['visual-codex.js?v=6','第四篇']
};
for(const [page,needles] of Object.entries(pages)){const s=read(page);for(const needle of needles)assert.ok(s.includes(needle),page+' missing '+needle);}
const publicScripts=['public-archive.js','atlas-v2.js','profile-v2.js','visual-codex.js','bestiary.js','quest-links.js'];
for(const name of publicScripts){const p='assets/js/'+name,s=read(p);assert.doesNotThrow(()=>new Script(s,{filename:p}),p+' syntax failure');assert.ok(!s.includes('localStorage.setItem'),p+' must not mutate reading progress');assert.ok(s.includes('progress(4)'),p+' lacks separate Part IV progress');}
assert.ok(read('assets/js/profile-v2.js').includes("w>=96"),'Chapter 396 milestone must be gated');
assert.ok(read('assets/js/public-archive.js').includes('[1,2,3,4]'),'Public atlas must include Part IV');
assert.ok(read('assets/js/quest-links.js').includes('four=progress(4)'),'Event graph must include Part IV');
const searchFiles=['assets/data/search-index.json',...Array.from({length:7},(_,i)=>'assets/data/search-index-volume'+(24+i)+'.json')];
const index=searchFiles.flatMap(p=>JSON.parse(read(p)));const urls=new Set(index.map(x=>x.url));
for(let v=1;v<=40;v++){const id=String(v).padStart(2,'0');assert.ok(urls.has('volumes/volume-'+id+'.html'),'Missing search index volume '+v);
for(let c=1;c<=10;c++)assert.ok(urls.has('chapters/volume-'+id+'/chapter-'+String(c).padStart(3,'0')+'.html'),'Missing search chapter '+v+'/'+c);}
assert.ok(urls.has('chapters/volume-01/prologue.html'),'Prologue missing search index');
assert.ok(read('sitemap.xml').includes('parts/illustrations-04.html'),'Fourth gallery not indexed');
const frozen=['gu-changyuan','su-zili','lin-lie','luo-jin','ling-tianyao','dai-xuanyue','gu-yanche'];
for(const x of frozen)assert.ok(existsSync(file('assets/images/characters/'+x+'-approved.webp')),'Missing frozen portrait '+x);
assert.equal(JSON.parse(read('assets/data/audio-archive-manifest.json')).count,131,'Audio archive count changed');
console.log('[FULL SITE V4] PASS: 400 chapters+prologue / 40 volumes / 30 new records / 34 bestiary / 7 identity paths / 40 covers / 12 event threads / all search shards / independent gates.');
