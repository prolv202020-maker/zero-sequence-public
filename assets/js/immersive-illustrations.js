/* 《第零序列》沉浸式插画阅读 V1
 * 为三篇共23幅已发布插画在匹配的剧情段落后追加图像。
 * 不改小说段落、不改阅读进度LocalStorage、不写用户状态、不触碰音频与人物立绘。
 */
(()=>{
'use strict';
const ROOT='/zero-sequence-public/';
const SCENES=Object.freeze([{"id":"p1-starfall-town","v":1,"n":6,"needle":"石板路，木质屋檐，远处教堂尖顶","file":"scene-starfall-town.webp","title":"晨星镇 · 黎明","note":"首次进入晨星镇的概念场景；建筑细节以正文描述为准。"},{"id":"p1-viland-city","v":3,"n":3,"needle":"NPC商会、玩家摊位、工匠铺、拍卖行都集中在几条街上","file":"scene-viland-city.webp","title":"维兰德城 · 城市与商路","note":"交易广场与繁荣城邦的艺术化俯瞰，不代表精确城防地图。"},{"id":"p1-graystone-trade","v":5,"n":4,"needle":"矿道运货绳索断裂，两辆满载赤纹矿的车翻在岔道","file":"scene-graystone-trade.webp","title":"灰石盟约 · 运输线","note":"依据矿道货运危机绘制的运输线概念图；救援细节以正文为准。"},{"id":"p1-frost-border","v":7,"n":8,"needle":"顾长渊站上西侧风口的防线，望见雪地里越来越多的移动黑点","file":"scene-frost-border.webp","title":"白霜边境 · 寒潮","note":"雪原防线的环境概念画，不表示本章所有参战人物的精确站位。"},{"id":"p1-blackwind-trial","v":9,"n":8,"needle":"风喉兽从巨岩后出现时，众人先听见它体内沉重的吸气声","file":"scene-blackwind-trial.webp","title":"黑风试炼 · 危险之地","note":"依据黑风峡谷的危机气氛创作；怪物具体外形与战斗机制以正文为准。"},{"id":"p2-shadow-road","v":11,"n":1,"needle":"城西道路复核。","file":"scene-02-shadow-road.webp","title":"契约之外 · 商路初行","note":"灰石商路的主题概念画，非合同讨论现场的写实场景。"},{"id":"p2-forge-ledger","v":13,"n":3,"needle":"顾长渊趁等待鉴定的时间，参观了奥德的普通锻造流程","file":"scene-02-forge-ledger.webp","title":"锻火账本 · 熔炉之光","note":"结合奥德工坊的炉火与工匠工作创作的概念场景。"},{"id":"p2-white-candle","v":14,"n":1,"needle":"白烛医疗院的早钟敲到第三下时","file":"scene-02-white-candle.webp","title":"白烛与月 · 夜间医馆","note":"画作以夜间医疗院为主题；当前对应段落发生在早晨，并非同一时刻的写实画面。"},{"id":"p2-mirror-path","v":15,"n":1,"needle":"在西境的四个夜晚里，闻镜守着同一处山谷","file":"scene-02-mirror-path.webp","title":"镜路歧途 · 旧境幻影","note":"镜片与旧路影像的美术演绎，不能视为已经核实存在的秘密通道。"},{"id":"p2-north-wall","v":16,"n":1,"needle":"远处雪线后似乎有矮小黑影跟随","file":"scene-02-north-wall.webp","title":"北境长墙 · 雪线守望","note":"边境雪线与守卫日常的场景概念图，真实兽迹及危险区域仍须核实。"},{"id":"p2-hundred-lights","v":20,"n":10,"needle":"窗外百城灯火未熄，世界在无数人的生活里继续向前","file":"scene-02-hundred-lights.webp","title":"星火未熄 · 百城灯火","note":"第二篇收束时的群城灯火主题意象，并非所有城市同时发生同一事件。"},{"id":"echo-ridge","v":21,"n":10,"needle":"闻镜随后说明，回声坡的两次金属响动可能来自旧设施共振","file":"scene-03-echo-ridge-cg.webp","title":"回声坡 · 两道余音","note":"据回声坡记录创作的场景意象；两道钟声尚未得到最终解释。"},{"id":"echo-investigation","v":22,"n":8,"needle":"古言澈带着银月改装过的双记录探查器到场","file":"part-03-echo-ridge-investigation.webp","title":"回声坡 · 遗迹共鸣调查","note":"声学复测的艺术化呈现；实际研究结论以正文为准。"},{"id":"lost-city","v":23,"n":4,"needle":"测绘员梅岚带来一张最新的道路安全图","file":"scene-03-lost-city-cg.webp","title":"栖潮旧城 · 失名街道","note":"根据空白街名与迁居线索重构的想象画面，并非现场确认的旧城原貌。"},{"id":"storm-voyage","v":25,"n":2,"needle":"一道巨浪把灰鲸号推得横向滑行","file":"scene-03-storm-voyage-cg.webp","title":"断潮回廊 · 灰鲸航路","note":"灰鲸号风浪航程的概念美术；海兽形象与法术光效为艺术化演绎。"},{"id":"gray-whale-battle","v":25,"n":3,"needle":"正当众人以为兽群正在散去时，一头体型远超同类的裂鳍兽从深处升起","file":"part-03-gray-whale-storm-battle.webp","title":"断潮航路 · 灰鲸号追猎","note":"依据裂鳍兽袭船与防守行动创作；画面中的巨鲸轮廓不代表新增正史怪物。"},{"id":"outer-ring","v":26,"n":5,"needle":"对岸的矿盐袋已经破开。两头岩甲兽撞上桥下的旧石墩","file":"scene-03-outer-ring-cg.webp","title":"外环裂线 · 岩甲险径","note":"断线围猎与岩甲兽冲击的概念复现；救援与战斗细节以正文为准。"},{"id":"ring-ensemble","v":27,"n":1,"needle":"工作室里却已经吵成一团。林烈把一张金底黑纹的邀请函拍在桌上","file":"part-03-ring-ensemble.webp","title":"星环遗迹 · 远征集结","note":"以伙伴共同迎接熔谷挑战为主题的群像意象，并非会议现场写实。"},{"id":"molten-valley","v":27,"n":5,"needle":"返回入口时，三枚控制片按照规定交给公共设施管理者","file":"scene-03-molten-valley-cg.webp","title":"熔谷争锋 · 古炉试炼","note":"表现古炉石门开启后的探索氛围；巨型炉卫属于概念美术意象。"},{"id":"molten-guardian","v":27,"n":7,"needle":"裁判界面浮出名字：熔背龙蜥，中央炉精英守卫","file":"part-03-molten-forge-guardian.webp","title":"熔谷争锋 · 中央炉守卫战","note":"本章实际精英怪为熔背龙蜥；画面中的熔炉巨像仅为视觉象征。"},{"id":"star-ring-council","v":30,"n":1,"needle":"罗烬在会议里公布了预算","file":"part-03-star-ring-council.webp","title":"零刻回廊 · 星环战略议会","note":"展示团队资源与探索决策的艺术化构图，真实会议地点以正文为准。"},{"id":"zero-corridor","v":30,"n":3,"needle":"在温羽发出出发信号后，队伍沿石柱走进回廊","file":"scene-03-zero-corridor-cg.webp","title":"零刻回廊 · 共同前行","note":"对伙伴同行和未知回廊的宏大想象；本章的真实通道以正文描写为准。"},{"id":"starlit-oath","v":30,"n":10,"needle":"直到伙伴们一次次独立完成任务，他才明白所谓改变命运","file":"part-03-starlit-oath.webp","title":"星域同行 · 光之誓约","note":"第三篇结尾的团队主题意象，不代表现阶段已经抵达未来星域。"}]);
const match=location.pathname.match(/\/chapters\/volume-(\d{2})\/chapter-(\d{3})\.html$/);
if(!match)return;
const volume=Number(match[1]),chapter=Number(match[2]);
if(volume<1||volume>30||chapter<1||chapter>10)return;
const part=Math.ceil(volume/10);
const matching=SCENES.filter(x=>x.v===volume&&x.n===chapter);
if(!matching.length)return;
const article=document.querySelector('.article');
if(!article)return;
const paragraphs=[...article.querySelectorAll(':scope > p')];
function el(name,cls,text){
 const node=document.createElement(name);
 if(cls)node.className=cls;
 if(text!==undefined)node.textContent=text;
 return node;
}
let dialog=null,previousFocus=null;
function getDialog(){
 if(dialog)return dialog;
 dialog=document.createElement('dialog');
 dialog.className='zs-illustration-lightbox';
 dialog.setAttribute('aria-label','高清插画查看器');
 const head=el('div','zs-illustration-dialog-head');
 const title=el('h2','zs-illustration-dialog-title');
 const close=el('button','zs-illustration-dialog-close','关闭 ×');close.type='button';
 close.setAttribute('aria-label','关闭高清插画');
 close.addEventListener('click',()=>dialog.close());
 head.append(title,close);
 const img=document.createElement('img');img.className='zs-illustration-dialog-image';
 img.alt='';img.decoding='async';img.width=1440;img.height=810;
 const foot=el('p','zs-illustration-dialog-note');
 dialog.append(head,img,foot);
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
 dialog.addEventListener('close',()=>{img.removeAttribute('src');previousFocus?.focus?.();});
 document.body.append(dialog);
 return dialog;
}
function openLightbox(scene,src,trigger){
 if(typeof HTMLDialogElement==='undefined'||typeof HTMLDialogElement.prototype.showModal!=='function'){window.open(src,'_blank','noopener,noreferrer');return;}
 const d=getDialog();previousFocus=trigger;
 const img=d.querySelector('img');img.src=src;img.alt=scene.title+' · 第零序列插画';
 d.querySelector('h2').textContent=scene.title;
 d.querySelector('.zs-illustration-dialog-note').textContent=scene.note;
 d.showModal();
}
function addScene(scene){
 const target=paragraphs.filter(p=>p.textContent.includes(scene.needle));
 // 强制精确唯一匹配；正文变化时不猜位置、不把画塞到错误段落。
 if(target.length!==1)return;
 const id='zs-story-art-'+scene.id;
 if(document.getElementById(id))return;
 const imgPath=ROOT+'assets/images/illustrations/'+scene.file;
 const figure=el('figure','zs-story-illustration');figure.id=id;
 const button=el('button','zs-story-illustration-open');button.type='button';
 button.setAttribute('aria-label','放大查看插画：'+scene.title);
 const image=document.createElement('img');
 image.src=imgPath;image.width=1440;image.height=810;image.loading='lazy';image.decoding='async';
 image.alt=scene.title+'的剧情概念插画；画面属于艺术化呈现，详情以本章正文为准';
 const fallback=el('span','zs-story-illustration-fallback','图片暂时无法加载，可进入插画馆查看。');
 image.addEventListener('error',()=>{image.hidden=true;fallback.hidden=false;},{once:true});
 fallback.hidden=true;
 button.append(image,fallback);button.addEventListener('click',()=>openLightbox(scene,imgPath,button));
 const caption=el('figcaption','zs-story-illustration-caption');
 const partName=['轮回启幕','百城星火','临界回声'][part-1];
 const eyebrow=el('span','zs-story-illustration-kicker','第'+['一','二','三'][part-1]+'篇《'+partName+'》 · 剧情概念插画');
 const heading=el('strong','zs-story-illustration-name',scene.title);
 const note=el('p','zs-story-illustration-note',scene.note);
 const link=el('a','zs-story-illustration-gallery','在插画馆查看此作品 →');
 link.href=ROOT+'parts/illustrations-0'+part+'.html#zs-gallery-art-'+scene.id;
 caption.append(eyebrow,heading,note,link);figure.append(button,caption);
 target[0].insertAdjacentElement('afterend',figure);
 if(location.hash==='#'+id){requestAnimationFrame(()=>figure.scrollIntoView({block:'start',behavior:'auto'}));}
}
for(const scene of matching)addScene(scene);
})();
