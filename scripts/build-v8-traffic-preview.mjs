#!/usr/bin/env node
/* V8 preview artifact only. Never publish before verified Cloudflare property and manual approval. */
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const token=process.env.CF_ANALYTICS_TOKEN||'',account=process.env.CF_ACCOUNT_ID||'';
assert.ok(token&&/^[a-f0-9]{32}$/i.test(account),'Missing read-only Cloudflare token/account variable');
const beacon=readFileSync('assets/js/visitor-analytics.js','utf8').match(/const CLOUDFLARE_SITE_TOKEN='([a-f0-9]{32})'/i)?.[1];
assert.ok(beacon,'Public beacon token not found');
const dayMs=86400000,now=new Date(),utcToday=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()));
const utcStart=new Date(utcToday.getTime()-29*dayMs),asDate=d=>d.toISOString().slice(0,10);
const from=asDate(utcStart),through=asDate(utcToday);
const query=`query V8DailyPreview($account:string!,$host:string!,$from:Date!,$through:Date!){
 viewer{accounts(filter:{accountTag:$account}){
  days:rumPageloadEventsAdaptiveGroups(limit:31,orderBy:[date_ASC],
   filter:{requestHost:$host,requestPath_like:"/zero-sequence-public/%",date_geq:$from,date_leq:$through}){
    count dimensions{date}
   }
  tags:rumPageloadEventsAdaptiveGroups(limit:10,orderBy:[count_DESC],
   filter:{requestHost:$host,requestPath_like:"/zero-sequence-public/%",date_geq:$from,date_leq:$through}){
    count dimensions{siteTag}
   }
 }}
}`;
const controller=new AbortController(),t=setTimeout(()=>controller.abort(),16000);
let response;
try{response=await fetch('https://api.cloudflare.com/client/v4/graphql',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({query,variables:{account,host:'prolv202020-maker.github.io',from,through}}),signal:controller.signal})}
catch{console.error('V8 PREVIEW: NETWORK_FAILURE');process.exit(1)}finally{clearTimeout(t)}
if(!response.ok){console.error('V8 PREVIEW: HTTP_'+response.status);process.exit(1)}
const payload=await response.json();
if(payload.errors?.length){console.error('V8 PREVIEW: GRAPHQL_REJECTED');process.exit(1)}
const accounts=payload?.data?.viewer?.accounts;
if(!Array.isArray(accounts)||accounts.length!==1){console.error('V8 PREVIEW: ACCOUNT_SCOPE_INVALID');process.exit(1)}
const {days,tags}=accounts[0];
if(!Array.isArray(days)||days.length>30||!Array.isArray(tags)||tags.length>10){console.error('V8 PREVIEW: UNEXPECTED_GROUPS');process.exit(1)}
const daily=Array(30).fill(0),seen=new Set();
for(const entry of days){
 const key=entry.dimensions?.date,n=Number(entry.count);
 if(typeof key!=='string'||key<from||key>through||seen.has(key)||!Number.isSafeInteger(n)||n<0){console.error('V8 PREVIEW: INVALID_DAY');process.exit(1)}
 seen.add(key);
 const ix=(Date.parse(key+'T00:00:00Z')-utcStart.getTime())/dayMs;
 if(!Number.isInteger(ix)||ix<0||ix>=30){console.error('V8 PREVIEW: INVALID_DAY_OFFSET');process.exit(1)}
 daily[ix]=n;
}
const sum=arr=>arr.reduce((s,n)=>s+n,0);
const today=daily[29],week=sum(daily.slice(-7)),month=sum(daily);
assert.ok(today<=week&&week<=month,'Derived windows must be monotonic');
const tagged=tags.map(x=>({tag:x.dimensions?.siteTag,count:Number(x.count)}));
if(tagged.some(x=>!Number.isSafeInteger(x.count)||x.count<0)){console.error('V8 PREVIEW: INVALID_SITE_TAG_GROUP');process.exit(1)}
const beaconMatches=tagged.length===1&&tagged[0].tag===beacon;
const out={
 schema:'zs-public-traffic-v1',site:'zero-sequence-public',
 status:beaconMatches?'pending_human_review':'needs_site_tag_review',
 updatedAt:now.toISOString(),
 metrics:{unit:'page_views',todayPageViews:today,sevenDayPageViews:week,thirtyDayPageViews:month},
 metadata:{timeZone:'UTC',source:'Cloudflare RUM AdaptiveGroups; sampling possible',
  siteScope:'requestHost and requestPath_like',beaconMatchesObservedProperty:beaconMatches,
  note:'PREVIEW ONLY — NOT APPROVED FOR PUBLICATION'}
};
mkdirSync('v8-traffic-preview',{recursive:true});
writeFileSync('v8-traffic-preview/public-traffic-preview.json',JSON.stringify(out,null,2)+'\n');
console.log('V8 PREVIEW: UTC_daily_aggregates today='+today+' last7days='+week+' last30days='+month);
console.log('V8 PREVIEW: beacon_matches='+beaconMatches+' approval_status='+out.status);
console.log('V8 PREVIEW: preview artifact only; no production publication, no credentials included.');
