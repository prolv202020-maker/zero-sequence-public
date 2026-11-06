/* 第零序列人物专属画集：官方旧立绘 + 独立视觉主题，严格在解锁后加载。 */
(()=>{
'use strict';
const ROOT='/zero-sequence-public/';
const people=[
 {slug:'gu-changyuan',name:'顾长渊',career:'剑士',need:1,art:'f948ca5d-b2ab-4754-9cc7-72ed6df61f7c.png',theme:'time',icon:'✦',caption:'剑锋所指，不只是过去的答案。'},
 {slug:'su-zili',name:'苏紫璃',career:'治疗师',need:11,art:'586162d7-874d-4bf5-99a8-18fd31b2164e.png',theme:'healing',icon:'✧',caption:'守护也需要判断与勇气。'},
 {slug:'lin-lie',name:'林烈',career:'狂战士',need:11,art:'linlie.png',theme:'ember',icon:'◆',caption:'向前的力量，来自对伙伴的信任。'},
 {slug:'luo-jin',name:'罗烬',career:'刺客',need:11,art:'luojin.png',theme:'shadow',icon:'◇',caption:'行动与时机，比锋芒更有分量。'},
 {slug:'ling-tianyao',name:'凌天曜',career:'雷电术士',need:11,art:'ling%20tianyao.png',theme:'thunder',icon:'ϟ',caption:'雷光之下，也有独立的选择。'},
 {slug:'dai-xuanyue',name:'戴玄岳',career:'盾卫',need:11,art:'DAI%20XUANYUE.png',theme:'shield',icon:'⬡',caption:'一道防线，是为了让更多人前行。'},
 {slug:'gu-yanche',name:'古言澈',career:'职业待正文揭露',need:21,art:'GU%20YANCHE.png',theme:'wanderer',icon:'✵',caption:'新的同行者，自有他要走的路。'}
];
function read(){
 try{if(window.ZSUnlock?.get)return window.ZSUnlock.get(1).max;
 const obj=JSON.parse(localStorage.getItem('zs:part-progress:v1')||'{}');
 return Math.min(100,Math.max(0,Number(obj.p01?.max)||0));
 }catch{return 0;}
}
const main=document.getElementById('zs-character-art-grid');
const status=document.getElementById('zs-character-art-status');
if(!main||!status)return;
function el(tag,cls,txt){const x=document.createElement(tag);if(cls)x.className=cls;if(txt!==undefined)x.textContent=txt;return x;}
function render(){
 const current=read();main.replaceChildren();
 for(const [i,c] of people.entries()){
  const shown=current>=c.need;
  const card=el('article','zs-character-art-card zs-art-'+c.theme+(shown?'':' is-locked'));
  const visual=el('div','zs-character-art-visual');
  if(shown){
    const backdrop=el('div','zs-character-art-symbol',c.icon);backdrop.setAttribute('aria-hidden','true');
    const pic=el('img','zs-character-art-portrait');pic.src=ROOT+'assets/images/characters/'+c.slug+'-approved.webp';pic.alt=c.name+'已有官方人物立绘';pic.loading='lazy';pic.decoding='async';
    visual.append(backdrop,pic);
  }else{const lock=el('span','zs-character-art-lock','🔒');lock.setAttribute('aria-label','人物尚未解锁');visual.append(lock);}
  const copy=el('div','zs-character-art-copy');
  copy.append(el('small','',shown?'CHARACTER '+String(i+1).padStart(2,'0')+' · 已解锁':'CHARACTER · 未解锁'),el('h2','',shown?c.name:'尚未揭晓'));
  const career=el('p','zs-character-art-role',shown?c.career:'继续阅读后开放人物视觉');copy.append(career);
  copy.append(el('p','zs-character-art-caption',shown?c.caption:'阅读第一篇第'+c.need+'章后开放此人物专属插画。'));
  if(shown){
    const link=el('a','', '打开个人档案 →');link.href=ROOT+'archive/characters/'+c.slug+'.html';copy.append(link);
  }
  card.append(visual,copy);main.append(card);
 }
 status.textContent='第一篇已读 '+current+'/100 章 · 人物专属插画已解锁 '+people.filter(p=>current>=p.need).length+'/'+people.length+' 幅';
}
document.addEventListener('zs:part-progress-changed',render);
window.addEventListener('pageshow',render);
render();
})();