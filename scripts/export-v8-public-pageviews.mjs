#!/usr/bin/env node
/* Zero Sequence V8: only account-scoped Cloudflare RUM page-load aggregates.
 * Output is a small public JSON payload. NO secret/reader data are exported.
 * All calendar windows use Asia/Kuala_Lumpur (UTC+08:00; no DST).
 */
import {mkdirSync,writeFileSync} from 'node:fs';
import {dirname} from 'node:path';
import assert from 'node:assert/strict';
const token=process.env.CF_ANALYTICS_TOKEN||'',account=process.env.CF_ACCOUNT_ID||'';
assert.ok(token&&/^[a-f0-9]{32}$/i.test(account),'Cloudflare account/token configuration missing');
const DAY=86400000,HOUR=3600000,OFFSET=8*HOUR,now=Date.now();
const klDayStart=Math.floor((now+OFFSET)/DAY)*DAY-OFFSET;
const start=klDayStart-29*DAY;
const query=`query V8PageviewHours($account:string!,$host:string!,$start:Time!,$end:Time!){
 viewer{accounts(filter:{accountTag:$account}){
  hours:rumPageloadEventsAdaptiveGroups(limit:900,orderBy:[datetimeHour_ASC],
   filter:{requestHost:$host,requestPath_like:"/zero-sequence-public/%",datetime_geq:$start,datetime_lt:$end}){
    count dimensions{datetimeHour}
   }
 }}
}`;
const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),17000);
let response;
try{
 response=await fetch('https://api.cloudflare.com/client/v4/graphql',{method:'POST',
 headers:{Authorization:'Bearer '+token,'Content-Type':'application/json',Accept:'application/json'},
 body:JSON.stringify({query,variables:{account,host:'prolv202020-maker.github.io',
 start:new Date(start).toISOString(),end:new Date(now).toISOString()}}),signal:controller.signal});
}catch{throw Error('Cloudflare analytics request failed')}finally{clearTimeout(timer)}
if(!response.ok)throw Error('Cloudflare analytics HTTP error '+response.status);
const raw=await response.json();
if(raw.errors?.length)throw Error('Cloudflare rejected query; no statistics published');
const accounts=raw?.data?.viewer?.accounts;
assert.ok(Array.isArray(accounts)&&accounts.length===1,'Unexpected Cloudflare account scope');
const hours=accounts[0].hours;
assert.ok(Array.isArray(hours)&&hours.length<900,'Hourly buckets exceed query limit or unavailable');
const seen=new Set(),daily=Array(30).fill(0);
for(const row of hours){
 const hour=row?.dimensions?.datetimeHour,count=Number(row?.count);
 const time=Date.parse(hour);
 assert.ok(typeof hour==='string'&&Number.isFinite(time)&&
   time>=start&&time<now&&time%HOUR===0,'Bad hourly bucket');
 assert.ok(Number.isSafeInteger(count)&&count>=0,'Invalid Cloudflare event count');
 assert.ok(!seen.has(time),'Duplicate hour');seen.add(time);
 const index=Math.floor((time+OFFSET)/DAY)-Math.floor((start+OFFSET)/DAY);
 assert.ok(index>=0&&index<30,'Hourly bucket outside Malaysia calendar window');
 daily[index]+=count;
 assert.ok(Number.isSafeInteger(daily[index]),'Counter overflow');
}
const sum=arr=>arr.reduce((a,b)=>a+b,0);
const today=daily[29],week=sum(daily.slice(-7)),month=sum(daily);
assert.ok(Number.isSafeInteger(month)&&today<=week&&week<=month,'Inconsistent page views');
if(month===0)throw Error('All pageview buckets empty; refusing to replace known data with zeros');
const payload={
 schema:'zs-public-traffic-v1',site:'zero-sequence-public',status:'verified',
 updatedAt:new Date(now).toISOString(),
 metrics:{unit:'page_views',todayPageViews:today,sevenDayPageViews:week,thirtyDayPageViews:month},
 metadata:{timeZone:'Asia/Kuala_Lumpur',source:'Cloudflare RUM adaptive page-load events',
  estimated:true,scope:'requestHost + requestPath_like /zero-sequence-public/%',
  periods:'today / 7 inclusive calendar days / 30 inclusive calendar days',
  description:'Page views; not unique people. Adaptive sampling may affect totals.'}
};
const output=process.env.V8_OUTPUT||'v8-traffic-results/public-traffic.json';
mkdirSync(dirname(output),{recursive:true});
writeFileSync(output,JSON.stringify(payload,null,2)+'\n');
console.log('V8 PUBLISHER PROBE: SUCCESS hourBuckets='+hours.length+' today='+today+' last7days='+week+' last30days='+month);
console.log('V8 PUBLISHER PROBE: data only; no user, account, token or secret details emitted.');
