#!/usr/bin/env node
/**
 * 第零序列 · 静态站点链接及资源完整性检查
 * Run: node scripts/audit-site-links.mjs
 * Does not fetch remote URLs or alter any published content.
 */
import {readdirSync,readFileSync,existsSync} from 'node:fs';
import {resolve,relative,dirname,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const prefix='/zero-sequence-public/';
const supported=new Set(['.html','.css','.js']);
const warnings=[],missing=[],files=[];
const archiveManifest=JSON.parse(readFileSync(resolve(root,'assets/data/audio-archive-manifest.json'),'utf8'));
const archivedMediaPaths=new Set(archiveManifest.files.map(x=>x.path));
function walk(dir){
 for(const item of readdirSync(dir,{withFileTypes:true})){
  if(['.git','node_modules','.github'].includes(item.name))continue;
  const path=resolve(dir,item.name);
  if(item.isDirectory())walk(path);
  else if(item.isFile())files.push(path);
 }
}
walk(root);
function validate(file,url,kind){
 if(!url || /^(?:#|https?:|data:|mailto:|tel:|javascript:|blob:|\/\/)/i.test(url))return;
 const trimmed=url.trim().split(/[?#]/)[0];
 if(!trimmed)return;
 let path;try{path=decodeURIComponent(trimmed)}catch{warnings.push(relative(root,file)+': invalid URL encoding '+url);return;}
 if(path.startsWith('/')){
  if(!path.startsWith(prefix)){missing.push(relative(root,file)+': unexpected absolute site URL '+url);return;}
  path=path.slice(prefix.length);
  path=resolve(root,path);
 }else path=resolve(dirname(file),path);
 if(!path.startsWith(root+'/') && path!==root){missing.push(relative(root,file)+': path escapes site root '+url);return;}
 if(!existsSync(path)){
  const rel=relative(root,path).replaceAll('\\\\','/');
  // Published chapter MP3s are intentionally preserved on an accessible public archive branch.
  // The chapter audio adapter rewrites their original URLs at runtime before playback.
  if(archivedMediaPaths.has(rel) && readFileSync(file,'utf8').includes('chapter-audiobook.js'))return;
  missing.push(relative(root,file)+': missing '+kind+' '+url+' -> '+relative(root,path));
 }
}
for(const file of files){
 const ext=extname(file);
 if(!supported.has(ext))continue;
 const content=readFileSync(file,'utf8');
 if(ext==='.html'){
  for(const m of content.matchAll(/\b(?:href|src|poster)\s*=\s*["']([^"']+)["']/gi))
   validate(file,m[1],'reference');
  for(const m of content.matchAll(/\bsrcset\s*=\s*["']([^"']+)["']/gi))
   for(const entry of m[1].split(','))validate(file,entry.trim().split(/\s+/)[0],'srcset');
 }
 if(ext==='.css' || ext==='.html'){
  for(const m of content.matchAll(/url\(\s*["']?([^)"']+)["']?\s*\)/gi))
   validate(file,m[1],'CSS url');
 }
}
console.log('[SITE LINKS] Scanned '+files.length+' files.');
console.log('[SITE LINKS] Missing or invalid references: '+missing.length);
for(const m of missing)console.error('ERROR '+m);
for(const m of warnings)console.warn('REVIEW '+m);
if(missing.length)process.exitCode=1;
