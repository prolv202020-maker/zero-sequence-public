#!/usr/bin/env node
// Public text-only audit: no unreleased author materials, no prose or spoilers in output.
// Report-only by default. Use --strict to fail on missing, short, long or broken links.
import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = resolve(fileURLToPath(new URL('../', import.meta.url)));
const strict = process.argv.includes('--strict');
const read = p => readFileSync(join(root,p),'utf8');
const id = x => String(x).padStart(2,'0');
const cid = x => String(x).padStart(3,'0');
const volumes = readdirSync(join(root,'volumes')).filter(x => /^volume-\d{2}\.html$/.test(x))
  .map(x => Number(x.match(/\d{2}/)[0])).sort((a,b) => a-b);
const issues = [], rows = [], seen = new Map(), perVolume = [];
const issue = (kind, path, detail) => issues.push({kind, path, detail});
const allPaths = [];
if (!volumes.length) issue('missing-volumes','volumes','No volume HTML files');
else for(let v=1;v<=volumes.at(-1);v++) if(!volumes.includes(v))
  issue('missing-volume',`volumes/volume-${id(v)}.html`,'Missing volume in sequence');

for(const v of volumes){
  const dir = `chapters/volume-${id(v)}`;
  const toc = `volumes/volume-${id(v)}.html`;
  const listed = existsSync(join(root,dir)) ? readdirSync(join(root,dir)).filter(x=>/^chapter-\d{3}\.html$/.test(x)) : [];
  const required = Array.from({length:10},(_,i)=>`chapter-${cid(i+1)}.html`);
  for(const name of listed) if(!required.includes(name)) issue('unexpected-chapter',dir+'/'+name,'Unexpected chapter file');
  if(!existsSync(join(root,toc))) issue('missing-volume',toc,'Missing volume table of contents');
  const tocHtml = existsSync(join(root,toc)) ? read(toc) : '';
  let totalHan=0, shortest=Infinity, longest=0;
  for(let n=1;n<=10;n++){
    const path=`${dir}/chapter-${cid(n)}.html`;
    allPaths.push(path);
    const number=(v-1)*10+n;
    if(!listed.includes(`chapter-${cid(n)}.html`) || !existsSync(join(root,path))){
      issue('missing-chapter',path,`Global chapter ${number}`);continue;
    }
    const html=read(path);
    const match=html.match(/<div\s+class=["']article["']\s*>([\s\S]*?)<div\s+class=["']pager["']/i);
    if(!match){issue('missing-article',path,'Article or pager not found');continue;}
    const body=match[1];
    const paragraphs=[...body.matchAll(/<p(?:\s+[^>]*)?>([\s\S]*?)<\/p>/gi)]
      .map(m=>m[1].replace(/<[^>]+>/g,'').replace(/&#(?:x([0-9a-f]+)|(\d+));/gi,
        (_,hex,dec)=>String.fromCodePoint(parseInt(hex||dec,hex?16:10)))
        .replace(/&(nbsp|amp|lt|gt|quot);/gi,(_,a)=>({nbsp:' ',amp:'&',lt:'<',gt:'>',quot:'"'}[a])));
    const text=paragraphs.join('\n');
    const han=(text.match(/\p{Script=Han}/gu)||[]).length;
    const normalized=text.replace(/\s+/g,'').trim();
    const fingerprint=createHash('sha256').update(normalized).digest('hex');
    if(seen.has(fingerprint))issue('exact-duplicate',path,`Same extracted prose as ${seen.get(fingerprint)}`);
    else seen.set(fingerprint,path);
    if(han<3000)issue('short-chapter',path,`${han} Han characters; required >=3000`);
    if(han>3500)issue('long-chapter',path,`${han} Han characters; required <=3500`);
    if(paragraphs.length===0)issue('no-prose',path,'No article paragraphs');
    if(!tocHtml.includes(`../${path}`))issue('toc-missing-link',toc,`No link to chapter ${number}`);
    const pager=html.match(/<div\s+class=["']pager["'][^>]*>([\s\S]*?)<\/div>/i)?.[1]||'';
    const nav=[...pager.matchAll(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
    for(const [kind,label,expected] of [
      ['prev','上一章',number>1?`chapters/volume-${id(Math.floor((number-2)/10)+1)}/chapter-${cid((number-2)%10+1)}.html`:null],
      ['next','下一章',number<volumes.at(-1)*10?`chapters/volume-${id(Math.floor(number/10)+1)}/chapter-${cid(number%10+1)}.html`:null]
    ]){
      if(!expected)continue;
      const a=nav.find(m=>m[2].includes(label));
      if(!a){issue('navigation-label',path,`No ${kind} chapter link`);continue;}
      const resolved=new URL(a[1],`https://example.invalid/${path}`).pathname.replace(/^\//,'');
      if(resolved!==expected)issue('navigation-target',path,`${kind} points to ${resolved}, expected ${expected}`);
    }
    rows.push({volume:v,chapter:n,globalChapter:number,path,han,paragraphs:paragraphs.length});
    shortest=Math.min(shortest,han);longest=Math.max(longest,han);totalHan+=han;
  }
  const valid=rows.filter(r=>r.volume===v);
  perVolume.push({volume:v,chapters:valid.length,hanTotal:totalHan,
    hanMin:Number.isFinite(shortest)?shortest:null,hanMax:longest||null,
    outsideRange:valid.filter(r=>r.han<3000||r.han>3500).length});
}
const summary={date:'2026-11-12',expectedVolumes:volumes.at(-1)||0,
  expectedChapters:allPaths.length,scannedChapters:rows.length,prologueExists:existsSync(join(root,'chapters/volume-01/prologue.html')),
  outsideRange:rows.filter(r=>r.han<3000||r.han>3500).length,
  issueCounts:Object.fromEntries([...new Set(issues.map(x=>x.kind))].sort().map(k=>[k,issues.filter(x=>x.kind===k).length]))};
if(!summary.prologueExists)issue('missing-prologue','chapters/volume-01/prologue.html','Published prologue missing');
const report={summary:{...summary,issueCounts:Object.fromEntries([...new Set(issues.map(x=>x.kind))].sort().map(k=>[k,issues.filter(x=>x.kind===k).length]))},
  perVolume,chapters:rows,issues};
const out=join(root,'audit-output','story-integrity.json');
mkdirSync(dirname(out),{recursive:true});
writeFileSync(out,JSON.stringify(report,null,2)+'\n');
console.log('[FULL STORY AUDIT] '+JSON.stringify(report.summary));
for(const p of perVolume)console.log(`[VOL ${id(p.volume)}] chapters=${p.chapters} han=${p.hanTotal} range=${p.hanMin}-${p.hanMax} out-of-range=${p.outsideRange}`);
for(const [kind,count] of Object.entries(report.summary.issueCounts))console.log('[ISSUE] '+kind+': '+count);
console.log('Report: audit-output/story-integrity.json (counts and file paths only, no full prose)');
if(strict && issues.length)process.exitCode=1;
