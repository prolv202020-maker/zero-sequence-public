/* 《第零序列》通用章节有声版：手动播放，保持阅读进度与BGM协同。 */
(()=>{'use strict';
const audio=document.getElementById('zs-chapter-narration');
if(!audio)return;
// Narration binaries remain immutable on the public audio-archive-v1 branch.
// They are not packed into GitHub Pages; rewrite native chapter player AND download links.
const ARCHIVE='https://raw.githubusercontent.com/prolv202020-maker/zero-sequence-public/audio-archive-v1/';
const toArchive=url=>{try{const full=new URL(url,location.href);const pos=full.pathname.indexOf('/assets/audio/audiobook/');return pos<0?null:ARCHIVE+full.pathname.slice(pos+1)+full.search;}catch(_){return null;}};
let migrated=false;
for(const source of audio.querySelectorAll('source[src]')){const url=toArchive(source.getAttribute('src'));if(url){source.src=url;migrated=true;}}
for(const anchor of document.querySelectorAll('#zs-audiobook-player a[href*="assets/audio/audiobook/"]')){const url=toArchive(anchor.getAttribute('href'));if(url){anchor.href=url;anchor.rel='noopener noreferrer';}}
if(migrated)audio.load();
const message=document.getElementById('zs-chapter-narration-status');
const heading=document.getElementById('zs-audiobook-title');
const chapterLabel=(heading&&heading.textContent.match(/(?:序章|第[一二三四五六七八九十百]+章)/)||[])[0]||'本章';
const say=text=>{if(message)message.textContent=text};
audio.addEventListener('play',()=>{
 const bgm=document.querySelector('#zs-audio.is-playing .zs-play');
 if(bgm)bgm.click();
 say('正在播放'+chapterLabel+'中文女声。背景音乐已自动暂停（如之前正在播放）。');
});
audio.addEventListener('pause',()=>{if(!audio.ended)say('朗读已暂停，可从当前进度继续。')});
audio.addEventListener('ended',()=>say(chapterLabel+'朗读已完成。可继续阅读下一章。'));
audio.addEventListener('error',()=>say('音频加载失败，请检查网络或点击「下载完整 MP3」后播放。'));
})();
