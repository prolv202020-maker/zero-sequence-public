#!/usr/bin/env node
/* V8 release-gate: safety, UI and data contract. No external calls. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script,createContext} from 'node:vm';
const read=p=>readFileSync(p,'utf8');
const home=read('index.html'),css=read('assets/css/public-traffic-widget.css');
const widget=read('assets/js/public-traffic-widget.js');
const publisher=read('scripts/export-v8-public-pageviews.mjs');
const action=read('.github/workflows/v8-public-traffic.yml');
const prior=read('assets/js/visitor-analytics.js');
assert.equal((home.match(/data-zs-visitor-stats/g)||[]).length,1);
assert.equal((home.match(/id="volumes"/g)||[]).length,1);
assert.ok(home.includes('assets/js/visitor-analytics.js?v=1'));
assert.ok(home.includes('assets/js/public-traffic-widget.js?v=1'));
assert.ok(home.includes('assets/css/public-traffic-widget.css?v=1'));
assert.ok(home.includes('第1—300章')||home.includes('300章'));
for(const k of ['todayPageViews','sevenDayPageViews','thirtyDayPageViews']) assert.ok(home.includes('data-metric="'+k+'"'));
assert.ok(css.includes('@media(max-width:650px)'),'Mobile CSS required');
assert.ok(widget.includes('raw.githubusercontent.com/prolv202020-maker/zero-sequence-public/data/v8-traffic/public-traffic.json'));
assert.ok(widget.includes("data.status!=='verified'")&&widget.includes("data.metadata?.timeZone!=='Asia/Kuala_Lumpur'"));
assert.ok(!/Bearer|CF_ANALYTICS_TOKEN|api.cloudflare.com|localStorage/.test(widget),'Front-end must not include secrets or reader state');
assert.ok(action.includes("github.ref == 'refs/heads/main'")&&action.includes('data/v8-traffic'));
assert.ok(action.includes('schedule:')&&action.includes('contents: write'));
assert.ok(publisher.includes('/zero-sequence-public/%')&&publisher.includes("timeZone:'Asia/Kuala_Lumpur'"));
assert.ok(prior.includes('data-cf-beacon'),'Do not remove existing visitor beacon');
new Script(widget,{filename:'visitor-widget.js'});

async function browserMock(payload){
 const metrics={};
 const status={textContent:''};
 const root={querySelector(q){
  if(q==='[data-status]')return status;
  const m=q.match(/^\[data-metric="([^"]+)"\]$/);
  if(!m)return null;
  return metrics[m[1]]??(metrics[m[1]]={textContent:'—'});
 }};
 let calls=0;
 const context=createContext({
  document:{querySelector:q=>q==='[data-zs-visitor-stats]'?root:null},
  Date,Number,Intl,Promise,Math,
  fetch:async url=>{calls++;assert.ok(url.startsWith('https://raw.githubusercontent.com/'));return {ok:true,json:async()=>payload}}
 });
 new Script(widget).runInContext(context);
 await new Promise(resolve=>setTimeout(resolve,30));
 return {status:status.textContent,metrics,calls};
}
const good={schema:'zs-public-traffic-v1',site:'zero-sequence-public',status:'verified',
 updatedAt:new Date().toISOString(),metrics:{unit:'page_views',todayPageViews:8,sevenDayPageViews:30,thirtyDayPageViews:500},
 metadata:{timeZone:'Asia/Kuala_Lumpur',estimated:true}};
const ready=await browserMock(good);
assert.equal(ready.metrics.todayPageViews.textContent,'8');
assert.equal(ready.metrics.thirtyDayPageViews.textContent,'500');
assert.ok(ready.status.includes('Cloudflare'));
const bad=await browserMock({...good,status:'pending'});
assert.equal(bad.metrics.thirtyDayPageViews.textContent,'—');
assert.ok(bad.status.includes('暂未取得'));
const timezone=await browserMock({...good,metadata:{timeZone:'UTC',estimated:true}});
assert.equal(timezone.metrics.todayPageViews.textContent,'—');
console.log('V8 LAUNCH GATE PASS: main homepage unaffected except section, mobile CSS, safe JSON-only UI, no tokens, valid/invalid/timezone rendering, cron isolated from Pages.');
