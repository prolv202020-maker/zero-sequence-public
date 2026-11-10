#!/usr/bin/env node
/* Ensure direct visits to any published chapter load reader UX without a prior Service Worker. */
import {readdirSync,readFileSync,writeFileSync,existsSync as fsExists} from 'node:fs';
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
const publishedVolumes=readdirSync(chapters,{withFileTypes:true}).filter(x=>x.isDirectory()&&/^volume-\d{2}$/.test(x.name)).length;
// Existing first 34 volumes are complete; volume 35 contains ten published chapters.
const baseCompleted=34*10;
const latestDir=join(chapters,'volume-35');
const newest=fsExists(latestDir)?readdirSync(latestDir).filter(x=>/^chapter-\d{3}\.html$/.test(x)).length:0;
const expected=1+baseCompleted+newest;
if(scanned!==expected)throw new Error('Expected '+expected+' published reading pages (including '+newest+' in volume 35), found '+scanned);
for(let i=1;i<=newest;i++){
 const file='chapter-'+String(i).padStart(3,'0')+'.html';
 if(!readdirSync(latestDir).includes(file))throw new Error('Gap in volume 35 chapter sequence: '+file);
}
console.log('[CHAPTER BOOTSTRAP] audited '+scanned+' chapters; '+(checkOnly?'missing '+patched:'patched '+patched)+' script tags.');
if(checkOnly&&patched)process.exitCode=1;
