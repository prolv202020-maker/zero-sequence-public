#!/usr/bin/env node
/* V7 isolated browser integration: use one Release MP3 without editing any published site file. */
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,readFileSync,statSync,mkdirSync,writeFileSync} from 'node:fs';
import {resolve,join,sep,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium,devices} from 'playwright';
const ROOT=resolve(fileURLToPath(new URL('../',import.meta.url)));
const PREFIX='/zero-sequence-public/';
const RELEASE='https://github.com/prolv202020-maker/zero-sequence-public/releases/download/audio-v7-onefile-pilot-20261109/chapter-008.mp3';
const OLD='assets/audio/audiobook/part-01/volume-01/chapter-008.mp3';
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.mp3':'audio/mpeg','.webp':'image/webp','.png':'image/png','.json':'application/json'};
const server=createServer((req,res)=>{
 const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 if(!path.startsWith(PREFIX))return res.writeHead(404).end();
 let full=resolve(ROOT,path.slice(PREFIX.length)||'index.html');
 if(!(full===ROOT||full.startsWith(ROOT+sep)))return res.writeHead(403).end();
 let st;try{st=statSync(full);if(st.isDirectory()){full=join(full,'index.html');st=statSync(full)}if(!st.isFile())throw Error()}catch{return res.writeHead(404).end()}
 const h={'Content-Type':MIME[extname(full)]||'application/octet-stream','Cache-Control':'no-cache','Content-Length':st.size};
 if(req.method==='HEAD')return res.writeHead(200,h).end();
 res.writeHead(200,h);createReadStream(full).pipe(res);
});
mkdirSync('v7-center-integration-results',{recursive:true});
await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
const ORIGIN='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,args:['--autoplay-policy=no-user-gesture-required']});
const results=[];
try{
 for(const mode of ['desktop','mobile']){
  const context=await browser.newContext(mode==='mobile'?{...devices['Pixel 7']}:{});
  // Keep playback state isolated; use one existing Release audio instead of local chapter 8 MP3.
  await context.route('**/assets/audio/audiobook/part-01/volume-01/chapter-008.mp3*',route=>route.fulfill({status:302,headers:{location:RELEASE}}));
  const page=await context.newPage();
  await page.goto(ORIGIN+PREFIX+'audiobooks.html?volume=1&chapter=8');
  await page.waitForFunction(()=>document.querySelector('#zs-listening-audio')?.currentSrc.includes('chapter-008.mp3'),null,{timeout:15000});
  await page.waitForFunction(()=>document.querySelector('#zs-listening-audio')?.readyState>=1,null,{timeout:25000});
  const result={mode};
  const audio=page.locator('#zs-listening-audio');
  result.duration=await audio.evaluate(el=>el.duration);
  assert.ok(result.duration>150,'Original Release audio must have valid duration');
  await audio.evaluate(el=>el.play());
  await page.waitForTimeout(1100);
  result.playing=await audio.evaluate(el=>!el.paused&&el.currentTime>0);
  assert.ok(result.playing,'Release MP3 must play in site center');
  await page.locator('#zs-listening-seek').fill('200');
  await page.waitForTimeout(500);
  await audio.evaluate(el=>el.pause());
  result.persisted=await page.evaluate(()=>({last:JSON.parse(localStorage.getItem('zs:audiobook:last:v1')),positions:JSON.parse(localStorage.getItem('zs:audiobook:positions:v1'))}));
  assert.equal(result.persisted.last.v,1);
  assert.equal(result.persisted.last.n,8);
  assert.ok(result.persisted.positions['01:008']>10);
  await page.reload();
  await page.waitForFunction(()=>{const a=document.querySelector('#zs-listening-audio');return a?.readyState>=1&&a.currentTime>10},null,{timeout:25000});
  result.resumed=await audio.evaluate(el=>el.currentTime);
  assert.ok(result.resumed>10,'Position must restore after reload');
  await page.locator('#zs-listening-next').click();
  await page.waitForFunction(()=>document.querySelector('#zs-listening-audio')?.currentSrc.includes('chapter-009.mp3'),null,{timeout:15000});
  result.nextChapter=await audio.evaluate(el=>el.currentSrc);
  assert.ok(result.nextChapter.includes('chapter-009.mp3'));
  result.download=await page.locator('#zs-listening-download').getAttribute('href');
  assert.ok(result.download.includes('chapter-009.mp3'));
  results.push(result);console.log(JSON.stringify(result));await context.close();
 }
}finally{await browser.close();server.close();}
writeFileSync('v7-center-integration-results/report.json',JSON.stringify(results,null,2));
console.log('PASS: Release audio in isolated center, playback, seek, localStorage resume, next chapter; no production changes.');
