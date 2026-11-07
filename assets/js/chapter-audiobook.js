/* 《第零序列》第一章有声版：不自动播放，也不改动任何阅读进度。 */
(()=>{'use strict';
const audio=document.getElementById('zs-chapter-narration');
if(!audio)return;
const message=document.getElementById('zs-chapter-narration-status');
const say=text=>{if(message)message.textContent=text};
audio.addEventListener('play',()=>{
 const bgm=document.querySelector('#zs-audio.is-playing .zs-play');
 if(bgm)bgm.click();
 say('正在播放第一章中文女声。背景音乐已自动暂停（如之前正在播放）。');
});
audio.addEventListener('pause',()=>{if(!audio.ended)say('朗读已暂停，可从当前进度继续。')});
audio.addEventListener('ended',()=>say('第一章朗读已完成。可继续阅读下一章。'));
audio.addEventListener('error',()=>say('音频加载失败，请检查网络或点击「下载完整 MP3」后播放。'));
})();
