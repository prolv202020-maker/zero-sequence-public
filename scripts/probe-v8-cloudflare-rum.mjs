#!/usr/bin/env node
/* V8 read-only Cloudflare Web Analytics scoping probe.
   Never writes a public JSON or logs credentials/account identifiers. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const token=process.env.CF_ANALYTICS_TOKEN||'';
const account=process.env.CF_ACCOUNT_ID||'';
const host='prolv202020-maker.github.io';
const pathPrefix='/zero-sequence-public/';
if(!token){console.error('V8: TOKEN_MISSING');process.exit(1)}
if(!/^[a-f0-9]{32}$/i.test(account)){console.error('V8: ACCOUNT_ID_MISSING_OR_INVALID');process.exit(1)}
const contents=readFileSync('assets/js/visitor-analytics.js','utf8');
const match=contents.match(/const CLOUDFLARE_SITE_TOKEN='([a-f0-9]{32})'/i);
if(!match){console.error('V8: PUBLIC_SITE_TAG_MISSING');process.exit(1)}
const siteTag=match[1];
async function graphql(query,variables={}){
  const control=new AbortController();
  const timer=setTimeout(()=>control.abort(),18000);
  let response;
  try{
    response=await fetch('https://api.cloudflare.com/client/v4/graphql',{
      method:'POST',
      headers:{Authorization:'Bearer '+token,'Content-Type':'application/json',Accept:'application/json'},
      body:JSON.stringify({query,variables}),
      signal:control.signal
    });
  }catch(e){console.error('V8: GRAPHQL_NETWORK_FAILED '+(e.name==='AbortError'?'TIMEOUT':'UNAVAILABLE'));process.exit(1)}
  finally{clearTimeout(timer)}
  if(!response.ok){console.error('V8: GRAPHQL_HTTP_ERROR '+response.status);process.exit(1)}
  let data;
  try{data=await response.json()}catch{console.error('V8: GRAPHQL_NON_JSON');process.exit(1)}
  if(Array.isArray(data.errors)&&data.errors.length){
    // Do not print raw error text, potentially private query information.
    const msg=data.errors.map(e=>String(e.message||'')).join(' ');
    const cause=msg.includes('requestPath_like')?'UNSUPPORTED_PATH_FILTER':msg.includes('rumPageloadEventsAdaptiveGroups')?'DATASET_NOT_AVAILABLE':msg.includes('siteTag')?'SITETAG_FILTER_UNAVAILABLE':msg.includes('requestHost')?'HOST_FILTER_UNAVAILABLE':'QUERY_REJECTED';
    console.error('V8: GRAPHQL_'+cause+' errorCount='+data.errors.length);
    process.exit(1);
  }
  return data.data;
}
const schema=await graphql('query V8FilterCapability{__type(name:"AccountRumPageloadEventsAdaptiveGroupsFilter_InputObject"){inputFields{name}}}');
const fields=schema?.__type?.inputFields?.map(x=>x.name);
if(!Array.isArray(fields)){console.error('V8: GRAPHQL_FILTER_SCHEMA_UNAVAILABLE');process.exit(1)}
const required=['siteTag','requestHost','requestPath_like','datetime_geq','datetime_lt'];
const missing=required.filter(x=>!fields.includes(x));
if(missing.length){console.error('V8: REQUIRED_SCOPE_FILTERS_NOT_SUPPORTED '+missing.join(','));process.exit(1)}
console.log('V8: FILTER_SCHEMA_PASS (siteTag + requestHost + requestPath_like + datetime).');
const now=new Date();
const toISO=t=>new Date(t).toISOString().replace(/\.\d{3}Z$/,'Z');
const klOffset=8*3600000;
const klMidnight=Math.floor((now.getTime()+klOffset)/86400000)*86400000-klOffset;
const vars={account,siteTag,host,now:toISO(now),today:toISO(klMidnight),week:toISO(klMidnight-6*86400000),month:toISO(klMidnight-29*86400000)};
const query=`query V8ReadOnlyPageviews($account: string!, $siteTag: string!, $host: string!, $today: Time!, $week: Time!, $month: Time!, $now: Time!) {
 viewer {
  accounts(filter:{accountTag:$account}) {
   today:rumPageloadEventsAdaptiveGroups(limit:1,filter:{siteTag:$siteTag,requestHost:$host,requestPath_like:"/zero-sequence-public/%",datetime_geq:$today,datetime_lt:$now}){count}
   week:rumPageloadEventsAdaptiveGroups(limit:1,filter:{siteTag:$siteTag,requestHost:$host,requestPath_like:"/zero-sequence-public/%",datetime_geq:$week,datetime_lt:$now}){count}
   month:rumPageloadEventsAdaptiveGroups(limit:1,filter:{siteTag:$siteTag,requestHost:$host,requestPath_like:"/zero-sequence-public/%",datetime_geq:$month,datetime_lt:$now}){count}
  }
 }
}`;
const data=await graphql(query,vars);
const accounts=data?.viewer?.accounts;
if(!Array.isArray(accounts)||accounts.length!==1){console.error('V8: ACCOUNT_QUERY_NOT_EXACTLY_ONE');process.exit(1)}
const only=accounts[0];
const metric=(key)=>{
  const groups=only[key];
  if(!Array.isArray(groups)||groups.length>1){console.error('V8: UNEXPECTED_'+key+'_GROUPS');process.exit(1)}
  let count=groups.length?groups[0].count:0;
  // Some large counters may be encoded as decimal strings.
  if(typeof count==='string'&&/^\d+$/.test(count))count=Number(count);
  assert.ok(Number.isSafeInteger(count)&&count>=0,'Non-negative safe counter expected');
  return count;
};
const today=metric('today'),week=metric('week'),month=metric('month');
if(today>week||week>month){console.error('V8: COUNTS_NOT_MONOTONIC (likely incomplete sampling or unexpected query)');process.exit(1)}
console.log('V8: READ_ONLY_DATA_SUCCESS scope=siteTag+host+pathPrefix; period=Malaysia calendar; unit=Cloudflare_RUM_pageview_events');
console.log('V8: VERIFIED_AGGREGATES today='+today+' last7days='+week+' last30days='+month);
console.log('V8: NO_PUBLICATION, NO_SITE_CHANGES, NO_PRIVATE_IDENTIFIERS_LOGGED');
