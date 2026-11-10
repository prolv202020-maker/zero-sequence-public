#!/usr/bin/env node
/* Diagnostic: determine if live RUM events on the project path carry a different public siteTag. */
import {readFileSync} from 'node:fs';
const secret=process.env.CF_ANALYTICS_TOKEN,account=process.env.CF_ACCOUNT_ID;
if(!secret||!/^[a-f0-9]{32}$/i.test(account||'')){console.error('V8 TAG: MISSING_CONFIGURATION');process.exit(1)}
const source=readFileSync('assets/js/visitor-analytics.js','utf8').match(/const CLOUDFLARE_SITE_TOKEN='([a-f0-9]{32})'/i)?.[1];
if(!source){console.error('V8 TAG: SOURCE_TAG_NOT_FOUND');process.exit(1)}
const post=async (query,variables={})=>{
 const ctrl=new AbortController(),t=setTimeout(()=>ctrl.abort(),12000);
 let r;try{r=await fetch('https://api.cloudflare.com/client/v4/graphql',{method:'POST',headers:{Authorization:'Bearer '+secret,'Content-Type':'application/json'},body:JSON.stringify({query,variables}),signal:ctrl.signal})}catch{console.error('V8 TAG: NETWORK_ERROR');process.exit(1)}finally{clearTimeout(t)}
 if(!r.ok){console.error('V8 TAG: HTTP_'+r.status);process.exit(1)}
 const data=await r.json();
 if(data.errors?.length){console.error('V8 TAG: GRAPHQL_REJECTED');process.exit(1)}
 return data.data;
};
const introspection=await post('query{__type(name:"AccountRumPageloadEventsAdaptiveGroupsDimensions"){fields{name}}}');
const fields=introspection?.__type?.fields?.map(f=>f.name)||[];
if(!fields.includes('siteTag')){console.log('V8 TAG: SITE_TAG_DIMENSION_UNAVAILABLE; cannot safely diagnose property ID');process.exit(0)}
const end=new Date(),start=new Date(end.getTime()-30*86400000);
const query=`query SiteTagCompare($account:string!,$host:string!,$start:Time!,$end:Time!){
 viewer{accounts(filter:{accountTag:$account}){
  grouped:rumPageloadEventsAdaptiveGroups(limit:10,orderBy:[count_DESC],
   filter:{requestHost:$host,requestPath_like:"/zero-sequence-public/%",datetime_geq:$start,datetime_lt:$end}){
    count dimensions{siteTag}
   }
 }}
}`;
const data=await post(query,{account,host:'prolv202020-maker.github.io',start:start.toISOString(),end:end.toISOString()});
const a=data?.viewer?.accounts;
if(!Array.isArray(a)||a.length!==1||!Array.isArray(a[0].grouped)){console.error('V8 TAG: GROUP_DATA_MISSING');process.exit(1)}
const groups=a[0].grouped;
for(const [i,g] of groups.entries()){
 const tag=g.dimensions?.siteTag||'';
 const count=Number(g.count);
 if(!Number.isSafeInteger(count)||count<0){console.error('V8 TAG: INVALID_COUNT');process.exit(1)}
 console.log('V8 TAG: group_'+(i+1)+' views='+count+' matches_deployed_beacon='+(tag===source)+' site_tag_present='+/^[a-f0-9]{32}$/i.test(tag));
}
console.log('V8 TAG: grouped_site_tag_count='+groups.length+'; no full tags, token, or account identifier shown.');
console.log('V8 TAG: no data files or live site changed.');
