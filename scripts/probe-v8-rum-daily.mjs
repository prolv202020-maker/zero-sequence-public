#!/usr/bin/env node
/* V8 one-time diagnostic: pageview time series in one consistent daily-grouped query, no publishing. */
const token=process.env.CF_ANALYTICS_TOKEN||'',account=process.env.CF_ACCOUNT_ID||'';
if(!token||!/^[a-f0-9]{32}$/i.test(account)){console.error('V8 DAILY: INVALID_CONFIGURATION');process.exit(1)}
const now=new Date(),today=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()));
const start=new Date(today.getTime()-29*86400000);
const date=d=>d.toISOString().slice(0,10);
const from=date(start),through=date(today);
const query=`query V8Daily($account:string!,$host:string!,$from:Date!,$through:Date!){
 viewer{accounts(filter:{accountTag:$account}){
   days:rumPageloadEventsAdaptiveGroups(limit:31,orderBy:[date_ASC],filter:{requestHost:$host,requestPath_like:"/zero-sequence-public/%",date_geq:$from,date_leq:$through}){
    count dimensions{date}
   }
 }}
}`;
const c=new AbortController(),t=setTimeout(()=>c.abort(),16000);
let response;
try{response=await fetch('https://api.cloudflare.com/client/v4/graphql',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({query,variables:{account,host:'prolv202020-maker.github.io',from,through}}),signal:c.signal});}
catch{console.error('V8 DAILY: NETWORK_ERROR');process.exit(1)}finally{clearTimeout(t)}
if(!response.ok){console.error('V8 DAILY: HTTP_'+response.status);process.exit(1)}
const payload=await response.json();
if(payload.errors?.length){console.error('V8 DAILY: GRAPHQL_REJECTED');process.exit(1)}
const accounts=payload?.data?.viewer?.accounts;
if(!Array.isArray(accounts)||accounts.length!==1||!Array.isArray(accounts[0].days)){console.error('V8 DAILY: MALFORMED_RESULT');process.exit(1)}
const days=accounts[0].days,seen=new Set(),counts=Array(30).fill(0);
for(const item of days){
 const key=item.dimensions?.date;
 let n=Number(item.count);
 if(typeof key!=='string'||key<from||key>through||seen.has(key)||!Number.isSafeInteger(n)||n<0){console.error('V8 DAILY: INVALID_BUCKET');process.exit(1)}
 seen.add(key);
 const index=Math.round((Date.parse(key+'T00:00:00Z')-start.getTime())/86400000);
 if(index<0||index>=30){console.error('V8 DAILY: BUCKET_OUT_OF_RANGE');process.exit(1)}
 counts[index]=n;
}
const total=xs=>xs.reduce((sum,n)=>sum+n,0),todayCount=counts[29],week=total(counts.slice(-7)),month=total(counts);
console.log('V8 DAILY: DATE_BUCKET_QUERY_PASS count_of_days_with_events='+days.length+' based_on_UTC_calendar=true');
console.log('V8 DAILY: today='+todayCount+' last7days='+week+' last30days='+month);
console.log('V8 DAILY: monotonic='+String(todayCount<=week&&week<=month)+' total_events_may_be_adaptively_sampled');
console.log('V8 DAILY: no public file produced, Cloudflare RUM siteTag mismatch still blocks release.');
