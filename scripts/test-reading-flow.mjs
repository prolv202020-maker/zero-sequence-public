#!/usr/bin/env node
/**
 * The Zero Sequence — reader progress regression tests.
 * Runs without network or browser dependencies.
 * Execute: node scripts/test-reading-flow.mjs
 */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
const root=fileURLToPath(new URL('../',import.meta.url));
const p=(file)=>resolve(root,file);
const storage=new Map();
const events=new Map();
const document={
 readyState:'loading',
 addEventListener(name,fn){events.set(name,fn)},
 dispatchEvent(evt){(events.get(evt.type)||(()=>{}))();},
 querySelector(){return null}
};
const localStorage={
 getItem(k){return storage.has(k)?storage.get(k):null},
 setItem(k,v){storage.set(k,String(v))}
};
const context={document,localStorage,location:{pathname:'/zero-sequence-public/index.html'},window:{},Event:class{constructor(type){this.type=type}},console};
vm.runInNewContext(readFileSync(p('assets/js/progressive-archive.js'),'utf8'),context,{filename:'progressive-archive.js'});
const unlock=context.window.ZSUnlock;
assert.ok(unlock && typeof unlock.get==='function' && typeof unlock.set==='function');
assert.equal(unlock.get(1).max,0);
assert.equal(unlock.get(2).max,0);
unlock.set(1,1,false);
assert.equal(unlock.get(1).max,1,'first chapter unlock');
assert.equal(unlock.get(2).max,0,'second part must not change');
unlock.set(1,10,false);
unlock.set(1,2,false);
assert.equal(unlock.get(1).max,10,'progress must never decrease');
unlock.set(1,0,true);
assert.equal(unlock.get(1).prologue,true,'prologue separately saved');
assert.equal(unlock.get(2).prologue,false,'prologue must not spill into part 2');
unlock.set(2,1,false);
assert.equal(unlock.get(2).max,1,'second part unlock');
assert.equal(unlock.get(1).max,10,'first part remains intact');
unlock.set(2,100,false);
assert.equal(unlock.get(2).max,100,'second part completion');
unlock.set(1,100,false);
assert.equal(unlock.get(1).max,100,'first part completion');
assert.equal(unlock.partOf(1),1);
assert.equal(unlock.partOf(10),1);
assert.equal(unlock.partOf(11),2);
assert.equal(unlock.partOf(20),2);
assert.ok(unlock.entries.every(e=>e.p===1||e.p===2));
assert.ok(unlock.entries.every(e=>e.n>=1&&e.n<=100));
for(let volume=1;volume<=20;volume++){
 const directory='volumes/volume-'+String(volume).padStart(2,'0')+'.html';
 assert.ok(existsSync(p(directory)),'Missing volume directory: '+directory);
 for(let chapter=1;chapter<=10;chapter++){
  const f='chapters/volume-'+String(volume).padStart(2,'0')+'/chapter-'+String(chapter).padStart(3,'0')+'.html';
  assert.ok(existsSync(p(f)),'Missing chapter: '+f);
  const html=readFileSync(p(f),'utf8');
  assert.match(html,/<main\b/i,'Missing main content: '+f);
  assert.match(html,/class=["'][^"']*article/i,'Missing article container: '+f);
  assert.match(html,/audio-player\.js/i,'Direct reading bootstrap missing: '+f);
 }
}
assert.ok(existsSync(p('chapters/volume-01/prologue.html')));
const volPage=readFileSync(p('assets/js/volume-page.js'),'utf8');
assert.match(volPage,/if\(read===10\)\{resume\.href=startHref/,'Completed volume should restart from its opening chapter');
const readingScript=readFileSync(p('assets/js/reader-experience.js'),'utf8');
assert.match(readingScript,/else if\(num===1&&vol>1\)/,'First chapter should link back across volume boundary');
assert.match(readingScript,/else if\(vol<20\)/,'Last chapter should link forward across volume boundary');
assert.match(readingScript,/if\(num===0\)/,'Prologue should link into chapter one');
assert.match(readingScript,/oldProgress\.index>0/,'Resume reader must offer saved paragraph position');

const audio=readFileSync(p('assets/js/audio-player.js'),'utf8');
assert.match(audio,/reader-experience\.js/,'Reader should initialize on direct chapter visits');
assert.match(audio,/progressive-archive\.js/,'Unlock engine should initialize on direct chapter visits');
const reader=readFileSync(p('assets/js/reader-experience.js'),'utf8');
assert.match(reader,/zs:reader:last:v1/,'Resume key must remain stable');
assert.match(reader,/zs:reader:options:v1/,'Preferences key must remain stable');
console.log('[READING FLOW] PASS: 201 text files, 20 volumes, direct-load bootstrap, progress monotonicity, independent parts, prologue, resume keys.');
