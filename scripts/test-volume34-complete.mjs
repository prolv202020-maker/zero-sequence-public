#!/usr/bin/env node
/* Fourth part volume 34 final publication gate: ten complete chapters, spoiler isolation, reader continuity and preservation. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {Script} from 'node:vm';
const read=p=>readFileSync(p,'utf8');
const titles=['跨区战帖','旗门争位','初战赤沙','战盟的价码','双城奔袭','公会夜袭','失守之城','重剑破关','千旗争锋','旗火未尽'];
const index=JSON.parse(read('assets/data/search-index.json'));
const site=read('sitemap.xml'),home=read('index.html'),part=read('parts/part-04.html'),volume=read('volumes/volume-34.html');
const unlock=read('assets/js/progressive-archive.js'),reader=read('assets/js/reader-experience.js');
const quick=read('assets/js/home-relaunch.js'),search=read('search.html'),sw=read('sw.js');
const counts=[];
assert.ok(read('chapters/volume-33/chapter-010.html').includes('../volume-34/chapter-001.html'),'330 -> 331 chapter transition missing');
assert.ok(read('volumes/volume-33.html').includes('volume-34.html'),'Volume 33 -> 34 navigation missing');
for(let i=1;i<=10;i++){
 const chapter=330+i,p='chapters/volume-34/chapter-'+String(i).padStart(3,'0')+'.html';
 assert.ok(existsSync(p),'Chapter missing '+chapter);
 const html=read(p),article=html.match(/<div class="article">([\s\S]*?)<div class="pager">/)?.[1];
 assert.ok(article,'Body or footer navigation missing '+chapter);
 const han=(article.match(/[\u3400-\u9fff]/g)||[]).length;
 assert.ok(han>=3000&&han<=3500,'Chapter '+chapter+' has '+han+' Han; expected 3000-3500');
 assert.ok(html.includes('<title>第'+chapter+'章 '+titles[i-1]+' · 第零序列</title>'),'Title mismatch '+chapter);
 assert.ok(html.includes('全书第'+chapter+'章 · 正式正文'),'Global chapter label wrong '+chapter);
 assert.ok(html.includes('href="../../volumes/volume-34.html"'),'Missing chapter directory '+chapter);
 const prev=i===1?'../volume-33/chapter-010.html':'chapter-'+String(i-1).padStart(3,'0')+'.html';
 assert.ok(html.includes('href="'+prev+'"'),'Previous link missing '+chapter);
 if(i<10)assert.ok(html.includes('href="chapter-'+String(i+1).padStart(3,'0')+'.html"'),'Next link missing '+chapter);
 else assert.ok(!html.includes('chapter-011.html'),'Must not reveal unpublished chapter 341');
 assert.ok(html.includes('progressive-archive.js?v=28'),'Fourth part unlock bootstrap missing '+chapter);
 assert.ok(!html.includes('80级触发')&&!html.includes('前世三十年'),'Private or obsolete canon leaked '+chapter);
 assert.ok(volume.includes('href="../'+p+'"'),'Volume directory incomplete '+chapter);
 assert.equal(index.filter(x=>x.url===p).length,1,'Search index missing or duplicate '+chapter);
 assert.ok(site.includes('/'+p+'</loc>'),'Sitemap not indexed '+chapter);
 counts.push({chapter,title:titles[i-1],han});
}
assert.ok(volume.includes('第三十四卷《双城旗火》'),'Volume header missing');
assert.ok(part.includes('volume-34.html')&&part.includes('共50章 · 第301—350章'),'Part four directory counter stale');
assert.ok(home.includes('350章＋序章')&&home.includes('最新正式章节：第350章《城火长明》'),'Homepage latest content stale');
assert.ok(quick.includes('num>350')&&quick.includes('current===4?5:10'),'Quick jump cap and fourth-part volume count stale');
assert.ok(reader.includes('globalChapter<350')&&reader.includes('vol<35'),'Reader chapter navigation stale');
assert.ok(unlock.includes("const KEY='zs:part-progress:v1'"),'Must preserve existing reader progress key');
assert.ok(unlock.includes('p===4?50:100'),'Fourth part 40-chapter cap not deployed');
for(let n=1;n<=40;n++)assert.ok(unlock.includes('{p:4,n:'+n+','),'Fourth part gated archive entry missing '+n);
assert.ok(!unlock.includes('80级触发'),'Author-only secrets must not be in public archive');
assert.ok(search.includes('x.p04?.max')&&search.includes('v<=35'),'Search should gate unread titles by independent part 4 progress');
assert.ok(sw.includes('progressive-archive.js?v=28')&&sw.includes('reader-experience.js?v=30'),'Service worker versions stale');
for(const p of ['assets/js/progressive-archive.js','assets/js/reader-experience.js','assets/js/home-relaunch.js','assets/js/volume-page.js','assets/js/volume-catalog.js'])new Script(read(p),{filename:p});
assert.ok(existsSync('chapters/volume-35'),'Published volume 35 must exist');
console.log('VOLUME34_COMPLETE_PASS '+JSON.stringify({chapters:counts,hanTotal:counts.reduce((s,x)=>s+x.han,0)}));
