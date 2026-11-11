/* 第零序列 · 第四篇第31—40卷CG封面增强。
   所有内容仅在文件真实存在并且成功解码后替换文字艺术封面。
   不读写阅读进度，不改变四篇防剧透及章节权限。 */
(() => {
  'use strict';
  const part=Number(document.body.dataset.zsPart||0);
  if(part!==4)return;
  const base='../assets/images/covers/part-04/';
  function name(vol){return 'volume-'+String(vol)+'.webp';}
  function attach(placeholder,url,alt,kind){
    if(!placeholder || placeholder.dataset.cgHandled==='1')return;
    placeholder.dataset.cgHandled='1';
    const picture=new Image();
    picture.decoding='async';
    picture.alt=alt;
    picture.className=kind==='card'?'zs-cover-thumb zs-part04-cg':'zs-part04-volume-cg';
    picture.loading=kind==='card'?'lazy':'eager';
    picture.onload=()=>{
      if(!placeholder.isConnected)return;
      if(kind==='card'){
        const media=placeholder.closest('.zs-cover-media');
        if(!media)return;
        media.insertBefore(picture,placeholder);
        media.classList.add('zs-has-cg-cover');
      }else{
        placeholder.parentNode.insertBefore(picture,placeholder);
        placeholder.classList.add('zs-cg-fallback-hidden');
      }
    };
    picture.onerror=()=>{placeholder.dataset.cgHandled='0';};
    picture.src=url;
  }
  function run(){
    const grid=document.querySelector('.zs-cover-grid');
    if(grid){
      [...grid.querySelectorAll(':scope > a.zs-cover-card')].forEach(a=>{
        const match=a.getAttribute('href')?.match(/volume-(3[1-9]|40)\.html/);
        if(!match)return;
        const vol=Number(match[1]);
        const placeholder=a.querySelector('.zs-cover-media > .zs-volume-cover');
        attach(placeholder,base+name(vol),'第'+vol+'卷CG正式封面','card');
      });
    }
    const match=location.pathname.match(/\/volumes\/volume-(3[1-9]|40)\.html$/);
    if(match){
      const vol=Number(match[1]);
      const candidate=document.querySelector('main figure [role="img"]');
      attach(candidate,base+name(vol),'第'+vol+'卷CG正式封面','volume');
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);
  else run();
})();
