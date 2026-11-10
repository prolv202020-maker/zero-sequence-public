#!/usr/bin/env node
/* V8 one-time diagnostic: inspect only aggregate RUM counts, do not print user paths/identifiers. */
import {readFileSync} from 'node:fs';
const token=process.env.CF_ANALYTICS_TOKEN||'';
const account=process.env.CF_ACCOUNT_ID||'';
if(!token||!/^[a-f0-9]{32}$/i.test(account)){console.error('V8 DIAGNOSTIC: MISSING_OR_INVALID_AUTH_CONFIGURATION');process.exit(1)}
const match=readFileSync('assets/js/visitor-analytics.js','utf8').match(/const CLOUDFLARE_SITE_TOKEN='([a-f0-9]{32})'/i);
if(!match){console.error('V8 DIAGNOSTIC: NO_PUBLIC_SITE_TAG');process.exit(1)}
const tag=match[1];
const now=new Date(),before=new Date(now.getTime()-30*86400000);
const query=`query V8SiteScope($account: string!, $tag: string!, $host: string!, $start: Time!, $end: Time!) {
 viewer {
  accounts(filter:{accountTag:$account}) {
    all:rumPageloadEventsAdaptiveGroups(limit:1,filter:{datetime_geq:$start,datetime_lt:$end}) {count}
    site:rumPageloadEventsAdaptiveGroups(limit:1,filter:{siteTag:$tag,datetime_geq:$start,datetime_lt:$end}) {count}
    host:rumPageloadEventsAdaptiveGroups(limit:1,filter:{requestHost:$host,datetime_geq:$start,datetime_lt:$end}) {count}
    siteHost:rumPageloadEventsAdaptiveGroups(limit:1,filter:{siteTag:$tag,requestHost:$host,datetime_geq:$start,datetime_lt:$end}) {count}
    siteHostPath:rumPageloadEventsAdaptiveGroups(limit:1,filter:{siteTag:$tag,requestHost:$host,requestPath_like:"/zero-sequence-public/%",datetime_geq:$start,datetime_lt:$end}) {count}
  }
 }
}`;
const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),15000);
let response;
try{
 response=await fetch('https://api.cloudflare.com/client/v4/graphql',{method:'POST',signal:ctrl.signal,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({query,variables:{account,tag,host:'prolv202020-maker.github.io',start:before.toISOString(),end:now.toISOString()}})});
}catch(e){console.error('V8 DIAGNOSTIC: NETWORK_ERROR');process.exit(1)}finally{clearTimeout(timer)}
if(!response.ok){console.error('V8 DIAGNOSTIC: HTTP_ERROR '+response.status);process.exit(1)}
let x;try{x=await response.json()}catch{console.error('V8 DIAGNOSTIC: BAD_RESPONSE');process.exit(1)}
if(x.errors?.length){console.error('V8 DIAGNOSTIC: GRAPHQL_QUERY_REJECTED');process.exit(1)}
const a=x?.data?.viewer?.accounts;
if(!Array.isArray(a)||a.length!==1){console.error('V8 DIAGNOSTIC: ACCOUNT_SCOPE_MISMATCH');process.exit(1)}
const keys=['all','site','host','siteHost','siteHostPath'];
const counts={};
for(const k of keys){
 const g=a[0][k];if(!Array.isArray(g)||g.length>1){console.error('V8 DIAGNOSTIC: UNEXPECTED_GROUP_SHAPE');process.exit(1)}
 const n=g.length?Number(g[0].count):0;
 if(!Number.isSafeInteger(n)||n<0){console.error('V8 DIAGNOSTIC: INVALID_COUNT');process.exit(1)}
 counts[k]=n;
}
console.log('V8 DIAGNOSTIC 30-day aggregates (no identifiers logged):',JSON.stringify(counts));
let outcome;
if(counts.all===0)outcome='NO_ACCOUNT_WEB_ANALYTICS_EVENTS_IN_WINDOW';
else if(counts.site===0)outcome='PUBLIC_SITE_TAG_NO_EVENTS_BUT_ACCOUNT_HAS_DATA';
else if(counts.siteHost===0)outcome='SITE_TAG_HAS_EVENTS_BUT_HOST_FILTER_EMPTY';
else if(counts.siteHostPath===0)outcome='SITE_TAG_AND_HOST_HAVE_EVENTS_BUT_PROJECT_PATH_EMPTY';
else outcome='PROJECT_EVENTS_PRESENT';
console.log('V8 DIAGNOSTIC OUTCOME:',outcome);
console.log('V8 SAFETY: NO PUBLIC DATA WRITTEN, NO MAIN CHANGES, NO CREDENTIALS LOGGED');
