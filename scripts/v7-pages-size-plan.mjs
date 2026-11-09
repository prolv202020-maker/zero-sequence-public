#!/usr/bin/env node
/* V7 静态部署容量预估：只计算与报告，不删除、更名或复制任何已发表文件。 */
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,statSync,writeFileSync,mkdirSync} from 'node:fs';
import {join,relative,resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT=resolve(fileURLToPath(new URL('../',import.meta.url)));
const info=JSON.parse(readFileSync(join(ROOT,'docs/v7-audio-source-manifest.json'),'utf8'));
const INCLUDE=new Set(['archive','assets','chapters','volumes','parts']);
const published=[];
function walk(dir){
 for(const entry of readdirSync(dir,{withFileTypes:true})){
  const f=join(dir,entry.name),r=relative(ROOT,f).split(sep).join('/');
  if(entry.isDirectory()){walk(f);continue;}
  if(entry.isFile())published.push({path:r,bytes:statSync(f).size});
 }
}
for(const item of readdirSync(ROOT,{withFileTypes:true})){
 if(item.isDirectory()){if(INCLUDE.has(item.name))walk(join(ROOT,item.name));continue;}
 if(item.isFile()&&(/\.(html|xml|txt|ico)$/.test(item.name)||['sw.js','.nojekyll'].includes(item.name)))published.push({path:item.name,bytes:statSync(join(ROOT,item.name)).size});
}
const audio=published.filter(x=>x.path.startsWith('assets/audio/audiobook/')&&x.path.endsWith('.mp3'));
assert.equal(audio.length,131);
assert.equal(audio.reduce((s,x)=>s+x.bytes,0),info.totalBytes);
const other=published.filter(x=>!x.path.startsWith('assets/audio/audiobook/'));
const original=published.reduce((s,x)=>s+x.bytes,0),pagesWithoutAudio=other.reduce((s,x)=>s+x.bytes,0);
assert.ok(original>info.totalBytes&&pagesWithoutAudio>10000000&&pagesWithoutAudio<100000000,'Please manually review output artifact budget');
const results={
 schemaVersion:1,mode:'planning-only; no data moved or deleted',sourceCommit:info.sourceCommit,
 publishedFiles:published.length,sourceSiteBytes:original,mp3Files:audio.length,mp3Bytes:info.totalBytes,
 candidateStaticFiles:other.length,candidateStaticBytes:pagesWithoutAudio,estimatedReductionPercent:Math.round(info.totalBytes/original*1000)/10,
 blockers:[
  'No remote host configured, so do not deploy a website artifact without its original audio.',
  'GitHub Pages github.io raw MP3 URLs cannot be transparently redirected after omission without controlling that hostname.',
  'Chapter native audio src and download href plus audiobook-center pathFor must change to verified remote URL in one staging release.',
  'Existing audio playback positions, character/image galleries, novels and user localStorage must remain unchanged.',
  'GitHub Pages source must be changed to a custom Actions deployment after the remote objects pass preflight.'
 ]
};
if(process.argv.includes('--report')){const d=join(ROOT,'v7-audio-results');mkdirSync(d,{recursive:true});writeFileSync(join(d,'pages-size-plan.json'),JSON.stringify(results,null,2)+'\n');}
console.log('[V7 PAGES] total='+original+' bytes; audio='+info.totalBytes+' bytes; audio-free artifact estimate='+pagesWithoutAudio+' bytes; reduction='+results.estimatedReductionPercent+'%. NO published files changed.');
