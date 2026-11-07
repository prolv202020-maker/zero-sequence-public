#!/usr/bin/env node
/* Published-fiction consistency check. It tests wording, not unreleased plot mechanics. */
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const read=p=>readFileSync(join(root,p),'utf8');
const risky=[
  /(?:前世|上一世|重生前)[^。！？\n]{0,35}(?:三十年|30年|十几年|十余年|二十年)/g,
  /末日第(?:十[一二三四五六七八九]?|[四五六七八九]|\d{1,2})年/g,
  /(?:三十年|30年)[^。！？\n]{0,35}(?:末日|重生|记忆|活过)/g,
  /(?:在三十年的记忆中|曾经活过的那三十年|隔着三十年仍未冷却的伤口|三十年前的灾难里|带着三十年痛苦|三十年末日里)/g
];
const inspect=/三十年|30年|十几年|十余年|二十年|末日第[^，。！？\s]{1,8}年/g;
const critical=[],review=[];
let checked=0;
for(let v=1;v<=30;v++)for(let c=1;c<=10;c++){
 const path='chapters/volume-'+String(v).padStart(2,'0')+'/chapter-'+String(c).padStart(3,'0')+'.html';
 assert.ok(existsSync(join(root,path)),'Missing official chapter '+path);
 let s=read(path).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ');
 checked++;
 for(const rx of risky){rx.lastIndex=0;for(const m of s.matchAll(rx))critical.push(path+': '+s.slice(Math.max(0,m.index-70),m.index+125));}
 inspect.lastIndex=0;
 for(const m of s.matchAll(inspect)){
  const excerpt=s.slice(Math.max(0,m.index-65),m.index+95);
  if(!critical.some(x=>x.includes(path+': '+excerpt)))review.push(path+': '+excerpt);
 }
}
assert.equal(checked,300);
console.log('[TIMELINE] '+checked+' published chapters scanned; explicit past-life contradictions: '+critical.length+'; context review matches: '+review.length);
for(const x of critical.slice(0,80))console.error('[TIMELINE_ERROR] '+x);
for(const x of review.slice(0,80))console.log('[TIMELINE_REVIEW] '+x);
assert.equal(critical.length,0,'Published past-life years contradict the agreed short post-catastrophe timeline');
