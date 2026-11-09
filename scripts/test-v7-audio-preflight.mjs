#!/usr/bin/env node
/* V7无需账号的迁移测试：完整路径与快照、已读/播放数据隔离、模拟206远端服务。 */
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {spawn} from 'node:child_process';
import {readFileSync,openSync,readSync,closeSync,createReadStream} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT=resolve(fileURLToPath(new URL('../',import.meta.url)));
const M=JSON.parse(readFileSync(join(ROOT,'docs/v7-audio-source-manifest.json'),'utf8'));
assert.equal(M.schemaVersion,1);assert.equal(M.records.length,131);assert.equal(M.trackCount,131);
assert.equal(M.totalBytes,929684308,'Do not change original voice files or audio quality');
const keys=new Set(M.records.map(x=>x.path));
assert.equal(keys.size,131);
assert.ok(M.records.every(x=>x.bytes>250000&&/^[a-f0-9]{40}$/.test(x.gitBlobSha1)),'Source checksum manifest incomplete');
assert.equal(M.records.filter(x=>x.path.endsWith('/prologue.mp3')).length,1);
for(let v=1;v<=13;v++){
 const path='volume-'+String(v).padStart(2,'0')+'/';
 assert.equal(M.records.filter(x=>x.path.includes(path)).length,v===1?11:10,'Missing volume tracks: '+path);
}
const center=readFileSync(join(ROOT,'assets/js/audiobook-center.js'),'utf8');
const chapter=readFileSync(join(ROOT,'assets/js/audiobook-chapter.js'),'utf8');
const reader=readFileSync(join(ROOT,'assets/js/reader-experience.js'),'utf8');
assert.ok(center.includes("const pathFor=(v,n)=>ROOT+'assets/audio/audiobook/'"),'Before authorization center must keep normal old MP3 URLs');
assert.ok(reader.includes('audiobook-chapter.js?v=1'),'Chapter audio enhancer must remain');
for(const key of ['zs:audiobook:last:v1','zs:audiobook:positions:v1'])assert.ok(center.includes(key)&&chapter.includes(key));
for(const key of ['zs:reader:last:v1','zs:part-progress:v1'])assert.ok(!center.includes(key)&&!chapter.includes(key),'Audiobook system must never overwrite chapter reading progress');
const sample=M.records[0],sampleFile=join(ROOT,sample.path);
const fd=openSync(sampleFile,'r'),prefix=Buffer.alloc(2048);
try{readSync(fd,prefix,0,2048,0)}finally{closeSync(fd)}
function run(args){
 return new Promise((resolve,reject)=>{
  const p=spawn(process.execPath,args,{cwd:ROOT,stdio:['ignore','pipe','pipe']});let log='';
  for(const stream of [p.stdout,p.stderr])stream.on('data',data=>{log+=data.toString()});
  p.on('error',reject);p.on('close',code=>resolve({code,log}));
 });
}
async function serve(mode,fn){
 const server=createServer((req,res)=>{
  const headers={'Content-Type':'audio/mpeg','Content-Length':sample.bytes,'Access-Control-Allow-Origin':'https://prolv202020-maker.github.io','Accept-Ranges':'bytes'};
  if(mode==='wrong-cors')headers['Access-Control-Allow-Origin']='https://wrong.invalid';
  if(req.method==='HEAD'){res.writeHead(200,headers);res.end();return}
  if(req.headers.range){
   if(mode==='broken-range'){res.writeHead(200,headers);res.end();return}
   res.writeHead(206,{'Content-Type':'audio/mpeg','Content-Range':'bytes 0-2047/'+sample.bytes,'Content-Length':2048,'Access-Control-Allow-Origin':headers['Access-Control-Allow-Origin']});
   res.end(prefix);return;
  }
  // Full-file checksum smoke: production script also supports 131 complete remote downloads.
  res.writeHead(200,headers);createReadStream(sampleFile).pipe(res);
 });
 await new Promise((ok,fail)=>{server.once('error',fail);server.listen(0,'127.0.0.1',ok)});
 const origin='http://127.0.0.1:'+server.address().port+'/';
 try{return await fn(origin)}finally{await new Promise(ok=>server.close(ok))}
}
const script='scripts/v7-remote-audio-check.mjs';
const good=await serve('good',origin=>run([script,'--origin='+origin,'--allow-local-testing','--limit=1','--deep']));
assert.equal(good.code,0,'Mock byte-perfect remote did not pass: '+good.log.slice(-800));
assert.ok(good.log.includes('[V7 REMOTE] PASS 1'));
const failedRange=await serve('broken-range',origin=>run([script,'--origin='+origin,'--allow-local-testing','--limit=1']));
assert.notEqual(failedRange.code,0,'Remote without HTTP Range 206 must fail');
const failedCors=await serve('wrong-cors',origin=>run([script,'--origin='+origin,'--allow-local-testing','--limit=1']));
assert.notEqual(failedCors.code,0,'Remote with incorrect CORS must fail');
const nonsense=await run([script,'--origin=https://example.invalid','--limit=1']);
assert.notEqual(nonsense.code,0,'Non-production fake domain must not be cutover target');
const unsafe=await run([script,'--origin=https://bob:secret@example.com/a','--limit=1']);
assert.notEqual(unsafe.code,0,'Credentials must not be embedded into public URLs');
console.log('[V7 PREP] PASS: 131 fingerprints, stable readers and progress, valid remote byte-for-byte 206+CORS, and unsafe endpoints rejected.');
