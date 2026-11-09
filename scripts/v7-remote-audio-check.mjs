#!/usr/bin/env node
/* V7 独立音频托管验收（仅只读请求）：HEAD、206字节范围、CORS、可选完整字节SHA256。 */
import assert from 'node:assert/strict';
import {readFileSync,createReadStream,openSync,readSync,closeSync,mkdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT=resolve(fileURLToPath(new URL('../',import.meta.url)));
const ROOT_URL='https://prolv202020-maker.github.io';
const manifest=JSON.parse(readFileSync(join(ROOT,'docs/v7-audio-source-manifest.json'),'utf8'));
const arg=flag=>process.argv.find(x=>x.startsWith(flag+'='))?.slice(flag.length+1);
const origin=arg('--origin'),local=process.argv.includes('--allow-local-testing'),deep=process.argv.includes('--deep'),report=process.argv.includes('--report');
const limit=Number(arg('--limit')||'131');
if(!origin){
 console.error('Usage: node scripts/v7-remote-audio-check.mjs --origin=https://YOUR-PUBLIC-AUDIO-DOMAIN/ [--deep] [--report]');
 console.error('No external upload, deployment or source modifications will occur.');
 process.exit(2);
}
const base=new URL(origin);
assert.ok(!base.username&&!base.password&&!base.search&&!base.hash,'No credentials or tokens may appear in public audio URL');
assert.ok(base.protocol==='https:'||(local&&base.protocol==='http:'&&['localhost','127.0.0.1'].includes(base.hostname)),'Public storage must use HTTPS and a real public domain');
assert.ok(base.hostname!=='prolv202020-maker.github.io'&&!base.hostname.endsWith('.invalid'),'Public origin must be an independent real provider domain');
assert.ok(Number.isInteger(limit)&&limit>=1&&limit<=131);
if(report)assert.ok(deep&&limit===131,'A release-approval report requires all 131 complete byte-for-byte checks');
const rootUrl=base.href.endsWith('/')?base.href:base.href+'/';
function requireCors(res,key){
 const cors=res.headers.get('access-control-allow-origin');
 assert.ok(cors==='*'||cors===ROOT_URL,'Missing CORS access for GitHub Pages on '+key+': '+cors);
}
const samples=[];
for(let i=0;i<limit;i++){
 const r=manifest.records[i],link=new URL(r.path,rootUrl).href;
 const head=await fetch(link,{method:'HEAD',headers:{Origin:ROOT_URL},signal:AbortSignal.timeout(40000)});
 assert.equal(head.status,200,'Object not publicly available: '+r.path);
 const length=Number(head.headers.get('content-length'));
 assert.equal(length,r.bytes,'Wrong remote byte count '+r.path);
 assert.match(head.headers.get('content-type')||'',/^audio\/(mpeg|mp3)(?:;|$)/i,'Wrong audio MIME '+r.path);
 requireCors(head,r.path);
 const range=await fetch(link,{headers:{Origin:ROOT_URL,Range:'bytes=0-2047'},signal:AbortSignal.timeout(40000)});
 assert.equal(range.status,206,'HTTP Range 206 required for seek on '+r.path);
 assert.equal(range.headers.get('content-range'),'bytes 0-2047/'+r.bytes,'Wrong Content-Range '+r.path);
 requireCors(range,r.path);
 const preview=Buffer.from(await range.arrayBuffer());
 assert.equal(preview.length,2048,'Unexpected preview size '+r.path);
 const fd=openSync(join(ROOT,r.path),'r'),expected=Buffer.alloc(2048);
 try{readSync(fd,expected,0,2048,0)}finally{closeSync(fd)}
 assert.ok(preview.equals(expected),'Remote first bytes differ from original '+r.path);
 let sha256;
 if(deep){
  const localHash=createHash('sha256');
  for await(const c of createReadStream(join(ROOT,r.path)))localHash.update(c);
  const response=await fetch(link,{headers:{Origin:ROOT_URL},signal:AbortSignal.timeout(180000)});
  assert.equal(response.status,200,'Complete remote GET must be 200 '+r.path);
  requireCors(response,r.path);
  const remoteHash=createHash('sha256');let n=0;
  for await(const c of response.body){n+=c.length;remoteHash.update(c)}
  assert.equal(n,r.bytes,'Full remote audio is truncated '+r.path);
  sha256=remoteHash.digest('hex');
  assert.equal(sha256,localHash.digest('hex'),'Original and remote SHA256 differ '+r.path);
 }
 samples.push({path:r.path,bytes:r.bytes,range206:true,cors:true,sha256});
 if((i+1)%10===0||i+1===limit)console.log('[V7 REMOTE] '+(i+1)+'/'+limit+' verified');
}
if(report){
 const dir=join(ROOT,'v7-audio-results');mkdirSync(dir,{recursive:true});
 writeFileSync(join(dir,'remote-passed.json'),JSON.stringify({schemaVersion:1,verifiedAt:new Date().toISOString(),origin:rootUrl,sourceCommit:manifest.sourceCommit,trackCount:131,allFullBytesVerified:true,items:samples},null,2)+'\n');
}
console.log('[V7 REMOTE] PASS '+limit+' endpoints; '+(deep?'complete SHA256 comparison':'HEAD+Range+prefix identity')+'; no local or remote data modified.');
