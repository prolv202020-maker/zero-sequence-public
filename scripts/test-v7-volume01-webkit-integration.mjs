#!/usr/bin/env node
/* V7 first-volume migration drill. Only isolated local browser with Release URL rewrites. */
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,statSync,mkdirSync,writeFileSync} from 'node:fs';
import {resolve,join,sep,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {webkit,devices} from 'playwright';
const ROOT=resolve(fileURLToPath(new URL('../',import.meta.url)));
const PREFIX='/zero-sequence-public/';
const RELEASE='https://github.com/prolv202020-maker/zero-sequence-public/releases/download/zs-v7-volume01-drill-20261109/';
const redirects=[];
const server=createServer((req,res)=>{
 let path;try{path=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{return res.writeHead(400).end()}
 if(!path.startsWith(PREFIX))return res.writeHead(404).end();
 const found=path.match(/^\/zero-sequence-public\/assets\/audio\/audiobook\/part-01\/volume-01\/((?:prologue|chapter-0(?:0[1-9]|10))\.mp3)$/);
 if(found){const dest=RELEASE+'part-01-volume-01-'+found[1];redirects.push(dest);res.writeHead(302,{Location:dest,'Cache-Control':'no-store'});return res.end();}
 let full=resolve(ROOT,path.slice(PREFIX.length)||'index.html');
 if(full!==ROOT&&!full.startsWith(ROOT+sep))return res.writeHead(403).end();
 let st;try{st=statSync(full);if(st.isDirectory()){full=join(full,'index.html');st=statSync(full)}if(!st.isFile())throw Error()}catch{return res.writeHead(404).end()}
 const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.mp3':'audio/mpeg','.png':'image/png','.webp':'image/webp','.json':'application/json'};
 const h={'Content-Type':mime[extname(full)]||'application/octet-stream','Content-Length':st.size,'Cache-Control':'no-cache'};
 if(req.method==='HEAD')return res.writeHead(200,h).end();
 res.writeHead(200,h);createReadStream(full).pipe(res);
});
const start=()=>new Promise(ok=>server.listen(0,'127.0.0.1',ok));
await start();
const address='http://127.0.0.1:'+server.address().port+PREFIX;
const browser=await webkit.launch({headless:true});
mkdirSync('v7-volume01-webkit-results',{recursive:true});
const results=[];
try{
 for(const mode of ['webkit-desktop','webkit-iphone-emulation']){
  const context=await browser.newContext(mode==='webkit-iphone-emulation'?{...devices['iPhone 13']}:{});
  const redirectStart=redirects.length;
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const audio=page.locator('#zs-listening-audio');
  await page.goto(address+'audiobooks.html?volume=1&chapter=8');
  await page.waitForFunction(()=>{const a=document.querySelector('#zs-listening-audio');return a?.readyState>=1||a?.error},null,{timeout:40000});
  assert.equal(await audio.evaluate(a=>a.error?.code||null),null,'metadata error');
  await audio.evaluate(a=>a.play());
  await page.waitForTimeout(1100);
  assert.ok(await audio.evaluate(a=>!a.paused&&a.currentTime>0),'audio did not play');
  await page.locator('#zs-listening-seek').fill('200');
  await page.waitForTimeout(700);
  await audio.evaluate(a=>a.pause());
  let last=await page.evaluate(()=>JSON.parse(localStorage.getItem('zs:audiobook:last:v1')));
  assert.equal(last.v,1);assert.equal(last.n,8);assert.ok(last.seconds>10);
  await page.reload();
  await page.waitForFunction(()=>document.querySelector('#zs-listening-audio')?.readyState>=1&&document.querySelector('#zs-listening-audio')?.currentTime>10,null,{timeout:40000});
  const resume=await audio.evaluate(a=>a.currentTime);
  await page.locator('#zs-listening-auto').check();
  await audio.evaluate(async a=>{a.currentTime=Math.max(0,a.duration-0.65);await a.play()});
  await page.waitForFunction(()=>document.querySelector('#zs-listening-audio')?.currentSrc.includes('chapter-009.mp3'),null,{timeout:20000});
  await page.waitForFunction(()=>{const a=document.querySelector('#zs-listening-audio');return a.readyState>=1||a.error},null,{timeout:35000});
  assert.equal(await audio.evaluate(a=>a.error?.code||null),null,'next chapter did not load');
  await page.waitForTimeout(800);
  const continuing=await audio.evaluate(a=>({playing:!a.paused,time:a.currentTime,src:a.currentSrc}));
  assert.ok(continuing.playing,'continuous next chapter did not play');
  const result={mode,resume,continuing,remoteRequests:redirects.length-redirectStart,errorCount:errors.length,errors};
  assert.ok(redirects.slice(redirectStart).some(x=>x.endsWith('chapter-008.mp3'))&&redirects.slice(redirectStart).some(x=>x.endsWith('chapter-009.mp3')),'Release URLs not requested');
  assert.equal(errors.length,0,'Browser script error');
  results.push(result);console.log(JSON.stringify(result));await context.close();
 }
}finally{await browser.close();server.close()}
writeFileSync('v7-volume01-results/browser.json',JSON.stringify(results,null,2)+'\n');
console.log('V7 first-volume isolated WebKit browser integration PASS; no website files changed.');
