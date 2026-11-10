#!/usr/bin/env node
/* Volume 35 final publication gate. Preserve original books, progress, privacy boundaries and published chapter continuity. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {Script} from 'node:vm';
const read=p=>readFileSync(p,'utf8');
const titles=['百旗开城','东门夺旗','血价竞标','夜袭粮仓','重剑守街','黑榜猎杀','城门崩线','逆火盟旗','百旗决战','城火长明'];
const index=JSON.parse(read('assets/data/search-index.json'));
const site=read('sitemap.xml'),home=read('index.html'),part=read('parts/part-04.html'),volume=read('volumes/volume-35.html');
const unlock=read('assets/js/progressive-archive.js'),reader=read('assets/js/reader-experience.js');
const quick=read('assets/js/home-relaunch.js'),search=read('search.html'),sw=read('sw.js');
const counts=[];
assert.ok(read('chapters/volume-34/chapter-010.html').includes('../volume-35/chapter-001.html'),'Chapter 340 to 341 transition missing');
assert.ok(read('volumes/volume-34.html').includes('volume-35.html'),'Volume 34 to 35 navigation missing');
for(let i=1;i<=10;i++){
 const n=340+i,p='chapters/volume-35/chapter-'+String(i).padStart(3,'0')+'.html';
 assert.ok(existsSync(p),'Missing chapter '+n);
 const html=read(p),article=html.match(/<div class="article">([\s\S]*?)<div class="pager">/)?.[1];
 assert.ok(article,'Missing article and pager '+n);
 const han=(article.match(/[\u3400-\u9fff]/g)||[]).length;
 assert.ok(han>=3000&&han<=3500,'Chapter '+n+' length '+han+' outside 3000–3500 Han');
 assert.ok(html.includes('<title>第'+n+'章 '+titles[i-1]+' · 第零序列</title>'),'Title mismatch '+n);
 assert.ok(html.includes('全书第'+n+'章 · 正式正文'),'Global numbering error '+n);
 assert.ok(html.includes('href="../../volumes/volume-35.html"'),'Missing chapter directory '+n);
 const prev=i===1?'../volume-34/chapter-010.html':'chapter-'+String(i-1).padStart(3,'0')+'.html';
 assert.ok(html.includes('href="'+prev+'"'),'Previous chapter navigation missing '+n);
 if(i<10)assert.ok(html.includes('href="chapter-'+String(i+1).padStart(3,'0')+'.html"'),'Next chapter navigation missing '+n);
 else assert.ok(!html.includes('chapter-011.html'),'Must not publish chapter 351');
 assert.ok(html.includes('progressive-archive.js?v=28'),'Reader spoiler bootstrap stale '+n);
 assert.ok(!html.includes('80级触发')&&!html.includes('三十年末日'),'Private/obsolete canon leaked '+n);
 assert.ok(volume.includes('href="../'+p+'"'),'Volume chapter index missing '+n);
 assert.equal(index.filter(x=>x.url===p).length,1,'Public search index duplicate/missing '+n);
 assert.ok(site.includes('/'+p+'</loc>'),'Sitemap missing '+n);
 counts.push({chapter:n,title:titles[i-1],han});
}
assert.ok(volume.includes('第三十五卷《百旗城战》'),'Volume heading missing');
assert.ok(part.includes('volume-35.html')&&part.includes('共50章 · 第301—350章'),'Part four directory incorrect');
assert.ok(home.includes('350章＋序章')&&home.includes('最新正式章节：第350章《城火长明》'),'Homepage latest incorrect');
assert.ok(quick.includes('num>350')&&quick.includes('current===4?5:10'),'Direct jump cap/volume count incorrect');
assert.ok(reader.includes('globalChapter<350')&&reader.includes('vol<35'),'Reader next/previous navigation incorrect');
assert.ok(unlock.includes("const KEY='zs:part-progress:v1'"),'Existing reader progress key must not change');
assert.ok(unlock.includes('p===4?50:100'),'Part four progress must cap at 50 independent chapters');
for(let i=1;i<=50;i++)assert.ok(unlock.includes('{p:4,n:'+i+','),'Fourth-part independent spoiler gate missing '+i);
assert.ok(!unlock.includes('80级触发'),'Private author-only spoiler must not leak');
assert.ok(search.includes('x.p04?.max')&&search.includes('v<=35'),'Search spoiler lock for part four must be preserved');
assert.ok(sw.includes('progressive-archive.js?v=28')&&sw.includes('reader-experience.js?v=30'),'Service worker cache versions stale');
assert.ok(!existsSync('chapters/volume-36'),'Do not publish future volume 36');
for(const path of ['assets/js/progressive-archive.js','assets/js/reader-experience.js','assets/js/home-relaunch.js','assets/js/volume-page.js','assets/js/volume-catalog.js'])new Script(read(path),{filename:path});
console.log('VOLUME35_COMPLETE_PASS '+JSON.stringify({chapters:counts,hanTotal:counts.reduce((s,x)=>s+x.han,0)}));
