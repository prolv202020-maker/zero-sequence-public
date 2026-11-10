#!/usr/bin/env node
// Validate completed older volumes and the latest partially published volume without inventing unwritten chapters.
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const read=(path)=>readFileSync(join(root,path),'utf8');
const vols=readdirSync(join(root,'volumes'))
  .filter(x=>/^volume-\d{2}\.html$/.test(x))
  .map(x=>Number(x.match(/\d{2}/)[0])).sort((a,b)=>a-b);
assert.ok(vols.length>=1,'No published volumes');
const latest=vols.at(-1);
assert.deepEqual(vols,Array.from({length:latest},(_,i)=>i+1),'Published volume directories must be contiguous');
const id=String(latest).padStart(2,'0');
const dir='chapters/volume-'+id;
const chapterFiles=readdirSync(join(root,dir)).filter(x=>/^chapter-\d{3}\.html$/.test(x)).sort();
const count=chapterFiles.length;
assert.ok(count>=1&&count<=10,'Latest volume must have 1–10 published chapters');
const expected=Array.from({length:count},(_,i)=>'chapter-'+String(i+1).padStart(3,'0')+'.html');
assert.deepEqual(chapterFiles,expected,'Latest volume must be gapless without future chapters');
for(const old of vols.slice(0,-1)){
 const dirOld='chapters/volume-'+String(old).padStart(2,'0');
 const existing=readdirSync(join(root,dirOld)).filter(x=>/^chapter-\d{3}\.html$/.test(x)).sort();
 const full=Array.from({length:10},(_,i)=>'chapter-'+String(i+1).padStart(3,'0')+'.html');
 assert.deepEqual(existing,full,'Previously completed volume was unexpectedly shortened: '+old);
}
const toc=read('volumes/volume-'+id+'.html');
const map=read('sitemap.xml');
const home=read('index.html');
const part=Math.ceil(latest/10),publishedInPart=((latest-1)%10)*10+count;
const totalPublished=(latest-1)*10+count;
const partPage=read('parts/part-'+String(part).padStart(2,'0')+'.html');
const unlock=read('assets/js/progressive-archive.js');
const reader=read('assets/js/reader-experience.js');
const volumeUI=read('assets/js/volume-page.js');
for(let i=1;i<=count;i++){
  const name='chapter-'+String(i).padStart(3,'0')+'.html';
  const file=dir+'/'+name,html=read(file);
  const match=html.match(/<div class="article">([\s\S]*?)<div class="pager">/);
  assert.ok(match,'Missing article body or pager: '+file);
  const paragraphs=[...match[1].matchAll(/<p>([\s\S]*?)<\/p>/g)].map(m=>m[1]).join('');
  const han=(paragraphs.match(/\p{Script=Han}/gu)||[]).length;
  assert.ok(han>=3000&&han<=3500,file+' outside approved 3000–3500 Han characters: '+han);
  assert.ok(html.includes('audio-player.js'),'Missing direct reader bootstrap: '+file);
  assert.ok(html.includes('progressive-archive.js'),'Missing independent progress script: '+file);
  assert.ok(toc.includes('href="../'+file+'"'),'Missing volume catalog link: '+file);
  assert.ok(map.includes('/'+file+'</loc>'),'Missing sitemap entry: '+file);
}
assert.ok(partPage.includes('volume-'+id+'.html'),'Current part must link to latest volume');
assert.ok(home.includes(latest+'卷'),'Homepage volume count does not match');
assert.ok(home.includes(totalPublished+'章'),'Homepage chapter count does not match');
if(part===3){
  assert.ok(unlock.includes('p===3?'+publishedInPart+':100'),'Part III progress max mismatch');
}
assert.ok(reader.includes('vol<'+latest),'Reader next-volume bound mismatch');
assert.ok(volumeUI.includes('vol>'+latest),'Volume catalog bound mismatch');
if(latest>1){
  const prev='chapters/volume-'+String(latest-1).padStart(2,'0')+'/chapter-010.html';
  assert.ok(read(prev).includes('../volume-'+id+'/chapter-001.html'),'Previous volume last chapter must link to new volume');
}
assert.ok(existsSync(join(root,'assets/data/search-index-volume'+latest+'.json')) ||
  read('assets/data/search-index.json').includes('chapters/volume-'+id+'/chapter-'+String(count).padStart(3,'0')+'.html'),
  'Latest volume must be included in public search index');
console.log('[STAGED RELEASE] PASS: Volume '+latest+', '+totalPublished+' published chapters, complete text, progress, links, sitemap and search.');
