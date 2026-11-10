#!/usr/bin/env node
// V8 token preflight: never log, print, upload or store secret values.
const token=process.env.CF_ANALYTICS_TOKEN;
if(!token){console.error('V8 AUTH: MISSING_GITHUB_SECRET (CF_ANALYTICS_TOKEN).');process.exitCode=1;}
else{
 try {
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),12000);
  let response;
  try {
   response=await fetch('https://api.cloudflare.com/client/v4/user/tokens/verify',{
    method:'GET',
    headers:{Authorization:'Bearer '+token,Accept:'application/json'},
    signal:controller.signal
   });
  }finally{clearTimeout(timeout)}
  let body={};
  try{body=await response.json();}catch{}
  if(response.ok && body.success===true && body.result?.status==='active'){
    console.log('V8 AUTH: PASS (Cloudflare confirms active API token; no token value exposed).');
  }else if(response.ok && body.success===true){
    console.error('V8 AUTH: TOKEN_NOT_ACTIVE (status omitted for privacy).');
    process.exitCode=1;
  }else{
    console.error('V8 AUTH: FAILED (HTTP '+response.status+'). Check only CF_ANALYTICS_TOKEN secret and token expiry.');
    process.exitCode=1;
  }
 }catch(e){console.error('V8 AUTH: NETWORK_ERROR ('+(e.name==='AbortError'?'timeout':'API unavailable')+').');process.exitCode=1;}
}
if(!process.env.CF_ACCOUNT_ID){
 console.log('V8 DATA: BLOCKED_ACCOUNT_ID_REQUIRED. Set GitHub Actions repository variable CF_ACCOUNT_ID (Cloudflare account ID, not secret token).');
}else if(!/^[a-f0-9]{32}$/i.test(process.env.CF_ACCOUNT_ID)){
 console.error('V8 DATA: INVALID_ACCOUNT_ID_FORMAT. Expected 32 hex chars.');process.exitCode=1;
}else{
 console.log('V8 DATA: ACCOUNT_ID_FORMAT_OK; analytics query not yet enabled pending siteTag scope validation.');
}
console.log('V8 SAFETY: no public JSON generated, no live site edited, no secret value logged.');
