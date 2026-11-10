#!/usr/bin/env node
/* V8 static contract checks: no network, paid service, API keys or main-site writes. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
const src=readFileSync('assets/js/public-traffic-widget.js','utf8');
const preview=readFileSync('docs/v8/visitor-widget-preview.html','utf8');
new Script(src);
for(const key of ['todayPageViews','sevenDayPageViews','thirtyDayPageViews']) {
 assert.ok(src.includes(key) && preview.includes(key),'Missing '+key);
}
assert.ok(src.includes("data.status !== 'verified'"),'Unverified numbers must be hidden');
assert.ok(src.includes('url.origin !== location.origin'),'Cross-origin data must be refused');
assert.ok(!/Bearer|CF_ANALYTICS_TOKEN|CF_ACCOUNT_ID|api.cloudflare.com|localStorage|zs:audiobook/.test(src+preview),'Credential or storage integration prohibited');
assert.ok(!/独立访客人数/.test(preview),'No unsupported unique visitor claims');
console.log('V8 preview contract PASS: 3 page-view labels, unverified data hidden, no tokens, no live site integration.');
