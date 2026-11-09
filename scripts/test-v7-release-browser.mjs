#!/usr/bin/env node
// V7: real Chrome HTMLAudioElement integration check against GitHub Release asset.
import {chromium,devices} from 'playwright';
import {createServer} from 'node:http';
import {writeFileSync,mkdirSync} from 'node:fs';
const URL='https://github.com/prolv202020-maker/zero-sequence-public/releases/download/audio-v7-onefile-pilot-20261109/chapter-008.mp3';
const results=[];mkdirSync('v7-browser-results',{recursive:true});
const server=createServer((req,res)=>{res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Access-Control-Allow-Origin':'*'});res.end('<!doctype html><html><body><button id="play">Play</button><audio id="a" preload="metadata" controls></audio></body></html>')});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const address='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,args:['--autoplay-policy=no-user-gesture-required']});
try {
  for(const kind of ['desktop-chromium','mobile-chromium']){
    const ctx=await browser.newContext(kind.startsWith('mobile')?{...devices['Pixel 7'],acceptDownloads:true}:{acceptDownloads:true});
    const page=await ctx.newPage();const errors=[];
    page.on('console',m=>{if(m.type()==='error')errors.push('console:'+m.text())});
    page.on('pageerror',e=>errors.push('page:'+e.message));
    await page.goto(address);
    const result={kind,source:URL};
    await page.locator('#a').evaluate((el,src)=>{el.src=src;el.load()},URL);
    try{await page.waitForFunction(()=>{const a=document.querySelector('#a');return a.readyState>=1||a.error!==null},{timeout:20000});}catch{}
    Object.assign(result,await page.locator('#a').evaluate(a=>({readyState:a.readyState,networkState:a.networkState,errorCode:a.error?.code||null,errorMessage:a.error?.message||null,duration:a.duration||null,source:a.currentSrc})));
    if(result.readyState>=1&&!result.errorCode){
      try{
        await page.locator('#play').click();
        await page.locator('#a').evaluate(async a=>{await a.play()});
        await page.waitForTimeout(1200);
        result.playing=await page.locator('#a').evaluate(a=>!a.paused&&a.currentTime>0);
        result.seek=await page.locator('#a').evaluate(async a=>{const t=Math.min(12,Math.floor(a.duration/2));a.currentTime=t;await new Promise(r=>setTimeout(r,1200));return {target:t,currentTime:a.currentTime,seekable:a.seekable.length}});
      }catch(e){result.playError=String(e)}
    }
    result.consoleErrors=errors.slice(0,8);results.push(result);console.log(JSON.stringify(result));await ctx.close();
  }
}finally{await browser.close();server.close()}
writeFileSync('v7-browser-results/browser-results.json',JSON.stringify(results,null,2));
if(results.some(r=>!r.playing||!r.seek||Math.abs(r.seek.currentTime-r.seek.target)>3))process.exitCode=1;
