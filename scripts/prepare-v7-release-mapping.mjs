#!/usr/bin/env node
/* V7: prepare deterministic GitHub Releases URLs without uploading or switching any production content. */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import assert from 'node:assert/strict';
const inventory=JSON.parse(readFileSync(new URL('../docs/v7-audio-inventory.json',import.meta.url),'utf8'));
assert.equal(inventory.files.length,131);
const repo='prolv202020-maker/zero-sequence-public';
const rows=inventory.files.map((f,i)=>{
 const match=f.path.match(/^assets\/audio\/audiobook\/(part-\d{2})\/(volume-\d{2})\/(chapter-\d{3}|prologue)\.mp3$/);
 assert.ok(match,'Invalid source path '+f.path);
 const [,part,volume,chapter]=match;
 const tag='zs-audio-'+volume+'-v7';
 const asset=part+'-'+volume+'-'+chapter+'.mp3';
 return {index:i+1,part,volume,chapter,oldPath:f.path,bytes:f.bytes,gitBlobSha:f.gitBlobSha,proposedReleaseTag:tag,proposedAssetName:asset,proposedUrl:'https://github.com/'+repo+'/releases/download/'+tag+'/'+asset,status:'NOT_UPLOADED',switchApproved:false};
});
const names=new Set(rows.map(x=>x.proposedReleaseTag+'/'+x.proposedAssetName));
assert.equal(names.size,rows.length,'Duplicate proposed release path');
assert.equal(rows.reduce((n,x)=>n+x.bytes,0),929684308);
const out={schema:'zs-release-migration-candidate-v7',generatedFrom:'docs/v7-audio-inventory.json',notice:'Proposed URLs DO NOT EXIST until files are uploaded and verified; never publish these as production audio sources.',publishedSiteUnchanged:true,releaseCount:13,audioFileCount:rows.length,files:rows};
mkdirSync('v7-migration-results',{recursive:true});
writeFileSync(join('v7-migration-results','release-candidates.json'),JSON.stringify(out,null,2)+'\n');
console.log('V7 PREP PASS: '+rows.length+' entries in '+new Set(rows.map(x=>x.proposedReleaseTag)).size+' proposed releases; no files uploaded, no website changed.');
