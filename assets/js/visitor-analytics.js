/* 第零序列 · 可选的隐私友好访问统计。默认关闭，直到作者填入 Cloudflare Web Analytics 的站点令牌。 */
(() => {
  'use strict';
  if(window.__zsAnalyticsLoaded)return;
  window.__zsAnalyticsLoaded=true;
  // Site token is intentionally blank: no third-party requests occur before setup.
  // See docs/VISITOR_ANALYTICS.md. Never place private API keys here.
  const CLOUDFLARE_SITE_TOKEN='ed41ab1e0a79421b8f03c2b0d0936725';
  if(!/^[a-f0-9]{32}$/i.test(CLOUDFLARE_SITE_TOKEN))return;
  // Respect user opt-out and do not track preview/local/offline views.
  if(navigator.doNotTrack==='1'||window.doNotTrack==='1'||navigator.globalPrivacyControl===true)return;
  if(location.hostname!=='prolv202020-maker.github.io')return;
  const script=document.createElement('script');
  script.src='https://static.cloudflareinsights.com/beacon.min.js';
  script.defer=true;
  script.setAttribute('data-cf-beacon',JSON.stringify({token:CLOUDFLARE_SITE_TOKEN}));
  document.head.appendChild(script);
})();
