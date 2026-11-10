#!/usr/bin/env node
/* V8 preview only. Never publish data while deployed beacon siteTag disagrees with RUM property.
   Auth in GitHub Actions Secrets; Cloudflare API called read-only, no identifiers logged. */
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const token=process.env.CF_ANALYTICS_TOKEN||'',account=process.env.CF_ACCOUNT_ID||'';
assert.ok(token&&/^[a-f0-9]{32}$/i.test(account),'Missing Cloudflare auth configuration');
const beacon=readFileSync('assets/js/visitor-analytics.js','utf8').match(/const CLOUDFLARE_SITE_TOKEN='([a-f0-9]{32})'/i)?.[1];
assert.ok(beacon,'Site beacon token unavailable');
const now=Date.now(),day=86400000,kl=8*3600000,midnight=Math.floor((now+kl)/day)*day-kl;
const vars={account,host:'prolv202020-maker.github.io',today:new Date(midnight).toISOString(),week:new Date(midnight-6*day).toISOString(),month:new Date(midnight-29*day).toISOString(),now:new Date(now).toISOString()};
const query=`query V8MetricsByProjectPath($account:string!,$host:string!,$today:Time!,$week:Time!,$month:Time!,$now:Time!){
 viewer{accounts(filter:{accountTag:$account}){
 today:rumPageloadEventsAdaptiveGroups(limit:1,filter:{requestHost:$host,requestPath_like:"/zero-sequence-public/%",datetime_geq:$today,datetime_lt:$now}){count}
 week:rumPageloadEventsAdaptiveGroups(limit:1,filter:{requestHost:$host,requestPath_like:"/zero-sequence-public/%",datetime_geq:$week,datetime_lt:$now}){count}
 month:rumPageloadEventsAdaptiveGroups(limit:1,filter:{requestHost:$host,requestPath_like:"/zero-sequence-public/%",datetime_geq:$month,datetime_lt:$now}){count}
 tags:rumPageloadEventsAdaptiveGroups(limit:10,orderBy:[count_DESC],filter:{requestHost:$host,requestPath_like:"/zero-sequence-public/%",datetime_geq:$month,datetime_lt:$now}){count dimensions{siteTag}}
 }}
}`;
const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),16000);
let response;try{
 response=await fetch('https://api.cloudflare.com/client/v4/graphql',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({query,variables:vars}),signal:ctrl.signal});
}catch{console.error('V8 PREVIEW: API_NETWORK_FAILED');process.exit(1)}finally{clearTimeout(timer)}
if(!response.ok){console.error('V8 PREVIEW: API_HTTP_'+response.status);process.exit(1)}
const raw=await response.json();
if(raw.errors?.length){console.error('V8 PREVIEW: GRAPHQL_QUERY_REJECTED');process.exit(1)}
const entries=raw?.data?.viewer?.accounts;
if(!Array.isArray(entries)||entries.length!==1){console.error('V8 PREVIEW: INVALID_ACCOUNT_SCOPE');process.exit(1)}
const r=entries[0],get=(key)=>{
 let g=r[key];if(!Array.isArray(g)||g.length>1){throw Error('Invalid metric group '+key)}
 let n=g.length?Number(g[0].count):0;
 assert.ok(Number.isSafeInteger(n)&&n>=0,'Invalid count '+key);
 return n;
};
const today=get('today'),week=get('week'),month=get('month');
console.log('V8 PREVIEW PROBE: scope counts (no publication): today='+today+' week='+week+' month='+month);\nif(!(today<=week&&week<=month)){console.error('V8 PREVIEW: PERIOD_TOTALS_INCONSISTENT; abort preview generation.');process.exit(1)}
const tags=r.tags;
assert.ok(Array.isArray(tags)&&tags.length<=10,'Tag dimension missing');
const sum=tags.reduce((s,g)=>s+Number(g.count),0);
assert.ok(Number.isSafeInteger(sum)&&sum>=0&&sum<=month,'Tag groups invalid');
if(sum!==month){console.error('V8 PREVIEW: GROUPS_INCOMPLETE — cannot verify property');process.exit(1)}
const matching=tags.length===1&&tags[0]?.dimensions?.siteTag===beacon;
const status=matching?'verified':'needs_site_tag_review';
const output={
 schema:'zs-public-traffic-v1',
 site:'zero-sequence-public',
 status,
 updatedAt:new Date(now).toISOString(),
 metrics:{unit:'page_views',todayPageViews:today,sevenDayPageViews:week,thirtyDayPageViews:month},
 metadata:{measurement:'Cloudflare RUM pageload events, may be sampled',timezone:'Asia/Kuala_Lumpur',scope:'requestHost and requestPath_like',beaconTagMatchesObserved:matching}
};
mkdirSync('v8-traffic-preview',{recursive:true});
writeFileSync('v8-traffic-preview/public-traffic-preview.json',JSON.stringify(output,null,2)+'\n');
console.log('V8 PREVIEW: scoped_page_views today='+today+' sevenDays='+week+' thirtyDays='+month);
console.log('V8 PREVIEW: property_tags='+tags.length+' deployed_beacon_matches='+matching+' status='+status);
console.log('V8 PREVIEW: Artifact only; website, main branch, secrets, and reader data unchanged.');
