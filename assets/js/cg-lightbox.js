/* 万界视觉图鉴 V2 · 无依赖高清查看器，只接管已显示的图鉴图片链接。 */
(()=>{'use strict';
const prefix='/zero-sequence-public/assets/images/codex/';
let dialog,preview,openOriginal,closeButton,previousFocus;
function close(){
 if(dialog&&dialog.open)dialog.close();
}
function setup(){
 if(dialog)return;
 if(typeof HTMLDialogElement==='undefined'||!HTMLDialogElement.prototype.showModal)return;
 dialog=document.createElement('dialog');dialog.className='zs-cg-lightbox';dialog.setAttribute('aria-label','高清CG查看');
 const frame=document.createElement('div');frame.className='zs-cg-lightbox-frame';
 const tools=document.createElement('div');tools.className='zs-cg-lightbox-toolbar';
 closeButton=document.createElement('button');closeButton.type='button';closeButton.className='zs-cg-lightbox-close';closeButton.textContent='关闭 ×';closeButton.setAttribute('aria-label','关闭高清图片');
 openOriginal=document.createElement('a');openOriginal.className='zs-cg-lightbox-original';openOriginal.textContent='查看原始图片';openOriginal.target='_blank';openOriginal.rel='noopener';
 preview=document.createElement('img');preview.className='zs-cg-lightbox-preview';preview.alt='高清CG插画';
 tools.append(openOriginal,closeButton);frame.append(tools,preview);dialog.append(frame);document.body.append(dialog);
 closeButton.addEventListener('click',close);
 dialog.addEventListener('click',e=>{if(e.target===dialog)close();});
 dialog.addEventListener('close',()=>{preview.removeAttribute('src');previousFocus?.focus?.();previousFocus=null;});
}
document.addEventListener('click',event=>{
 const anchor=event.target?.closest?.('a[href]');
 if(!anchor)return;
 const url=new URL(anchor.href,location.href);
 if(url.origin!==location.origin||!url.pathname.startsWith(prefix)||!url.pathname.endsWith('.webp'))return;
 setup();if(!dialog)return; // 浏览器不支持时保留原本新标签页查看方式
 event.preventDefault();
 previousFocus=anchor;
 const imageUrl=url.href;
 preview.alt=anchor.getAttribute('aria-label')||anchor.querySelector('img')?.alt||'高清CG插画';
 openOriginal.href=imageUrl;
 preview.src=imageUrl;
 if(!dialog.open)dialog.showModal();
});
})();
