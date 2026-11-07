/* 第零序列 · 分篇独立解锁（无后端，进度仅存此浏览器） */
(function(){
'use strict';
const BASE='/zero-sequence-public/';
const KEY='zs:part-progress:v1';
const partNames={1:'轮回启幕',2:'百城星火',3:'临界回声'};
const entries=[
 {p:1,n:1,k:'人物',t:'顾长渊',d:'故事的主要视角人物。一次重返，让他重新思考什么才是最重要的。'},
 {p:1,n:1,k:'人物',t:'苏紫璃与旧日伙伴',d:'在故事的起点，他重新看见了那些重要之人。'},
 {p:1,n:3,k:'世界',t:'《神魔轮回》',d:'在全球开服前，围绕这款游戏的异常已经开始出现。'},
 {p:1,n:6,k:'地图',t:'晨星镇',d:'故事初期的探索区域。更多地点将在阅读推进后开放。'},
 {p:1,n:7,k:'人物',t:'马库斯·铁岩',d:'晨星镇铁匠，与一把旧剑有关。'},
 {p:1,n:11,k:'人物',t:'同行的伙伴',d:'正式开服后，众人的团队关系在行动中逐渐形成。'},
 {p:1,n:11,k:'职业',t:'职业成长',d:'普通职业的基础与实际成长开始体现；不提前显示人物底牌。'},
 {p:1,n:21,k:'地图',t:'维兰德城',d:'新的城市地图与相应的人物、事务逐渐出现。'},
 {p:1,n:21,k:'势力',t:'长渊工作室',d:'一个以合作和情报为基础的团队开始建立自己的路线。'},
 {p:1,n:21,k:'势力',t:'灰鸦与白烛',d:'情报、医疗与城市生活不再只是玩家任务的背景。'},
 {p:1,n:31,k:'地图',t:'北线第三路碑',d:'探索开始涉及被遗忘的道路和失踪事件。'},
 {p:1,n:41,k:'势力',t:'灰石盟约',d:'矿道、运输、守卫和工匠需要共同承担城市的安全。'},
 {p:1,n:51,k:'地图',t:'失落商道',d:'新的商路和不同旅行者的选择，让世界变得更广阔。'},
 {p:1,n:61,k:'地图',t:'白霜边境',d:'寒潮与边境防线带来新的生存挑战。'},
 {p:1,n:71,k:'势力',t:'百城之约',d:'商路、交易和各方协商开始交织。'},
 {p:1,n:81,k:'事件',t:'黑风试炼',d:'并非所有冒险都能全身而退。'},
 {p:1,n:91,k:'地图',t:'无名之门',d:'一处重要遗迹成为阶段性探索焦点。'},
 {p:2,n:1,k:'人物',t:'陈陆与独立玩家小队',d:'普通玩家与NPC的价值分歧'},
 {p:2,n:4,k:'势力',t:'现实仓储计划',d:'工作室筹划现实合法储备基地'},
 {p:2,n:11,k:'势力',t:'神锋俱乐部',d:'职业玩家与西境商路竞争'},
 {p:2,n:21,k:'职业',t:'万器成长',d:'锻造与材料决定长期武器成长'},
 {p:2,n:31,k:'势力',t:'白烛联合医疗',d:'治疗研究需要证据、代价和合作'},
 {p:2,n:36,k:'地图',t:'无人记得的花园',d:'林知夏探索古代植物园'},
 {p:2,n:41,k:'地图',t:'镜路歧途',d:'独立探索与傀儡研究交错'},
 {p:2,n:51,k:'势力',t:'北境防线',d:'戴玄岳与林烈独立领导战斗'},
 {p:2,n:61,k:'人物',t:'分开的伙伴',d:'七人的独立任务与信任变化'},
 {p:2,n:71,k:'势力',t:'现实基地',d:'后勤员工与仓储制度'},
 {p:2,n:81,k:'事件',t:'被改写的情报',d:'对情报伪造与背叛风险的核验'},
 {p:2,n:91,k:'事件',t:'跨城联合行动',d:'不同玩家与NPC协作救援'},
 {p:3,n:1,k:'事件',t:'陌生的设备记录',d:'现实中的技术询问仍需核验来源，尚不能确定其与游戏世界有关。'},
 {p:3,n:3,k:'事件',t:'被冒用的招募',d:'主角团公开澄清假招募，保护受到谣言影响的普通人。'},
 {p:3,n:5,k:'地图',t:'回声坡外围',d:'新旧地图出现差异，测绘仍受已批准的安全路线限制。'},
 {p:3,n:6,k:'事件',t:'灰刺兽遭遇',d:'剑士与盾卫协作保护测绘员，伤势与设备损失需要实际处理。'},
 {p:3,n:8,k:'势力',t:'联合外围观察',d:'不同队伍各自承担职责，并保留拒绝不安全行动的权利。'},
 {p:3,n:10,k:'事件',t:'未解的第二道回声',d:'外围观察留下仍需验证的声音记录，各方安全撤离，新的复测邀请出现。'},
 {p:3,n:11,k:'事件',t:'远域独立复测',d:'正规机构启动受限复测；技术资料仍须按来源独立核验。'},
 {p:3,n:14,k:'地图',t:'被改写的旧航图',d:'游戏中的历史航路标记出现新旧版本冲突。'},
 {p:3,n:17,k:'事件',t:'逆风撤离',d:'各方按既定职责面对危机，撤退同样需要勇气。'},
 {p:3,n:20,k:'事件',t:'第三道刻痕',d:'调查取得新的版本线索，但未揭开世界融合的最终真相。'},
 {p:3,n:21,k:'地图',t:'栖潮旧城',d:'旧城籍、航道与仍待核验的街名开始被重新寻找。'},
 {p:3,n:23,k:'事件',t:'档案回执更正',d:'目录缺号已得到部分行政解释，未经核验的图片不等于事实。'},
 {p:3,n:24,k:'地图',t:'空白街名',d:'巡路队允许有限测绘，旧井与民居位置受到保护。'},
 {p:3,n:26,k:'事件',t:'计时独立复测',d:'现实设备的不同步现象继续依照实验条件独立核验。'},
 {p:3,n:27,k:'人物',t:'归档者与迁居记录',d:'保管所依照家族授权核对旧城籍，保护居民的私人信息。'},
 {p:3,n:28,k:'事件',t:'旧道撤离',d:'顾长渊与队友按巡路队指挥护送受困人员安全撤出。'},
 {p:3,n:30,k:'地图',t:'外缘旧门线索',d:'地图留下尚未解释的门形图例，后续调查需要独立来源。'},
 {p:3,n:31,k:'地图',t:'外缘旧门',d:'获许可的测绘确认外缘旧门遗构，旧图例仍需尊重历史用途与安全界限。'},
 {p:3,n:33,k:'事件',t:'失效通行证',d:'错误旧图和伪造许可引发安全风险，公共路线应核对有效日期。'},
 {p:3,n:37,k:'势力',t:'旧门社区协商',d:'居民、巡路队与研究者共同商定纪念区和通行安全规则。'},
 {p:3,n:38,k:'事件',t:'雨线救援',d:'剑士与伙伴协助伤者安全撤离，后续修桥和物资责任需要持续处理。'},
 {p:3,n:40,k:'地图',t:'远域接续路线索引',d:'只确认存在有待合法核验的历史路线目录，不提前公开未证实的去向。'},
 {p:3,n:41,k:'地图',t:'远域第二张路网',d:'远域接续路线的公开护运委托引出灰鲸号航程，旧攻略不再可当作确定导航。'},
 {p:3,n:43,k:'怪物',t:'裂鳍兽群',d:'断潮水域出现裂鳍兽与可疑诱引光球，船只必须依靠团队防守。'},
 {p:3,n:45,k:'人物',t:'梁策的选择',d:'神锋边海分队与顾长渊合作守住伤员转运路线，双方仍保留竞争关系。'},
 {p:3,n:46,k:'地点',t:'七号中继站',d:'旧塔非法副线被发现，失联检修员获救，部分测量差异仍有待核验。'},
 {p:3,n:48,k:'事件',t:'前世航图失准',d:'未经独立核验的旧玩家攻略可能过时或误导，顾长渊放下独断并完善复核规则。'},
 {p:3,n:50,k:'地图',t:'远域外环接续方案',d:'灰鲸号救援告一段落，仅确认存在下一阶段可依法查询的旧线路目录。'},
 {p:3,n:51,k:'地图',t:'外环第三测绘段',d:'获许可的外环补绘任务开始，旧标尺与新路牌需要现场独立核对。'},
 {p:3,n:53,k:'事件',t:'第三根标尺与工具房',d:'旧电缆门附近发现人为移动的标尺，部分测距数据仍需复测。'},
 {p:3,n:54,k:'事件',t:'被出售的危险捷径',d:'高价假图使玩家受困，搜救队坚持安全路线与医疗后续责任。'},
 {p:3,n:55,k:'势力',t:'外环护路争端',d:'护卫队遇到有组织的阻拦，线路维护与收费权限成为争议。'},
 {p:3,n:57,k:'怪物',t:'裂脊岩侯',d:'外环精英怪考验剑士短步与盾卫轮换，战斗奖励伴随伤损。'},
 {p:3,n:58,k:'地图',t:'空白终点',d:'旧工程终点留白有历史规划解释，测距的独立异常仍未定论。'},
 {p:3,n:59,k:'事件',t:'收费闸与公共通行',d:'未经许可的收费栏杆被调查，各方讨论护路费用和基本通行权。'},
 {p:3,n:60,k:'事件',t:'路未封死',d:'外环救援阶段结束，部分道路持续维修，新的公共安全规则逐步建立。'},
 {p:3,n:61,k:'事件',t:'熔谷探索战',d:'公开探索赛开启，顾长渊与其他队伍在合理规则下争夺锻造资源。'},
 {p:3,n:62,k:'地图',t:'灰烬熔谷',d:'古炉外侧地形复杂，地火、断道和工匠营地构成任务风险。'},
 {p:3,n:63,k:'职业',t:'三十步剑线',d:'顾长渊在剑士常规技术中调整步伐，正面竞争同时考虑伤势。'},
 {p:3,n:64,k:'怪物',t:'夜行火蜥',d:'夜间怪物迫近补给点，各队伍需兼顾护卫和后勤。'},
 {p:3,n:65,k:'地点',t:'旧炉遗址',d:'锻炉外围开放探索，解机关与实地协作比流言捷径更可靠。'},
 {p:3,n:66,k:'事件',t:'破盾与断刃',d:'防线在强敌面前付出代价，竞争队伍开始重新调整合作。'},
 {p:3,n:67,k:'怪物',t:'熔背龙蜥',d:'精英首领袭来，团队在高热地形展开多阶段应对。'},
 {p:3,n:68,k:'事件',t:'两份战利品',d:'锻造材料紧缺引发分配争议，工匠的安全与承诺不能随意出卖。'},
 {p:3,n:69,k:'职业',t:'折步三连',d:'顾长渊通过常规剑士练习与实战磨出新的连续剑路。'},
 {p:3,n:70,k:'事件',t:'谷外仍有火',d:'熔谷挑战结算，战利品与代价均被记录，未明测距差值继续保留核验。'},
 {p:3,n:71,k:'事件',t:'零点冷链订单',d:'现实冷链试运营开启，工作室面临封纸折痕与温控记录问题。'},
 {p:3,n:72,k:'人物',t:'周禾',d:'仓库值班员在被质疑后坚持按记录与正常流程核实出货。'},
 {p:3,n:73,k:'地图',t:'镜霜驿道',d:'北境旧冰桥与雪线的变化考验护卫队伍和驿工的路线判断。'},
 {p:3,n:74,k:'事件',t:'第二份回执',d:'错误派车通知经核查涉及停用旧接口，工作室建立双端确认机制。'},
 {p:3,n:75,k:'怪物',t:'潜霜兽',d:'冻湖暗流中的高危怪物袭击旧桥，护卫队与驿工合作救援。'},
 {p:3,n:76,k:'怪物',t:'镜霜卫偶',d:'旧塔构装体会封锁重复出现的步法，顾长渊被迫调整剑路。'},
 {p:3,n:77,k:'事件',t:'零下七度',d:'现实冷库故障警报引发紧急应对，独立测量确认局部探头异常。'},
 {p:3,n:78,k:'人物',t:'秦栖',d:'旧驿工联络中找到能够提供观测记录的在任资料维护人员。'},
 {p:3,n:79,k:'怪物',t:'霜镜巡狩者',d:'北境高危精英被驱离护运通道，团队取得战术胜利。'},
 {p:3,n:80,k:'事件',t:'先到的回声',d:'工作室和驿道任务阶段性完成，独立时钟与旧观测仍留有疑问。'},
 {p:2,n:99,k:'势力',t:'深渊方舟第一阶段',d:'初步现实应急据点运转'}
];
function storeRead(){try{const x=JSON.parse(localStorage.getItem(KEY)||'{}');return x&&typeof x==='object'?x:{};}catch(e){return {};}}
function storeWrite(obj){try{localStorage.setItem(KEY,JSON.stringify(obj));}catch(e){}}
function partOf(v){return Math.floor((v-1)/10)+1;}
function nameOf(p){return partNames[p]||'待公开';}
function get(p){const item=storeRead()['p'+String(p).padStart(2,'0')]||{};return {max:Math.max(0,Math.min(100,Number(item.max)||0)),prologue:!!item.prologue,updated:item.updated||0};}
function set(p,n,prologue){if(p<1||p>99)return;const all=storeRead(),key='p'+String(p).padStart(2,'0');const prev=get(p);all[key]={max:Math.max(prev.max,Math.max(0,Math.min(100,n))),prologue:prev.prologue||!!prologue,updated:Date.now()};storeWrite(all);document.dispatchEvent(new Event('zs:part-progress-changed')); }
function available(entry){return get(entry.p).max>=entry.n;}
function el(tag,cls,content){const node=document.createElement(tag);if(cls)node.className=cls;if(content!==undefined)node.textContent=content;return node;}
function aLink(href,text,cls){const a=el('a',cls,text);a.href=href;return a;}
function css(){if(document.getElementById('zs-unlock-style'))return;
const s=document.createElement('style');s.id='zs-unlock-style';s.textContent=
'.zs-unlock-panel{margin:25px 0;padding:24px;border:1px solid #dac38e75;border-radius:20px;background:linear-gradient(135deg,#32375cbf,#1b213eec);box-shadow:0 14px 42px #0a0d202c}.zs-unlock-panel h2,.zs-unlock-panel h3{margin:4px 0 14px;font-size:22px;letter-spacing:.04em}.zs-unlock-panel p,.zs-unlock-panel small{color:#d5d6e1;line-height:1.8}.zs-progress-meter{height:11px;background:#14182b;border-radius:20px;overflow:hidden;margin:12px 0}.zs-progress-meter>i{display:block;height:100%;background:linear-gradient(90deg,#9776e3,#f0d496);border-radius:20px}.zs-unlock-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}.zs-unlock-actions a,.zs-unlock-actions button,.zs-unlock-button{display:inline-block;border:1px solid #e4c78799;padding:9px 14px;border-radius:10px;background:#2d3156;color:#fae7b6;font:inherit;font-size:13px;cursor:pointer}.zs-unlock-actions a:hover,.zs-unlock-actions button:hover,.zs-unlock-button:hover{background:#42476e}.zs-unlock-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin:18px 0 35px}.zs-unlock-card{padding:18px;border-radius:15px;border:1px solid #e2d2a047;background:#313658aa;min-height:160px}.zs-unlock-card h3{font-size:18px;margin:10px 0}.zs-unlock-card small{font-size:11px;color:#f2d69b}.zs-unlock-card p{font-size:13px;line-height:1.8;color:#d6d5e1}.zs-unlock-card.locked{opacity:.7;border-style:dashed}.zs-chapter-complete{margin:26px 0 8px;padding:18px;border:1px solid #dac38e55;border-radius:14px;background:#30365b}.zs-chapter-complete p{font-size:13px;margin:7px 0;color:#d6d8e6}.zs-part-card{margin:16px 0}.zs-part-card .zs-progress-meter{max-width:500px}.zs-gated-main>:not(.crumb):not(.zs-spoiler-wall):not(.eyebrow):not(h1){display:none!important}.zs-spoiler-wall{display:block;margin:25px 0;padding:25px;border:1px solid #d4c18e88;border-radius:18px;background:#252a4b}.zs-spoiler-wall h2{font-size:25px;margin:2px 0 13px}.zs-spoiler-wall p{line-height:1.9}.zs-spoiler-wall a{color:#f2d7a0;text-decoration:underline}.zs-preview-note{color:#f0cb89;font-size:12px;margin:8px 0}.zs-next-lock{font-size:12px;color:#c9c3d6}.zs-part-locked{color:#c6c5d7}.zs-locked-summary{opacity:.7}.zs-locked-summary summary{cursor:not-allowed}.zs-footer-notice{font-size:12px;color:#ceccdc;margin-top:20px}@media(max-width:650px){.zs-unlock-panel{padding:18px}.zs-unlock-grid{grid-template-columns:1fr}}';
document.head.append(s);}
function summary(p){const state=get(p);const cap=p===3?80:100;return (state.prologue?'序章已读 · ':'')+'已解锁 '+Math.min(state.max,cap)+'/'+cap+' 章';}
function meter(p){const outer=el('div','zs-progress-meter');outer.setAttribute('role','progressbar');outer.setAttribute('aria-valuenow',String(get(p).max));outer.setAttribute('aria-valuemin','0');outer.setAttribute('aria-valuemax',p===3?'80':'100');outer.setAttribute('aria-label','第'+p+'篇已解锁章节');const fill=el('i');fill.style.width=(p===3?Math.min(100,get(p).max*100/80):get(p).max)+'%';outer.append(fill);return outer;}
function articleUnlock(){const m=location.pathname.match(/\/chapters\/volume-(\d{2})\/(chapter-(\d{3})|prologue)\.html$/);if(!m)return;
const vol=Number(m[1]),local=Number(m[3]||0),p=partOf(vol),n=((vol-1)%10)*10+local,pro=!!(m[2]==='prologue');
const article=document.querySelector('.article');if(!article)return;
const card=el('div','zs-chapter-complete'),label=el('strong','', '分篇档案解锁'),status=el('p',''),btn=el('button','zs-unlock-button','✓ 标记本章已读');
card.append(label,status,btn);const archiveLinks=el('div','zs-unlock-actions');archiveLinks.append(aLink(BASE+'archive/equipment.html','查看已解锁武器与装备'),aLink(BASE+'archive/bestiary.html','查看怪物图鉴'));card.append(archiveLinks);const pager=article.querySelector('.pager');if(pager)article.insertBefore(card,pager);else article.append(card);
function update(){const s=get(p);const done=pro?s.prologue:s.max>=n;status.textContent=done?'此章已计入第'+p+'篇进度 · '+summary(p):'读完本章后即可解锁对应的世界档案。';btn.disabled=done;btn.textContent=done?'✓ 已解锁':'✓ 标记本章已读';}
function mark(){set(p,n,pro);update();}
btn.addEventListener('click',mark);update();
let marked=false;const onScroll=()=>{if(marked)return;const rc=article.getBoundingClientRect();if(rc.bottom<=window.innerHeight+45&&rc.bottom>0){marked=true;mark();}};
window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',onScroll,{passive:true});
}
function partCard(p){const box=el('div','zs-unlock-panel zs-part-card');
const title=el('h2','', '第'+p+'篇 · '+nameOf(p));box.append(title,el('p','',summary(p)),meter(p));
const actions=el('div','zs-unlock-actions');
actions.append(aLink(BASE+'archive/unlocks.html?part='+p,'查看本篇已解锁档案'));
if(p===1)actions.append(aLink(BASE+'chapters/volume-01/prologue.html','从序章开始'));if(p===2)actions.append(aLink(BASE+'chapters/volume-11/chapter-001.html','从第101章开始'));if(p===3)actions.append(aLink(BASE+'chapters/volume-21/chapter-001.html','从第201章开始'));
actions.append(aLink(BASE+'parts/final-archive.html','查看总档案'));box.append(actions);return box;}
function homepage(){if(!document.body.classList.contains('home-page'))return;
if(document.getElementById('zs-home-resume'))return; // 首页V2已有独立阅读进度区域，避免重复卡片。
const container=document.getElementById('volumes');if(!container)return;
const sec=el('section','');sec.id='zs-progress-home';sec.append(el('p','eyebrow','UNLOCK PROGRESS · 独立进度'),el('h2','','篇章解锁进度'));
sec.append(el('p','lead','第一篇与后续每一篇独立记录进度；总档案只汇总已经读到的剧情。'));
const grid=el('div','zs-unlock-grid');
[1,2,3].forEach(p=>{const card=el('div','zs-unlock-card');card.append(el('small','',p===1?'PART 01 · 已发布':p===2?'PART 02 · 全100章正式完成':'PART 03 · 第21—28卷已发布'),el('h3','','第'+p+'篇 · '+nameOf(p)),el('p','',summary(p)));card.append(meter(p));card.append(aLink(BASE+'parts/part-0'+p+'.html','阅读本篇 →'),aLink(BASE+'archive/unlocks.html?part='+p,'查看解锁状态 →'));grid.append(card);});
const total=el('div','zs-unlock-card');total.append(el('small','','ALL PARTS'),el('h3','','最终篇 · 全部总结'),el('p','','只整合目前已经解锁的信息；未公开的真相仍然封存。'),aLink(BASE+'parts/final-archive.html','打开总档案 →'));grid.append(total);sec.append(grid);container.insertAdjacentElement('afterend',sec);
}
function partPage(){if(!/\/parts\/part-0\d\.html$/.test(location.pathname))return;const p=Number((location.pathname.match(/part-(\d+)\.html/)||[])[1]||1);const hero=document.querySelector('.part-hero, .part2-hero');if(hero)hero.insertAdjacentElement('afterend',partCard(p));
if(p!==1&&p!==2&&p!==3)return;
// 只同步卡片状态，不篡改原始卷名和简介；避免读者解锁后文字无法恢复。
function updateCovers(){document.querySelectorAll('a[href*="/volumes/volume-"]').forEach(link=>{const found=link.getAttribute('href')?.match(/volume-(\d+)\.html/);if(!found)return;const vol=Number(found[1]);const need=(vol-(p===1?1:p===2?11:21))*10;link.classList.toggle('zs-cover-unlocked',need<=get(p).max);});}
updateCovers();document.addEventListener('zs:part-progress-changed',updateCovers);
const lead=hero&&hero.querySelector('.lead');if(p===1&&lead&&get(1).max<90)lead.textContent='从重生的起点出发。随着阅读推进，第一篇的地图、人物、势力与谜团将逐步揭晓。';
}
function recapGate(){const m=location.pathname.match(/\/parts\/recap-0([12])\.html$/);if(!m)return;const p=Number(m[1]);
document.querySelectorAll('.r-list details').forEach((node,i)=>{const need=(i+1)*10;if(get(p).max>=need)return;node.replaceChildren(el('summary','','第'+(i+1+(p-1)*10)+'卷 · 🔒 读完本卷后解锁'));node.classList.add('zs-locked-summary');node.addEventListener('toggle',()=>{if(node.open)node.open=false;});});
const intro=document.querySelector('main>.lead');if(intro)intro.textContent='每卷回顾按阅读进度开放，未读卷的剧情继续封存。';document.body.classList.add('zs-recap-ready');
}
function archiveGate(){if(document.querySelector('[data-public-archive]'))return;if(!/\/archive\//.test(location.pathname)||/\/archive\/(?:unlocks|quests|bestiary|equipment|characters|classes)\.html$/.test(location.pathname)||/\/archive\/characters\//.test(location.pathname))return;
const main=document.querySelector('main');if(!main)return;
if(get(1).max>=100&&get(2).max>=100){document.body.classList.add('zs-archive-approved');return;}
main.classList.add('zs-gated-main');const wall=el('div','zs-spoiler-wall');
wall.append(el('h2','','🔒 完整设定档案暂未解锁'),el('p','','此页可能包含第一篇后续章节的信息。为了避免剧透，先展示与你已读章节对应的渐进档案。为了防止第二篇和后期资料提前泄露，需完成第一篇与第二篇各100章，才开放原有的完整专题资料。'));
const actions=el('div','zs-unlock-actions');actions.append(aLink(BASE+'archive/unlocks.html','查看已解锁档案 →'),aLink(BASE+'parts/part-01.html','返回第一篇目录 →'),aLink(BASE+'archive/quests.html','查看已解锁剧情事件 →'));wall.append(actions);main.append(wall);
}
function catalogPage(){if(!/\/archive\/unlocks\.html$/.test(location.pathname))return;const host=document.getElementById('zs-dynamic-catalog');if(!host)return;const params=new URLSearchParams(location.search),sel=Number(params.get('part'))||1;
function render(){host.replaceChildren();const top=el('div','zs-unlock-panel');
top.append(el('h2','','分篇独立解锁'),el('p','','当前查看：第'+sel+'篇 · '+nameOf(sel)+' · '+summary(sel)),meter(sel));
const actions=el('div','zs-unlock-actions');[1,2,3].forEach(p=>actions.append(aLink('?part='+p,'第'+p+'篇')));actions.append(aLink(BASE+'parts/final-archive.html','全部总结'));top.append(actions);host.append(top);
if(sel>3){host.append(el('p','zs-next-lock','该篇尚未发布正式章节。'));return;}
const cats=['人物','职业','地图','势力','世界','事件'];cats.forEach(cat=>{const data=entries.filter(x=>x.p===sel&&x.k===cat);if(!data.length)return;host.append(el('h2','',cat+'档案'));const grid=el('div','zs-unlock-grid');data.forEach(item=>{const ok=available(item),cell=el('article','zs-unlock-card'+(ok?'':' locked'));cell.append(el('small','',ok?'✓ 已解锁 · 第'+item.n+'章':'🔒 第'+item.n+'章后解锁'),el('h3','',ok?item.t:'尚未揭晓'),el('p','',ok?item.d:'继续阅读本篇，达到对应章节后自动显示。'));grid.append(cell);});host.append(grid);});host.append(el('p','zs-footer-notice','本页只显示经过公开核对的阶段资料；未来剧情、人物终局和作者私密笔记不会预先上传。'));}
render();document.addEventListener('zs:part-progress-changed',render);
}
function finalPage(){if(!/\/parts\/final-archive\.html$/.test(location.pathname))return;const host=document.getElementById('zs-final-container');if(!host)return;
function render(){host.replaceChildren();const intro=el('div','zs-unlock-panel');intro.append(el('h2','','全篇进度总览'),el('p','','每篇分别计算，以下只汇总你目前已经解锁的内容。'));
[1,2,3].forEach(p=>{const line=el('div','zs-part-card');line.append(el('h3','','第'+p+'篇 · '+nameOf(p)),el('p','',summary(p)),meter(p));intro.append(line);});host.append(intro);
const shown=entries.filter(available);
host.append(el('h2','','已解锁总档案 · '+shown.length+'条'));
if(!shown.length)host.append(el('p','lead','尚未解锁正文档案。阅读第一篇序章与第一章后，故事资料会陆续汇集到这里。'));
['人物','职业','地图','势力','世界','事件'].forEach(cat=>{const data=shown.filter(e=>e.k===cat);if(!data.length)return;host.append(el('h2','',cat));const grid=el('div','zs-unlock-grid');data.forEach(item=>{const card=el('article','zs-unlock-card');card.append(el('small','','第'+item.p+'篇 · 第'+item.n+'章'),el('h3','',item.t),el('p','',item.d));grid.append(card);});host.append(grid);});
host.append(el('p','zs-footer-notice','这里是当前阅读进度的阶段总结，并非全书已完结。最终真相只会在相应正文公开后进入档案。'));const acts=el('div','zs-unlock-actions');acts.append(aLink(BASE+'archive/unlocks.html','进入分篇档案'),aLink(BASE+'parts/part-01.html','返回第一篇'));host.append(acts);}
render();document.addEventListener('zs:part-progress-changed',render);
}
function init(){css();articleUnlock();homepage();partPage();recapGate();archiveGate();catalogPage();finalPage();
if(!document.querySelector('script[src*="site-ui.js"]')){const shell=document.createElement('script');shell.src=BASE+'assets/js/site-ui.js?v=2';document.body.appendChild(shell);}
}
window.ZSUnlock={get,set,entries,partOf};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
