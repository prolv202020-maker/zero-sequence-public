#!/usr/bin/env node
/* 《第零序列》V7：131段原始有声书的不可变字节与路由审核；不上传、不修改MP3。 */
import assert from 'node:assert/strict';
import {createReadStream,existsSync,readFileSync,openSync,readSync,closeSync,readdirSync,statSync,mkdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join,resolve,relative,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT=resolve(fileURLToPath(new URL('../',import.meta.url)));
const manifest=JSON.parse(readFileSync(join(ROOT,'docs/v7-audio-source-manifest.json'),'utf8'));
const opts=new Set(process.argv.slice(2));
const withHashes=opts.has('--full');
const writeReport=opts.has('--report');
const expected=[];
for(let vol=1;vol<=13;vol++){
 const part=vol<=10?'part-01':'part-02',v=String(vol).padStart(2,'0'),base='assets/audio/audiobook/'+part+'/volume-'+v+'/';
 if(vol===1)expected.push({path:base+'prologue.mp3',vol,chapter:0});
 for(let n=1;n<=10;n++)expected.push({path:base+'chapter-'+String(n).padStart(3,'0')+'.mp3',vol,chapter:n});
}
assert.equal(manifest.schemaVersion,1);
assert.equal(manifest.trackCount,131);
assert.equal(manifest.records.length,131);
assert.deepEqual(manifest.records.map(x=>x.path),expected.map(x=>x.path),'All 130 chapters + prologue in canonical release order');
let total=0;
const report={schemaVersion:1,createdAt:new Date().toISOString(),sourceCommit:manifest.sourceCommit,mode:withHashes?'full-byte-hash':'metadata-and-header',tracks:[]};
for(let i=0;i<manifest.records.length;i++){
 const rec=manifest.records[i],exp=expected[i];
 assert.ok(/^assets\/audio\/audiobook\/(part-01|part-02)\/volume-\d{2}\/(?:chapter-\d{3}|prologue)\.mp3$/.test(rec.path),'Invalid audio path');
 assert.ok(/^[a-f0-9]{40}$/.test(rec.gitBlobSha1),'Missing source Git object fingerprint '+rec.path);
 assert.ok(Number.isSafeInteger(rec.bytes)&&rec.bytes>250000&&rec.bytes<30000000,'Invalid source MP3 size '+rec.path);
 const file=resolve(ROOT,rec.path);
 assert.ok(file.startsWith(ROOT+sep)&&existsSync(file),'Audio missing '+rec.path);
 const length=statSync(file).size;
 assert.equal(length,rec.bytes,'Audio size mismatch '+rec.path);
 const fd=openSync(file,'r'),head=Buffer.alloc(12);
 try{readSync(fd,head,0,12,0)}finally{closeSync(fd)}
 assert.ok(head.toString('ascii',0,3)==='ID3'||head[0]===255&&((head[1]&224)===224),'MP3 header mismatch '+rec.path);
 const chapter=exp.chapter?join(ROOT,'chapters','volume-'+String(exp.vol).padStart(2,'0'),'chapter-'+String(exp.chapter).padStart(3,'0')+'.html'):join(ROOT,'chapters/volume-01/prologue.html');
 assert.ok(existsSync(chapter),'No paired released chapter '+rec.path);
 const html=readFileSync(chapter,'utf8');
 assert.ok(html.includes(rec.path.split('/').at(-1)),'Chapter source must reference original audio '+rec.path);
 const entry={path:rec.path,bytes:length,sourceGitBlobSha1:rec.gitBlobSha1};
 if(withHashes){
  const git=createHash('sha1');git.update('blob '+length+'\0');
  const sha256=createHash('sha256');
  for await(const chunk of createReadStream(file)){git.update(chunk);sha256.update(chunk)}
  assert.equal(git.digest('hex'),rec.gitBlobSha1,'Content changed versus Git snapshot '+rec.path);
  entry.sha256=sha256.digest('hex');
 }
 total+=length;report.tracks.push(entry);
}
assert.equal(total,manifest.totalBytes,'Published audiobook capacity changed');
const files=[];
for(const part of ['part-01','part-02']){
 for(const volume of readdirSync(join(ROOT,'assets/audio/audiobook',part),{withFileTypes:true})){
  if(!volume.isDirectory())continue;
  for(const name of readdirSync(join(ROOT,'assets/audio/audiobook',part,volume.name)))if(name.endsWith('.mp3'))files.push(part+'/'+volume.name+'/'+name);
 }
}
assert.equal(files.length,131,'Unexpected extra or missing MP3s');
assert.ok(readFileSync(join(ROOT,'assets/js/audiobook-center.js'),'utf8').includes("const pathFor=(v,n)=>ROOT+'assets/audio/audiobook/'"),'Current listening center has changed route; review manifest before migrating');
report.totalBytes=total;report.trackCount=report.tracks.length;
if(writeReport){
 const directory=join(ROOT,'v7-audio-results');mkdirSync(directory,{recursive:true});
 writeFileSync(join(directory,'checksum-report.json'),JSON.stringify(report,null,2)+'\n','utf8');
}
console.log('[V7 AUDIO] PASS '+report.trackCount+' MP3s / '+total+' bytes; '+(withHashes?'all Git SHA1 and raw SHA256 checks verified':'metadata/headers/HTML source paths verified')+'; original files untouched.');
