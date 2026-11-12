(()=>{'use strict';
const ROOT='/zero-sequence-public/';
const records=[
[1,1,'起点','重返与未来偏离','主要人物重新面对熟悉却可能变化的未来。','顾长渊:characters/gu-changyuan.html','职业:classes.html'],
[1,6,'探索','晨星镇初期探索','早期地图与原住民构成旅程起点。','世界地图:world.html','人物图鉴:characters.html'],
[1,21,'城市','维兰德城的合作与生活','城市、医疗、商业与工作室逐渐建立联系。','势力:factions.html','地图:world.html'],
[1,31,'探索','北线旧路与路碑','探索者重新核对地图与旧道路。','地图:world.html','势力:factions.html'],
[1,41,'协作','灰石山路与共同守护','运输、守卫和工匠共同维护安全。','地图:world.html','工坊:production.html'],
[1,51,'商路','失落商道的选择','商队与旅行者的行动让世界更加广阔。','城市贸易:city-economy.html','产业:industry.html'],
[1,61,'防线','白霜边境','寒潮与边境防线带来新的生存挑战。','戴玄岳:characters/dai-xuanyue.html','地图:world.html'],
[1,81,'试炼','黑风试炼','冒险逐渐显露行动代价。','职业:classes.html','剧情解锁:unlocks.html'],
[1,91,'遗迹','无名之门','遗迹与旧城线索进入新的阶段。','地图:world.html','人物:characters.html'],
[2,1,'合作','独立玩家的选择','不同玩家与原住民拥有各自的价值判断。','人物:characters.html','势力:factions.html'],
[2,11,'商路','西境商路与职业玩家','商路竞争与职业玩家的行动逐渐进入视野。','经济:city-economy.html','势力:factions.html'],
[2,31,'救援','联合医疗与救援研究','医疗需要证据、资源与团队协作。','苏紫璃:characters/su-zili.html','职业:classes.html'],
[2,51,'防线','北境共同防线','伙伴分别承担防守与行动责任。','林烈:characters/lin-lie.html','戴玄岳:characters/dai-xuanyue.html'],
[2,71,'现实','现实应急基地建设','后勤、物资储备与管理成为重要环节。','工坊订单模板:orders.html','产业:industry.html'],
[2,81,'情报','被改写的情报','可疑信息需要交叉核验与独立判断。','罗烬:characters/luo-jin.html','势力:factions.html'],
[2,91,'救援','跨城联合行动','不同队伍在高风险事件中协作。','势力:factions.html','职业:classes.html'],
[3,6,"探索","回声坡灰刺兽护卫","碎石坡外勤战斗要求保护测绘员、损坏设备和撤离路线。","魔物:bestiary.html","人物:characters.html"],
[3,21,"探索","栖潮旧城的迁居记录","旧城籍、旧地名与合法访问记录交错出现。","地图:world.html","人物:characters.html"],
[3,31,"遗迹","外缘旧门的实地测绘","已批准的观察区与施工现场决定探索能到哪里。","地图:world.html","势力:factions.html"],
[3,43,"防线","灰鲸号与裂鳍兽袭击","未知水域中护航船员，不能让追怪影响航行安全。","魔物:bestiary.html","装备:equipment.html"],
[3,51,"探索","外环校准器取回","测绘队在合法工程区修复旧路线与仪器记录。","道具:items.html","地图:world.html"],
[3,57,"试炼","裂脊岩侯之战","外环矿洞精英首领攻击工人路线，盾卫与剑士分工撤离。","魔物:bestiary.html","职业:classes.html"],
[3,61,"合作","灰烬熔谷公开探索赛","不同队伍为锻造材料、公开贡献与工匠安全展开竞争。","材料:materials.html","势力:factions.html"],
[3,67,"试炼","熔背龙蜥的炉台威胁","高危首领的攻击可能损坏公共冷却系统，各队被迫合作。","魔物:bestiary.html","材料:materials.html"],
[3,71,"现实","冷链订单与镜霜驿道","现实温控订单和万界公共护运分别考验后勤与记录。","道具:items.html","装备:equipment.html"],
[3,75,"救援","冻湖潜霜兽救援","玩家落入冰井，专业救援先行，护卫防守唯一的撤离通道。","魔物:bestiary.html","人物:characters.html"],
[3,81,"遗迹","无钟站旧观测线索","祁望失踪与秦栖的记录引出北境旧刻盘。","道具:items.html","人物:characters.html"],
[3,87,"防线","无钟守卫与镜海","团队一面牵制失控构装守卫，一面寻找停机方法。","魔物:bestiary.html","职业:classes.html"],
[3,91,"探索","零刻回廊提前开放","新地图与前世记忆产生偏移，各方重新核对公开通行资格。","地图:world.html","人物:characters.html"],
[3,94,"救援","无声门廊工匠搜救","回纹哨鸦与回纹猎犬带来新风险，测绘和防线保护失联工匠。","魔物:bestiary.html","道具:items.html"]
,
 [4,1,"护运","北坡雪线争路","公会围绕补给路线竞争，真实驿工的通行与安全不能被当作战利品。","装备:equipment.html","人物:characters.html"],
 [4,11,"竞技","东湾猎榜争夺","抢怪、练级与公开成绩决定挑战资格，玩家组织各有实力与代价。","职业:classes.html","魔物:bestiary.html"],
 [4,21,"商路","南驿货运争夺","运输、仓储与合同风险制约工作室扩张，铁隼联队是独立竞争者。","道具:items.html","势力:factions.html"],
 [4,31,"公会战","跨区双城旗火","东湾、赤沙与苍岭不同地形考验临时合作与跨区攻守。","地图:world.html","装备:equipment.html"],
 [4,41,"公会战","百旗城战","东门补给交付和中央旗台分别结算，主角团并未拥有整座城。","武器:equipment.html","材料:materials.html"],
 [4,51,"竞技","赤谷资格争夺","战术误判与限期参赛资格带来损失，独立队伍仍能有限协作。","人物:characters.html","势力:factions.html"],
 [4,61,"公会战","断岚裂旗之城","重剑与塔盾在街巷激战，真实伤势与维修限制不能忽视。","武器:equipment.html","职业:classes.html"],
 [4,71,"经营","灰炬边境营地经营","二十三号营地的竞价、设备维护和货运认证须同时满足条件。","道具:items.html","材料:materials.html"],
 [4,81,"试炼","北烽谷岩兽与鸣炉挑战","公会抢怪、石像机关试炼和短期矿砂取样独立计分。","魔物:bestiary.html","材料:materials.html"],
 [4,91,"公会战","烽关跨城会战","各方以不同赛制争分，团队争取有限资格而非永久占领。","人物:characters.html","势力:factions.html"],
 [4,96,"协作","七人逆阵 · 双线职责","竞技旗点与民用护路分线执行，古言澈、岑禾、陈迢等各有独立判断。","人物:characters.html","道具:items.html"],
 [4,100,"经营","烽火未熄 · 候选审核","第四篇收官后仍要核验候选资质、人员健康与后勤费用。","装备:equipment.html","人物:characters.html"]
];
const progress=p=>{try{if(window.ZSUnlock?.get)return window.ZSUnlock.get(p).max;const x=JSON.parse(localStorage.getItem('zs:part-progress:v1')||'{}');return Math.max(0,Math.min(100,Number(x['p'+String(p).padStart(2,'0')]?.max)||0));}catch{return 0;}};
const el=(tag,cls,content)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(content!==undefined)x.textContent=content;return x};
const link=(path,title)=>{const a=el('a','',title);a.href=ROOT+path;return a;};
const chapter=(p,n)=>{const vol=(p-1)*10+Math.ceil(n/10),local=(n-1)%10+1;return 'chapters/volume-'+String(vol).padStart(2,'0')+'/chapter-'+String(local).padStart(3,'0')+'.html';};
function start(){const host=document.getElementById('zq-results');if(!host)return;
 const search=document.getElementById('zq-search'),part=document.getElementById('zq-part'),cat=document.getElementById('zq-category'),status=document.getElementById('zq-status'),locked=document.getElementById('zq-locked');
 function render(){const one=progress(1),two=progress(2),three=progress(3),four=progress(4),query=search.value.trim().toLowerCase(),p=Number(part.value||0),category=cat.value;let count=0;host.replaceChildren();
 for(const [arc,n,k,name,description,...refs] of records){
  if((arc===1?one:arc===2?two:arc===3?three:four)<n||(p&&arc!==p)||(category&&category!==k))continue;
  if(query&&![name,description,k,...refs].join(' ').toLowerCase().includes(query))continue;
  const card=el('article','zq-card');card.append(el('small','',('第'+arc+'篇 · 第'+n+'章后 · '+k)),el('h2','',name),el('p','',description));
  const links=el('div','zq-links');links.append(link(chapter(arc,n),'阅读相关章节 →'));
  refs.forEach(ref=>{const cut=ref.indexOf(':');links.append(link('archive/'+ref.slice(cut+1),ref.slice(0,cut)));});
  card.append(links);host.append(card);count++;
 }
 if(!count)host.append(el('p','zq-empty','没有符合筛选条件的已解锁剧情线索。'));
 const hidden=records.filter(x=>(x[0]===1?one:x[0]===2?two:x[0]===3?three:four)<x[1]).length;
 status.textContent='第一篇 '+one+'/100 · 第二篇 '+two+'/100 · 第三篇 '+three+'/100 · 第四篇 '+four+'/100 · 已显示 '+count+' 条';
 locked.textContent='另有 '+hidden+' 条未解锁记录；名称与关联资料暂不展示。';
 }
 [search,part,cat].forEach(x=>x.addEventListener(x===search?'input':'change',render));document.addEventListener('zs:part-progress-changed',render);window.addEventListener('pageshow',render);render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();