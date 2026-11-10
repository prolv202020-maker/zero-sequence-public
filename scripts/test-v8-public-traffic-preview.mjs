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
assert.ok(preview.includes('不是独立访客人数'),'Preview must warn users that page views are not unique visitors');
const graphqlPreview=readFileSync('scripts/build-v8-traffic-preview.mjs','utf8');
assert.ok(graphqlPreview.includes("siteTagIsDistinctFromBeaconSiteToken:true"),'Missing siteTag/siteToken distinction');
assert.ok(!graphqlPreview.includes('tagged[0].tag===beacon')&&!graphqlPreview.includes('beaconMatches'),'Must not compare Cloudflare siteTag directly with beacon siteToken');
assert.ok(graphqlPreview.includes("status:singleProjectProperty?'pending_dashboard_review'"),'Preview must require dashboard review');
assert.ok(!graphqlPreview.includes("status:'verified'"),'No automatically publicly verified number');
assert.ok(graphqlPreview.includes('v8-traffic-preview/public-traffic-preview.json'),'Only an unpublished artifact can be generated');
console.log('V8 preview contract PASS: 3 page-view labels, unverified data hidden, no tokens, no live site integration.');
