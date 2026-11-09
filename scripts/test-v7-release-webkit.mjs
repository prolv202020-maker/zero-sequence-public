#!/usr/bin/env node
/* V7 Safari-engine compatibility preflight, browser emulation only. Never modify production. */
import {webkit,devices} from 'playwright';
import {createServer} from 'node:http';
import {mkdirSync,writeFileSync} from 'node:fs';
const audioUrl='https://github.com/prolv202020-maker/zero-sequence-public/releases/download/audio-v7-onefile-pilot-20261109/chapter-008.mp3';
const server=createServer((_req,res)=>{res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end('<!doctype html><html><body><button id="start" onclick="document.querySelector(\'#audio\').play()">Play audio</button><audio id="audio" controls preload="metadata"></audio></body></html>')});
await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
const url='http://127.0.0.1:'+server.address().port;
const browser=await webkit.launch({headless:true});
mkdirSync('v7-webkit-results',{recursive:true});
const results=[];
try {
 for(const mode of ['webkit-desktop','webkit-iphone-emulation']){
  const context=await browser.newContext(mode.includes('iphone')?{...devices['iPhone 13'],acceptDownloads:true}:{acceptDownloads:true});
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url);
  await page.locator('#audio').evaluate((a,src)=>{a.src=src;a.load()},audioUrl);
  try{await page.waitForFunction(()=>{const a=document.querySelector('#audio');return a.readyState>=1||!!a.error},null,{timeout:25000});}catch(e){errors.push('metadata timeout: '+e.message)}
  const result={mode,metadata:await page.locator('#audio').evaluate(a=>({readyState:a.readyState,error:a.error?.message||null,duration:a.duration}))};
  if(result.metadata.readyState>=1&&!result.metadata.error){
   try{
    await page.locator('#start').click();
    await page.waitForTimeout(1500);
    result.playing=await page.locator('#audio').evaluate(a=>!a.paused&&a.currentTime>0);
    result.seek=await page.locator('#audio').evaluate(async a=>{
     a.currentTime=12;await new Promise(resolve=>setTimeout(resolve,1400));
     return {currentTime:a.currentTime,seekable:a.seekable.length,error:a.error?.message||null};
    });
   }catch(e){errors.push('play/seek: '+e.message)}
  }
  result.errors=errors;results.push(result);console.log(JSON.stringify(result));await context.close();
 }
}finally{await browser.close();server.close()}
writeFileSync('v7-webkit-results/report.json',JSON.stringify(results,null,2)+'\n');
if(results.some(r=>!r.playing||!r.seek||Math.abs(r.seek.currentTime-12)>4||r.metadata.error||r.errors.length))process.exitCode=1;
