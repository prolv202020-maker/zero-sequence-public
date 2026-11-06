#!/usr/bin/env node
/* Ensure direct visits to any published chapter load reader UX without a prior Service Worker. */
import {readdirSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const chapters=join(root,'chapters');
const checkOnly=process.argv.includes('--check');
let scanned=0,patched=0;
const bootstrap='<script src="/zero-sequence-public/assets/js/audio-player.js?v=9" defer></script>';
for(const dir of readdirSync(chapters,{withFileTypes:true})){
 if(!dir.isDirectory()||!/^volume-\d{2}$/.test(dir.name))continue;
 for(const name of readdirSync(join(chapters,dir.name))){
  if(!/^(?:chapter-\d{3}|prologue)\.html$/.test(name))continue;
  const path=join(chapters,dir.name,name),html=readFileSync(path,'utf8');scanned++;
  if(/<script\b[^>]*src\s*=\s*["'][^"']*audio-player\.js(?:\?[^"']*)?["']/i.test(html))continue;
  if(!/<\/body>/i.test(html))throw new Error('Missing body close: '+path);
  if(!checkOnly)writeFileSync(path,html.replace(/<\/body>/i,bootstrap+'</body>'));patched++;
 }
}
if(scanned!==241)throw new Error('Expected 241 published reading pages (prologue and 240 chapters), found '+scanned+'; refusing partial migration');
console.log('[CHAPTER BOOTSTRAP] audited '+scanned+' chapters; '+(checkOnly?'missing '+patched:'patched '+patched)+' script tags.');
if(checkOnly&&patched)process.exitCode=1;
