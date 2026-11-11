#!/usr/bin/env node
/* 第零序列 V6：Playwright Chromium desktop/mobile emulator acceptance. Local, isolated data. */
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,readFileSync,statSync,mkdirSync,writeFileSync,readdirSync} from 'node:fs';
import {resolve,join,sep,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const ROOT=resolve(fileURLToPath(new URL('../',import.meta.url)));
const OUT=join(ROOT,'v6-browser-results');mkdirSync(OUT,{recursive:true});
const PREFIX='/zero-sequence-public/';
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon','.mp3':'audio/mpeg','.woff2':'font/woff2'};
function createLocalServer(){return createServer((req,res)=>{
 let path;try{path=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname)}catch{res.writeHead(400).end();return;}
 if(!path.startsWith(PREFIX)){res.writeHead(404).end('outside root');return;}
 let file=resolve(ROOT,path.slice(PREFIX.length)||'index.html');
 if(!(file===ROOT||file.startsWith(ROOT+sep))){res.writeHead(403).end();return;}
 let st;try{if(statSync(file).isDirectory())file=join(file,'index.html');st=statSync(file);if(!st.isFile())throw Error();}
 catch{res.writeHead(404).end('missing');return;}
 const h={'Content-Type':mime[extname(file)]||'application/octet-stream','Accept-Ranges':'bytes','Cache-Control':'no-cache'};
 const range=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range||'');
 if(range){const start=Number(range[1]),end=range[2]?Math.min(st.size-1,Number(range[2])):st.size-1;
  if(start>=st.size||end<start){res.writeHead(416).end();return;}
  res.writeHead(206,{...h,'Content-Range':'bytes '+start+'-'+end+'/'+st.size,'Content-Length':end-start+1});
  if(req.method==='HEAD')res.end();else createReadStream(file,{start,end}).pipe(res);
 }else{res.writeHead(200,{...h,'Content-Length':st.size});if(req.method==='HEAD')res.end();else createReadStream(file).pipe(res);}
});}
const sc=readFileSync(join(ROOT,'assets/js/immersive-illustrations.js'),'utf8').match(/const SCENES=Object\.freeze\((\[[\s\S]*?\])\);/);
assert.ok(sc,'Scene manifest unavailable');const SCENES=JSON.parse(sc[1]);
assert.equal(SCENES.length,23,'23 immersive illustrations must remain');
assert.equal(readdirSync(join(ROOT,'assets/images/codex')).filter(x=>x.endsWith('.webp')).length,28,'28 unique CG files required');
const folders=readdirSync(join(ROOT,'chapters'),{withFileTypes:true}).filter(x=>x.isDirectory()&&/^volume-\d{2}$/.test(x.name));
const publishedVolumeCount=readdirSync(join(ROOT,'volumes')).filter(x=>/^volume-\d{2}\.html$/.test(x)).length;
assert.equal(folders.length,publishedVolumeCount);const readingPages=folders.reduce((n,x)=>n+readdirSync(join(ROOT,'chapters',x.name)).filter(p=>p.endsWith('.html')).length,0);
assert.equal(readingPages,1+publishedVolumeCount*10,'All published complete volumes and prologue required');
const host='http://127.0.0.1:48765'+PREFIX,url=p=>host+p.replace(/^\//,'');
const chapter=(v,n)=>'chapters/volume-'+String(v).padStart(2,'0')+'/chapter-'+String(n).padStart(3,'0')+'.html';
const report={version:'V6',date:new Date().toISOString(),type:'Chromium headless desktop/mobile emulation; local static Pages server (not physical phone)',inventory:{readingPages,volumeCount:publishedVolumeCount,visualCards:25,cgImages:28,immersive:23,audiobooks:130,prologueAudio:1},platforms:[],failures:[]};
const started=Date.now();let server,browser;
async function suite(context,label){
 const page=await context.newPage(),results={platform:label,steps:[],runtimeErrors:[],metrics:{}};let stepName='init';
 page.on('pageerror',e=>results.runtimeErrors.push({step:stepName,error:String(e)}));
 page.on('response',r=>{if(r.status()>=400&&r.url().startsWith(host))results.runtimeErrors.push({step:stepName,status:r.status(),url:r.url()});});
 const go=async p=>{const r=await page.goto(url(p),{waitUntil:'domcontentloaded',timeout:30000});assert.equal(r?.status(),200,'HTTP error '+p);};
 const app=async()=>page.waitForFunction(()=>!!window.ZSUnlock&&!!document.querySelector('#zs-audio'),null,{timeout:18000});
 const horizontal=async where=>{const a=await page.evaluate(()=>({w:document.documentElement.scrollWidth,v:window.innerWidth}));assert.ok(a.w<=a.v+6,'horizontal overflow in '+where+': '+JSON.stringify(a));};
 async function check(name,fn){stepName=name;let t=Date.now();try{await fn();results.steps.push({name,status:'pass',ms:Date.now()-t});console.log('[V6 '+label+'] PASS '+name);}
  catch(e){const error=String(e.stack||e).slice(0,2400);results.steps.push({name,status:'fail',ms:Date.now()-t,error});report.failures.push({platform:label,name,error});console.log('[V6 '+label+'] FAIL '+name+' '+error.slice(0,400));
   try{await page.screenshot({path:join(OUT,label+'-'+name+'.png'),timeout:5000});}catch{}}
 }
 await check('home',async()=>{
  await go('index.html');await app();assert.match(await page.title(),/第零序列/);
  assert.ok(await page.locator('a[href*="prologue"]').count()>0,'No prologue entry');
  assert.ok(await page.locator('a[href*="audiobooks.html"]').count()>0,'No audiobook entry');
  assert.equal(await page.locator('#zs-audio.is-playing').count(),0,'BGM autoplay');await horizontal('home');
  results.metrics.homeDCL=Math.round(await page.evaluate(()=>performance.getEntriesByType('navigation')[0]?.domContentLoadedEventEnd||0));
 });
 await check('fresh-chapter-reader-and-settings',async()=>{
  await go(chapter(1,1));await app();await page.locator('.zs-reader-fab').waitFor();
  assert.ok(await page.locator('.article > p').count()>=35,'Missing original prose');
  await page.locator('.zs-reader-fab').click();await page.locator('.zs-reader-panel:not([hidden])').waitFor();
  await page.locator('.zs-reader-panel').getByRole('button',{name:'A+'}).click();
  const font=await page.evaluate(()=>JSON.parse(localStorage.getItem('zs:reader:options:v1')).font);
  assert.ok(font>=17,'Reader settings not persisted');results.metrics.readerFont=font;
  await page.keyboard.press('Escape');await horizontal('fresh reader');
 });
 await check('chapter-narration-metadata',async()=>{
  await go(chapter(1,1));await page.locator('#zs-chapter-narration').waitFor();
  const src=await page.locator('#zs-chapter-narration source').getAttribute('src');
  assert.ok(src.includes('part-01/volume-01/chapter-001.mp3'));
  assert.ok(src.startsWith('https://raw.githubusercontent.com/prolv202020-maker/zero-sequence-public/audio-archive-v1/'),'Narration must reference archived MP3');
  const download=await page.locator('#zs-audiobook-player a[href*="raw.githubusercontent.com"]').first().getAttribute('href');
  assert.ok(download&&download.includes('/audio-archive-v1/'),'Narration download must use archive URL');
  results.metrics.audioArchive='audio-archive-v1'; // offline acceptance cannot validate external streaming
  await page.locator('#zs-chapter-narration').evaluate(el=>el.dispatchEvent(new Event('play')));
  await page.waitForFunction(()=>document.querySelector('#zs-chapter-narration-status')?.textContent.includes('正在播放'));
  assert.equal(await page.locator('#zs-audio.is-playing').count(),0);
 });
 await check('independent-parts-and-reading-resume',async()=>{
  await go(chapter(1,1));await app();await page.locator('.zs-unlock-button').waitFor();await page.locator('.zs-unlock-button').click();
  let p=await page.evaluate(()=>[1,2,3].map(x=>window.ZSUnlock.get(x).max));assert.deepEqual(p,[1,0,0]);
  await go(chapter(11,1));await app();await page.locator('.zs-unlock-button').waitFor();await page.locator('.zs-unlock-button').click();
  p=await page.evaluate(()=>[1,2,3].map(x=>window.ZSUnlock.get(x).max));assert.deepEqual(p,[1,1,0]);
  await page.evaluate(()=>window.scrollTo(0,Math.min(1300,document.documentElement.scrollHeight-500)));
  await page.waitForFunction(()=>{let x=JSON.parse(localStorage.getItem('zs:reader:last:v1')||'null');return !!x?.url?.includes('chapter-001.html')&&x.percent>0;},null,{timeout:12000});
  await go('index.html');await app();let last=await page.evaluate(()=>JSON.parse(localStorage.getItem('zs:reader:last:v1')));
  assert.ok(last.url.includes('/chapters/volume-11/chapter-001.html'));
 });
 await check('locked-visual-catalog-no-image-leak',async()=>{
  let n=0;const cb=req=>{if(req.url().includes('/assets/images/codex/'))n++;};page.on('request',cb);
  await go('archive/visual-codex.html');await page.locator('.zs-visual-card').first().waitFor();
  assert.equal(await page.locator('.zs-visual-card').count(),25);
  assert.equal(await page.locator('.zs-visual-art img').count(),0);
  assert.equal(n,0,'Locked CG made network requests');page.off('request',cb);await horizontal('visual catalog');
 });
 await check('unlocked-cg-and-fullscreen',async()=>{
  await page.evaluate(()=>{window.ZSUnlock.set(1,100,false);window.ZSUnlock.set(2,100,false);window.ZSUnlock.set(3,100,false)});
  await page.waitForFunction(()=>document.querySelectorAll('.zs-visual-art img').length===25,null,{timeout:12000});
  assert.equal(await page.locator('.zs-visual-variant-art img').count(),3);
  await page.locator('.zs-visual-art').first().click();await page.locator('dialog.zs-cg-lightbox[open]').waitFor();
  assert.ok((await page.locator('dialog.zs-cg-lightbox img').getAttribute('src')).endsWith('.webp'));
  await page.locator('.zs-cg-lightbox-close').click();assert.equal(await page.locator('dialog.zs-cg-lightbox[open]').count(),0);
  await page.locator('.zs-visual-art img').first().scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>document.querySelector('.zs-visual-art img')?.naturalWidth>0,null,{timeout:15000});
  await horizontal('visual catalog unlocked');
 });
 await check('equipment-items-and-materials',async()=>{
  await go('archive/equipment.html');await page.locator('.pa-artwork-card').first().waitFor();
  assert.equal(await page.locator('.pa-artwork-card').count(),9);
  await page.locator('#pa-equipment-kind').selectOption('武器');assert.equal(await page.locator('.pa-artwork-card').count(),4);
  await page.locator('#pa-equipment-kind').selectOption('装备');assert.equal(await page.locator('.pa-artwork-card').count(),5);
  await page.locator('#pa-equipment-kind').selectOption('all');assert.equal(await page.locator('.pa-artwork-view img').count(),1);
  await page.locator('a.pa-artwork-link[href*="?art="]').first().click();assert.ok(page.url().includes('visual-codex.html?art='));
  await go('archive/items.html');assert.equal(await page.locator('.pa-artwork-card').count(),4);assert.equal(await page.locator('.pa-artwork-view img').count(),2);
  await go('archive/materials.html');assert.equal(await page.locator('.pa-artwork-card').count(),2);await horizontal('materials');
 });
 await check('23-immersive-chapter-scenes',async()=>{
  const groups=new Map();for(const s of SCENES){const key=chapter(s.v,s.n);groups.set(key,(groups.get(key)||0)+1);}
  let total=0;for(const [path,n] of groups){await go(path);await page.waitForFunction(x=>document.querySelectorAll('.zs-story-illustration').length===x,n,{timeout:15000});
   total+=await page.locator('.zs-story-illustration').count();await horizontal(path);}
  assert.equal(total,23);results.metrics.immersiveRendered=total;
  await go(chapter(25,3));await page.locator('.zs-story-illustration-open').first().click();
  await page.locator('dialog.zs-illustration-lightbox[open]').waitFor();await page.keyboard.press('Escape');
  assert.equal(await page.locator('dialog.zs-illustration-lightbox[open]').count(),0);
 });
 await check('chapter-cg-collapse-and-volume-boundaries',async()=>{
  await go(chapter(25,3));await page.locator('.zs-chapter-cg-item img').first().waitFor();
  assert.equal(await page.locator('.zs-chapter-cg-item img').count(),2);
  await page.locator('.zs-chapter-cg-toggle').click();assert.equal(await page.locator('.zs-chapter-cg-item img').count(),0);
  await page.getByRole('button',{name:'展开本章CG'}).click();assert.equal(await page.locator('.zs-chapter-cg-item img').count(),2);
  await go(chapter(10,10));await page.locator('.pager a').last().click();assert.ok(page.url().endsWith('/chapters/volume-11/chapter-001.html'));
  await go(chapter(20,10));await page.locator('.pager a').last().click();assert.ok(page.url().endsWith('/chapters/volume-21/chapter-001.html'));
  await go(chapter(30,10));assert.equal(await page.locator('.pager a[href*="volume-31"]').count(),1);await go(chapter(31,10));assert.equal(await page.locator('.pager a[href*="volume-32"]').count(),1);await go(chapter(32,1));assert.equal(await page.locator('.pager a[href*="chapter-002.html"]').count(),1);await go(chapter(32,10));assert.equal(await page.locator('.pager a[href*="volume-33"]').count(),1);await go(chapter(33,10));assert.equal(await page.locator('.pager a[href*="volume-34"]').count(),1);await go(chapter(34,10));assert.equal(await page.locator('.pager a[href*="volume-35"]').count(),1);await go(chapter(35,10));assert.equal(await page.locator('.pager a[href*="volume-36/chapter-001.html"]').count(),1);await go(chapter(36,10));assert.equal(await page.locator('.pager a[href*="volume-37/chapter-001.html"]').count(),1);await go(chapter(37,10));assert.equal(await page.locator('.pager a[href*="volume-38/chapter-001.html"]').count(),1);await go(chapter(38,10));assert.equal(await page.locator('.pager a[href*="chapter-011.html"]').count(),0);
 });
 await check('audiobook-center-navigation',async()=>{
  await go('audiobooks.html');await page.locator('#zs-listening-audio').waitFor();
  await page.waitForFunction(()=>document.querySelectorAll('[data-volume]').length===30,null,{timeout:15000});
  assert.equal(await page.locator('[data-volume]').count(),30);assert.equal(await page.locator('#zs-listening-audio[autoplay]').count(),0);
  await horizontal('audiobooks');
 });
 if(label==='mobile')await check('mobile-bgm-and-reader-panel',async()=>{
  await go(chapter(1,1));await app();await page.locator('.zs-audio-expand').click();
  assert.equal(await page.locator('#zs-audio.zs-audio-expanded').count(),1);
  await page.locator('.zs-reader-fab').click();assert.equal(await page.locator('#zs-audio.zs-audio-expanded').count(),0);
  assert.equal(await page.locator('.zs-reader-panel').isVisible(),true);await horizontal('mobile reader');
 });
 for(const err of results.runtimeErrors){report.failures.push({platform:label,name:'runtime',error:err});}
 report.platforms.push(results);await context.close();
}
try{
 server=createLocalServer();await new Promise((ok,fail)=>{server.once('error',fail);server.listen(48765,'127.0.0.1',ok)});
 browser=await chromium.launch({headless:true,args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
 await suite(await browser.newContext({viewport:{width:1366,height:800},deviceScaleFactor:1,serviceWorkers:'allow'}),'desktop');
 await suite(await browser.newContext({viewport:{width:393,height:852},deviceScaleFactor:2,isMobile:true,hasTouch:true,serviceWorkers:'allow'}),'mobile');
}catch(e){report.failures.push({platform:'runner',name:'fatal',error:String(e.stack||e)});}finally{
 report.totalDurationMs=Date.now()-started;if(browser)await browser.close().catch(()=>{});
 if(server)await new Promise(r=>server.close(r));
 writeFileSync(join(OUT,'summary.json'),JSON.stringify(report,null,2));
}
console.log('[V6] '+(report.failures.length?'FAIL':'PASS')+' failures='+report.failures.length+' duration='+report.totalDurationMs+'ms');
if(report.failures.length)process.exitCode=1;