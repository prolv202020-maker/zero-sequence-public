/* 第零序列 · 页面资源与阅读功能支持（无说书功能） */
const PLAYER='<script src="/zero-sequence-public/assets/js/audio-player.js?v=11" defer></script>';
const STYLE_VERSION=6;
const UNLOCK='<script src="/zero-sequence-public/assets/js/progressive-archive.js?v=27" defer></script>';
const READER='<script src="/zero-sequence-public/assets/js/reader-experience.js?v=29" defer></script>';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{
  if(event.request.mode!=='navigate') return;
  event.respondWith((async()=>{
    try{
      const res=await fetch(event.request,{cache:'no-store'});
      const type=res.headers.get('content-type')||'';
      if(!type.includes('text/html')) return res;
      let html=await res.text();
      // Remove any obsolete narration script reference in previously published pages.
      html=html.replace(/<script\b[^>]*\bsrc=["'][^"']*narrator-pro\.js[^"']*["'][^>]*><\/script>\s*/gi,'');
      html=html.replace(/((?:\.\.\/)*assets\/css\/style\.css)(?:\?v=\d+)?/g,'$1?v=6');
      const musicPattern=/<script\b[^>]*\bsrc=["'][^"']*audio-player\.js(?:\?[^"']*)?["'][^>]*><\/script>/gi;
      if(musicPattern.test(html)){
        html=html.replace(musicPattern,PLAYER);
      }else{
        html=html.replace('</body>',PLAYER+'</body>');
      }
      if(!/(?:\/zero-sequence\/)?assets\/js\/progressive-archive\.js(?:\?v=\d+)?/.test(html)) html=html.replace('</body>',UNLOCK+'</body>');
      else html=html.replace(/((?:\/zero-sequence\/)?assets\/js\/progressive-archive\.js)(?:\?v=\d+)?/g,'$1?v=27');
      if(!/(?:\/zero-sequence\/)?assets\/js\/reader-experience\.js(?:\?v=\d+)?/.test(html)) html=html.replace('</body>',READER+'</body>');
      const headers=new Headers(res.headers);headers.delete('content-length');headers.set('cache-control','no-cache');
      return new Response(html,{status:res.status,statusText:res.statusText,headers});
    }catch(err){return fetch(event.request);}
  })());
});
