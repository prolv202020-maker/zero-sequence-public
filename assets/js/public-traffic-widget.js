/* 第零序列 V8：只读取公开聚合数据，不接受任何 Cloudflare 凭据。独立分支候选版。 */
(() => {
  'use strict';
  const host = document.querySelector('[data-zs-visitor-stats]');
  if (!host) return;
  const path = host.getAttribute('data-source') || 'assets/data/public-traffic.json';
  const state = host.querySelector('[data-status]');
  const labels = {
    todayPageViews: host.querySelector('[data-metric="todayPageViews"]'),
    sevenDayPageViews: host.querySelector('[data-metric="sevenDayPageViews"]'),
    thirtyDayPageViews: host.querySelector('[data-metric="thirtyDayPageViews"]')
  };
  const showStatus = message => { if (state) state.textContent = message; };
  const validNumber = value => Number.isSafeInteger(value) && value >= 0;
  const safeDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value));
  async function load() {
    try {
      const url = new URL(path, document.baseURI);
      if (url.origin !== location.origin) throw Error('external source forbidden');
      const resp = await fetch(url.href, {cache:'no-store', credentials:'omit'});
      if (!resp.ok) throw Error('data unavailable');
      const data = await resp.json();
      if (data.schema !== 'zs-public-traffic-v1' || data.site !== 'zero-sequence-public' ||
          data.status !== 'verified' || !safeDate(data.updatedAt) ||
          data.metrics?.unit !== 'page_views' ||
          !Object.keys(labels).every(k => validNumber(data.metrics[k]))) {
        throw Error('unverified data');
      }
      for (const [key, el] of Object.entries(labels)) {
        if (el) el.textContent = data.metrics[key].toLocaleString('zh-CN');
      }
      const ts = new Date(data.updatedAt).toLocaleString('zh-CN',{timeZone:'Asia/Kuala_Lumpur'});
      showStatus('Cloudflare 页面浏览量 · 更新于 ' + ts + '（马来西亚时间）');
    } catch {
      showStatus('访问数据暂未取得');
    }
  }
  load();
})();
