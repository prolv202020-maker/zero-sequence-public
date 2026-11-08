#!/usr/bin/env node
/* 《第零序列》官方人物立绘保护检查：七位已批准人物的原图文件绝不自动换脸。
 * 仅校验文件存在、Git blob 基准及引用。它不等于计算机视觉对比，CG须另经人工审查。
 * 本脚本不调用任何付费服务，不更改小说正文、音频或读者进度。
 */
import assert from 'node:assert/strict';
import {readFileSync,existsSync,statSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const file=p=>join(root,p),read=p=>readFileSync(file(p),'utf8');
const approved=Object.freeze([
  ['顾长渊','gu-changyuan','7dd524458f2f4791cd12983d13ba8b2c28b9208c'],
  ['苏紫璃','su-zili','b7d6577837409dcba85d8f0272885558761be321'],
  ['林烈','lin-lie','08f4c4b3e2f7923342c934409dd05377df2cd629'],
  ['罗烬','luo-jin','14991f7f27153ed602b506c3c1b2f3be486e6356'],
  ['凌天曜','ling-tianyao','7984d2a26ddc7fa684cb850d840da8d57cecc5be'],
  ['戴玄岳','dai-xuanyue','7dc5d26806ee1e288c6ea291a9d82d4bbe3fceb1'],
  ['古言澈','gu-yanche','8fd0334ff62b125f889906c51d509e049b297455']
]);
const gitBlob=buffer=>createHash('sha1').update('blob '+buffer.length+'\0').update(buffer).digest('hex');
const codeFiles=['assets/js/character-art.js','assets/js/profile-v2.js','assets/js/atlas-v2.js'];
for(const [name,slug,sha] of approved){
  const path='assets/images/characters/'+slug+'-approved.webp';
  assert.ok(existsSync(file(path)),'Missing approved portrait: '+name+' ('+path+')');
  const bytes=readFileSync(file(path));
  assert.ok(bytes.length>20000,'Unusually short official portrait: '+name);
  assert.equal(bytes.subarray(0,4).toString('ascii'),'RIFF','Not a valid RIFF image: '+name);
  assert.equal(bytes.subarray(8,12).toString('ascii'),'WEBP','Not a WebP image: '+name);
  assert.equal(gitBlob(bytes),sha,
    'Official portrait changed without explicit author review: '+name+'. Restore reference, or update standard and baseline only after author approval.');
}
for(const path of codeFiles){
  const script=read(path);
  assert.ok(script.includes('-approved.webp'),'Approved portrait reference absent from '+path);
}
const art=read('assets/js/character-art.js'),profiles=read('assets/js/profile-v2.js'),atlas=read('assets/js/atlas-v2.js');
for(const [name,slug] of approved){
  assert.ok(art.includes("slug:'"+slug+"'"),'Character gallery missing character '+name);
  assert.ok(profiles.includes("id:'"+slug+"'"),'Character profile missing character '+name);
  assert.ok(atlas.includes("'"+name+"'"),'Character index missing character '+name);
}
const visualData=read('assets/js/visual-codex-data.js');
const candidatePaths=['assets/images/codex/character-gu-changyuan.webp','assets/images/codex/character-su-zili.webp'];
for(const p of candidatePaths){
  assert.ok(existsSync(file(p)),'Missing separate codex card '+p);
  assert.ok(statSync(file(p)).size>15000,'Unexpectedly small codex card: '+p);
  assert.ok(visualData.includes('"'+p.split('/').pop()+'"'),'Codex card mapping not found: '+p);
}
let covers=0;
for(let n=1;n<=30;n++){
  const p='assets/images/covers/volume-'+String(n).padStart(2,'0')+'.webp';
  assert.ok(existsSync(file(p)),'Missing officially published cover '+p);
  const b=readFileSync(file(p));assert.equal(b.subarray(0,4).toString('ascii'),'RIFF');assert.equal(b.subarray(8,12).toString('ascii'),'WEBP');
  covers++;
}
const third=read('parts/illustrations-03.html');
assert.ok(third.includes('p03?.max'),'Part III gallery must use its own reading progress');
assert.ok(!third.includes("d.p01?.max")&&!third.includes("d.p02?.max"),'Third gallery must not unlock from other parts');
assert.ok(!/ELEVENLABS_API_KEY|--produce/.test(art+profiles+atlas+visualData+third),'Review should not perform any paid TTS');
console.log('[VISUAL IDENTITY] PASS: 7 original portraits binary-locked; linked in character gallery, dossiers and atlas; '+covers+' covers present.');
console.log('[VISUAL IDENTITY] REVIEW REQUIRED: 2 separate Gu Changyuan/Su Zili codex illustrations are NOT the approved portrait source; visual equivalence still requires side-by-side human review.');
console.log('[VISUAL IDENTITY] REVIEW REQUIRED: 30 volume covers and 3 part illustrations must be checked when identifiable characters appear; structural file checks do not prove face consistency.');
console.log('[VISUAL IDENTITY] NOTE: Lin Lie story weapon is greatsword per author confirmation; historical axe design is not a replacement of the official novel canon. Any artwork corrections require separate author approval.');
