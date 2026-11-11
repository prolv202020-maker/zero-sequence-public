#!/usr/bin/env node
/* 沉浸式插画阅读 V1 发布防护：正文原样、23张图对剧情锚点、防剧透及双向链接检查。
 * 只读检测，不联网、不调用配音接口、不写用户数据。
 */
import assert from 'node:assert/strict';
import {readFileSync,existsSync,statSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Script,createContext} from 'node:vm';
const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const file=p=>join(root,p),read=p=>readFileSync(file(p),'utf8');
const js=read('assets/js/immersive-illustrations.js');
const css=read('assets/css/immersive-illustrations.css');
const reader=read('assets/js/reader-experience.js');
const player=read('assets/js/audio-player.js');
const sw=read('sw.js');
const galleries={1:read('parts/illustrations-01.html'),2:read('parts/illustrations-02.html'),3:read('parts/illustrations-03.html')};
const gallery=galleries[3];
assert.doesNotThrow(()=>new Script(js,{filename:'immersive-illustrations.js'}),'Immersive code should compile');
const matched=js.match(/const SCENES=Object\.freeze\((\[[^\n]+\])\);/);
assert.ok(matched,'23-scene read-only manifest missing');
const scenes=JSON.parse(matched[1]);
assert.equal(scenes.length,23,'All 23 existing gallery images need exactly one inline placement');
for(const [part,count] of [[1,5],[2,6],[3,12]])assert.equal(scenes.filter(x=>Math.ceil(x.v/10)===part).length,count,'Incorrect part illustration count: '+part);
assert.equal(new Set(scenes.map(s=>s.id)).size,23,'Each image must get a unique anchor');
assert.equal(new Set(scenes.map(s=>s.file)).size,23,'Each artwork must be used once, never duplicated for another moment');
assert.ok(js.includes("const paragraphs=[...article.querySelectorAll(':scope > p')]"),'Only original direct body paragraphs may be matched');
assert.ok(js.includes('target.length!==1'),'A missing or ambiguous prose anchor must NOT silently insert an image elsewhere');
assert.ok(js.includes("target[0].insertAdjacentElement('afterend',figure)"),'Image must appear after the narrative paragraph');
assert.ok(js.includes("image.loading='lazy'")&&js.includes("image.decoding='async'"),'Use browser lazy loading and async decoding');
assert.ok(js.includes("d.showModal()")&&js.includes("dialog.addEventListener('close'"),'Full-screen viewing must have a dismissible accessible dialog');
assert.ok(js.includes("zs-gallery-art-")&&js.includes("zs-story-art-"),'Two-way bookmark anchors must be stable');
assert.ok(!/localStorage|sessionStorage|ZSUnlock\.set|(?:zs:reader:last|zs:part-progress)/.test(js),'Illustration code must not modify reading or spoiler progress');
assert.ok(!js.includes('fetch(')&&!js.includes('ElevenLabs'),'Never fetch paid image/audio services');
assert.ok(css.includes('@media(max-width:650px)')&&css.includes('aspect-ratio:16/9')&&css.includes('100dvh'),'Responsive media view and mobile full-screen rules absent');
assert.ok(reader.includes('function loadImmersiveIllustrations()')&&reader.includes('loadImmersiveIllustrations();'),'Reader not wired to new feature');
const illustrated=reader.match(/const illustratedChapters=(\{[^\n]+\});/);
assert.ok(illustrated,'Reader missing restricted chapter allowlist');
const illustratedMap=JSON.parse(illustrated[1]);
assert.equal(Object.values(illustratedMap).reduce((sum,a)=>sum+a.length,0),23,'Only 23 illustrated chapters should load the art bundle');
assert.ok(player.includes('reader-experience.js?v=32')&&sw.includes('reader-experience.js?v=32'),'New reader must bust old cache in both normal and offline-assisted loading paths');
assert.ok(gallery.includes('id:a.id,reader:a.reader')&&gallery.includes("card.id='zs-gallery-art-'+id"),'Gallery cannot find individual book-to-art anchors');
assert.ok(gallery.includes("if(reader){const a=document.createElement('a')"),'Gallery does not offer a jump back to story paragraphs');
assert.ok(gallery.includes('function jumpToIllustration()'),'Gallery hash navigation must work with dynamically rendered cards');
assert.ok(!/<img[^>]+scene-03-.*-cg\.webp/.test(gallery),'Spoiler-locked images must not pre-render in the gallery');
for(const p of [1,2]){
 const html=galleries[p],inner=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
 assert.ok(inner,'Part '+p+' gallery has no renderer');
 assert.doesNotThrow(()=>new Script(inner,{filename:'illustrations-0'+p+'.js'}));
 assert.ok(inner.includes("storagePart='p0'+partNumber")&&inner.includes("d[storagePart]?.max"),'Part '+p+' must only read its own progress');
 assert.ok(inner.includes("p>=readerNeed"),'Part '+p+' gallery can reveal unread chapter deep links');
 assert.ok(inner.includes('if(!ok){const lock=')&&inner.includes('imageOrLock(frame,ok'), 'Part '+p+' could load locked illustrations');
 assert.ok(inner.includes("card.id='zs-gallery-art-'+id"),'Part '+p+' missing stable hash anchors');
 assert.ok(inner.includes("window.addEventListener('hashchange',jumpToIllustration)"),'Part '+p+' missing dynamic anchor navigation');
 const artMatch=inner.match(/const art=(\[[^\n]+\]);/);
 assert.ok(artMatch,'Part '+p+' scene records missing');
 const entries=JSON.parse(artMatch[1]);assert.equal(entries.length,p===1?5:6);
 assert.ok(entries.every(x=>x.need<=x.readerNeed && x.readerNeed<=100),'Part '+p+' has unsafe deep-link unlock thresholds');
 if(p===2){assert.ok(inner.includes("for(let v=11;v<=20;v++)"),'Part II must retain its 10 covers');}
}

