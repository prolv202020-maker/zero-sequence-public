#!/usr/bin/env node
// 第零序列：读者百科必须来自已发布章节，按三篇进度独立解锁，不改写本地阅读记录。
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Script,runInNewContext} from 'node:vm';
const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const read=p=>readFileSync(join(root,p),'utf8');
const context={window:{}};
runInNewContext(read('assets/js/reader-codex-data.js'),context);
const records=context.window.ZSReaderCodex;
assert.ok(Array.isArray(records)&&records.length>=150,'Expected complete published-reader codex baseline');
const categories=new Set(),seen=new Set();
const source=e=>'chapters/volume-'+String((e.p-1)*10+Math.ceil(e.n/10)).padStart(2,'0')+'/chapter-'+String((e.n-1)%10+1).padStart(3,'0')+'.html';
for(const e of records){
 assert.ok(Number.isInteger(e.p)&&e.p>=1&&e.p<=3&&Number.isInteger(e.n)&&e.n>=1&&e.n<=100,'Chapter gate out of range');
 assert.ok(typeof e.t==='string'&&e.t.length>1&&typeof e.d==='string'&&e.d.length>5,'Missing published reader text');
 assert.ok(existsSync(join(root,source(e))),'Missing citation source '+source(e));
 const key=[e.p,e.n,e.k,e.t].join('|');assert.ok(!seen.has(key),'Duplicate '+key);seen.add(key);
 categories.add(e.k);
}
for(const k of ['人物','魔物','武器','装备','技能','材料','道具','地图','势力','构装体'])assert.ok(categories.has(k),'Missing atlas category '+k);
for(const p of [1,2,3])assert.ok(records.some(x=>x.p===p),'Missing published part '+p);
const bestiary=JSON.parse(read('assets/data/bestiary.json')).entries;
assert.ok(bestiary.length>=32,'Missing published monster catalog expansion');
for(const e of bestiary){
 const p=e.p||1;
 assert.ok(p>=1&&p<=3&&e.first>0&&e.first<=100,'Bestriary gate invalid');
 assert.ok(existsSync(join(root,'chapters/volume-'+String(e.vol).padStart(2,'0')+'/chapter-'+String(e.ch).padStart(3,'0')+'.html')),'Missing bestiary source '+e.name);
 assert.ok(Array.isArray(e.sources)&&e.sources.length>0,'Missing bestiary citations '+e.name);
}
for(const [name,v,c] of [['灰刺兽',21,6],['裂鳍兽',25,3],['裂脊岩侯',26,7],['熔背龙蜥',27,7],['潜霜兽',28,5],['回纹哨鸦',30,4],['岩牙兽',12,4],['冰甲兽',16,5]]){
 const file='chapters/volume-'+v+'/chapter-'+String(c).padStart(3,'0')+'.html';
 assert.ok(read(file).includes(name),'Creature citation must match its actual chapter: '+name);
}
for(const path of ['assets/js/public-archive.js','assets/js/atlas-v2.js','assets/js/bestiary.js','assets/js/quest-links.js']){
 const js=read(path);assert.doesNotThrow(()=>new Script(js,{filename:path}),'Invalid reader archive JS: '+path);
 assert.ok(!js.includes('localStorage.setItem'),'Public index must never overwrite reading progress');
}
assert.ok(read('assets/js/public-archive.js').includes('progress(3)'),'Generic reader archives must gate third part');
assert.ok(read('assets/js/atlas-v2.js').includes('p3=progress(3)'),'Character archive must gate third part');
assert.ok(read('assets/js/bestiary.js').includes('progress(3)'),'Monster archive must gate third part');
assert.ok(read('assets/js/quest-links.js').includes('three=progress(3)'),'Quest archive must gate third part');
for(const pair of [['archive/codex.html','public-archive.js'],['archive/characters.html','atlas-v2.js'],['archive/classes.html','atlas-v2.js'],['archive/equipment.html','public-archive.js'],['archive/items.html','public-archive.js'],['archive/materials.html','public-archive.js'],['archive/world.html','public-archive.js'],['archive/factions.html','public-archive.js'],['archive/special-classes.html','public-archive.js']]){
 const html=read(pair[0]),dataAt=html.indexOf('reader-codex-data.js'),rendererAt=html.indexOf(pair[1]);
 assert.ok(dataAt>0&&rendererAt>dataAt,pair[0]+' must load progressive chapter-gated records before renderer');
}
const all=read('archive/codex.html');
assert.ok(all.includes('data-public-archive="codex"'),'Encyclopedia must use spoiler-safe reader rendering');
assert.ok(read('sitemap.xml').includes('archive/codex.html'),'New public encyclopedia must be discoverable');
console.log('[READER CODEX] PASS: '+records.length+' sourced entries, '+bestiary.length+' bestiary creatures, all three separately gated parts, reader-safe links and syntax.');
