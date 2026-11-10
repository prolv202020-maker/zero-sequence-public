/* 第零序列 V8 · 仅展示 Cloudflare 汇总浏览量，无私密密钥、无追踪写入。 */
(() => {
  'use strict';
  const root=document.querySelector('[data-zs-visitor-stats]');
  if(!root)return;
  const source='https://raw.githubusercontent.com/prolv202020-maker/zero-sequence-public/v8-traffic-data/public-traffic.json';
  const keys=['todayPageViews','sevenDayPageViews','thirtyDayPageViews'];
  const elements=Object.fromEntries(keys.map(key=>[key,root.querySelector('[data-metric="'+key+'"]')]));
  const status=root.querySelector('[data-status]');
  const setStatus=text=>{if(status)status.textContent=text};
  const safeCount=n=>Number.isSafeInteger(n)&&n>=0&&n<=100000000000;
  async function read(){
    try{
      const response=await fetch(source+'?v='+Math.floor(Date.now()/300000),{cache:'no-store',mode:'cors',credentials:'omit'});
      if(!response.ok)throw Error('feed unavailable');
      const data=await response.json();
      if(data.schema!=='zs-public-traffic-v1'||data.site!=='zero-sequence-public'||
         data.status!=='verified'||data.metrics?.unit!=='page_views'||
         data.metadata?.timeZone!=='Asia/Kuala_Lumpur'||
         data.metadata?.estimated!==true||
         !keys.every(key=>safeCount(data.metrics[key])))throw Error('unverified feed');
      const stamp=Date.parse(data.updatedAt);
      if(!Number.isFinite(stamp)||stamp>Date.now()+600000||stamp<0)throw Error('invalid update time');
      keys.forEach(key=>{if(elements[key])elements[key].textContent=data.metrics[key].toLocaleString('zh-CN')});
      const fmt=new Date(stamp).toLocaleString('zh-CN',{timeZone:'Asia/Kuala_Lumpur',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
      const stale=Date.now()-stamp>24*3600000;
      setStatus((stale?'最近保存的统计 · ':'Cloudflare 估算数据 · ')+fmt+' 更新（马来西亚时间）');
    }catch(_){setStatus('访问数据暂未取得 · 正文阅读不受影响');}
  }
  read();
})();