const galleryScript=gallery.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(galleryScript,'Gallery renderer missing');
assert.doesNotThrow(()=>new Script(galleryScript,{filename:'illustrations-03.js'}));
assert.ok(galleryScript.includes("d.p03?.max")&&!galleryScript.includes("d.p01?.max")&&!galleryScript.includes("d.p02?.max"),'Part-specific spoiler boundary must stay unchanged');
// A small DOM simulation proves the feature appends figures without editing paragraphs or user state.
class FakeElement{
 constructor(name,text=''){this.tagName=name;this.textContent=text;this.children=[];this.listeners={};this.style={};this.hidden=false;this.id='';this.className='';this.attributes={};}
 setAttribute(k,v){this.attributes[k]=v;}
 append(...nodes){this.children.push(...nodes);}
 addEventListener(k,handler){this.listeners[k]=handler;}
 insertAdjacentElement(where,node){assert.equal(where,'afterend');this.insertions??=[];this.insertions.push(node);}
 querySelector(){return null;}
}
let created=0;
for(const scene of scenes){
 const chapterPath='chapters/volume-'+String(scene.v).padStart(2,'0')+'/chapter-'+String(scene.n).padStart(3,'0')+'.html';
 const html=read(chapterPath);
 assert.ok(html.includes('<div class="article">'),'Missing novel article '+chapterPath);
 const chunk=html.slice(html.indexOf('<div class="article">'));
 const originalParas=[...chunk.matchAll(/<p>([\s\S]*?)<\/p>/g)].map(m=>m[1].replace(/<[^>]+>/g,'').replace(/&nbsp;/g,' ').trim());
 const matches=originalParas.filter(p=>p.includes(scene.needle));
 assert.equal(matches.length,1,'Scene anchor absent or ambiguous within real prose: '+scene.id+' / '+chapterPath);
 const artwork='assets/images/illustrations/'+scene.file;
 assert.ok(existsSync(file(artwork)),'Artwork missing '+artwork);
 assert.ok(statSync(file(artwork)).size>20000,'Artwork appears truncated: '+artwork);
 const bytes=readFileSync(file(artwork));
 assert.equal(bytes.subarray(0,4).toString(),'RIFF','Incorrect WebP header '+scene.id);
 assert.equal(bytes.subarray(8,12).toString(),'WEBP','Incorrect WebP format '+scene.id);
 const href="../chapters/volume-"+String(scene.v).padStart(2,'0')+"/chapter-"+String(scene.n).padStart(3,'0')+".html#zs-story-art-"+scene.id;
 const part=Math.ceil(scene.v/10),page=galleries[part];
 if(part===3){
   assert.ok(page.includes("file:'"+scene.file+"',id:'"+scene.id+"',reader:'"+href+"'"),'Missing Part III gallery link for '+scene.id);
 }else{
   const artText=page.match(/const art=(\[[^\n]+\]);/)?.[1];
   assert.ok(artText,'Part '+part+' gallery entries not found');
   const matchingArt=JSON.parse(artText).filter(x=>x.id===scene.id&&x.file===scene.file&&x.reader===href);
   assert.equal(matchingArt.length,1,'Missing Part '+part+' back-link for '+scene.id);
   const readerNeed=(scene.v-(part-1)*10-1)*10+scene.n;
   assert.equal(matchingArt[0].readerNeed,readerNeed,'Wrong safety threshold for '+scene.id);
 }
 const before=originalParas.join('\n');
 const fakeParas=originalParas.map(p=>new FakeElement('p',p));
 const article={querySelectorAll:sel=>{assert.equal(sel,':scope > p');return fakeParas;}};
 const dom={querySelector:sel=>sel==='.article'?article:null,createElement:name=>new FakeElement(name),getElementById:()=>null,body:new FakeElement('body')};
 const location={pathname:'/zero-sequence-public/'+chapterPath,hash:''};
 const ctx=createContext({document:dom,location,window:{open:()=>{}},requestAnimationFrame:fn=>fn(),HTMLDialogElement:class {}});
 assert.doesNotThrow(()=>new Script(js).runInContext(ctx),'Illustration initialization failed: '+scene.id);
 const inserted=fakeParas.flatMap(p=>p.insertions||[]);
 assert.equal(inserted.length,1,'Must inject a single figure in the correct chapter for '+scene.id);
 assert.equal(inserted[0].id,'zs-story-art-'+scene.id,'Incorrect figure fragment id for '+scene.id);
 assert.equal(originalParas.join('\n'),before,'Immutable text was modified by visual overlay '+scene.id);
 assert.ok(fakeParas.filter(p=>p.insertions).length===1 && fakeParas.find(p=>p.insertions).textContent.includes(scene.needle),'Figure is not after the matching narrative beat: '+scene.id);
 const img=inserted[0].children[0].children.find(x=>x.tagName==='img');
 assert.ok(img && img.loading==='lazy' && img.width===1440 && img.height===810,'Mobile-friendly image sizing/loading broken: '+scene.id);
 created++;
}
assert.equal(created,23);
console.log('[IMMERSIVE V2] PASS: 23 verified chapter anchors across three parts, unchanged paragraphs, 23 existing WebPs, safe gallery deep links and independent p01/p02/p03 progress, lazy-loaded mobile lightbox.');
