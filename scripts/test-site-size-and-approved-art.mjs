#!/usr/bin/env node
/* Site volume budget and visual-identity consistency check. */
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,statSync,existsSync} from 'node:fs';
import {join,relative} from 'node:path';
import {createHash} from 'node:crypto';
const expected=[["dai-xuanyue","7dc5d26806ee1e288c6ea291a9d82d4bbe3fceb1"],["gu-changyuan","7dd524458f2f4791cd12983d13ba8b2c28b9208c"],["gu-yanche","8fd0334ff62b125f889906c51d509e049b297455"],["lin-lie","08f4c4b3e2f7923342c934409dd05377df2cd629"],["ling-tianyao","7984d2a26ddc7fa684cb850d840da8d57cecc5be"],["luo-jin","14991f7f27153ed602b506c3c1b2f3be486e6356"],["su-zili","b7d6577837409dcba85d8f0272885558761be321"]];
const maxBytes=100*1024*1024;
let bytes=0,files=0;
const unexpected=[];
function walk(dir){
 for(const item of readdirSync(dir,{withFileTypes:true})){
  if(['.git','node_modules'].includes(item.name))continue;
  const path=join(dir,item.name);
  if(item.isDirectory())walk(path);
  else if(item.isFile()){
   bytes+=statSync(path).size;files++;
   const rel=relative('.',path).replaceAll('\\','/');
   if(rel.startsWith('assets/audio/audiobook/')&&rel.endsWith('.mp3'))unexpected.push(rel);
   if(rel.startsWith('assets/css/`images/characters/'))unexpected.push(rel);
  }
 }
}
walk('.');
assert.ok(bytes<maxBytes,'Pages checkout >100 MiB, risk of deploy timeout: '+(bytes/1048576).toFixed(1));
assert.deepEqual(unexpected,[],'Do not republish archived old portraits or 131 MP3 binaries');
for(const [slug,sha] of expected){
 const path='assets/images/characters/'+slug+'-approved.webp';
 assert.ok(existsSync(path),'Missing approved official portrait: '+slug);
 const bin=readFileSync(path);
 assert.equal(bin.toString('ascii',0,4),'RIFF');
 assert.equal(bin.toString('ascii',8,12),'WEBP');
 const blob=Buffer.concat([Buffer.from('blob '+bin.length),Buffer.from([0])]);
 assert.equal(createHash('sha1').update(Buffer.concat([blob,bin])).digest('hex'),sha,'Approved visual changed unexpectedly: '+slug);
}
for(let v=1;v<=35;v++)for(let n=1;n<=10;n++)assert.ok(existsSync('chapters/volume-'+String(v).padStart(2,'0')+'/chapter-'+String(n).padStart(3,'0')+'.html'),'Missing published chapter '+v+'-'+n);
const audio=JSON.parse(readFileSync('assets/data/audio-archive-manifest.json','utf8'));
assert.equal(audio.count,131);
for(const id of ['heroic','mystery','quiet','sorrow'])assert.ok(existsSync('assets/audio/'+id+'.mp3'),'Missing original BGM: '+id);
for(const folder of ['assets/js','assets/css']){
 for(const name of readdirSync(folder)){
  if(!/\.(js|css)$/.test(name))continue;
  const source=readFileSync(join(folder,name),'utf8');
  assert.ok(!source.includes('assets/css/`images/characters/')&&!source.includes('assets/css/%60images/characters/'),'Orphan PNG URL used by '+name);
 }
}
console.log('SITE SIZE PASS: '+(bytes/1048576).toFixed(2)+' MiB across '+files+' files, all 350 story chapters / 7 approved WebP / 131 archived MP3 / 4 BGM verified.');
