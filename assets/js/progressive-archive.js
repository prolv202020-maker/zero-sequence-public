/* 第零序列 · 分篇独立解锁（无后端，进度仅存此浏览器） */
(function(){
'use strict';
const BASE='/zero-sequence-public/';
const KEY='zs:part-progress:v1';
const partNames={1:'轮回启幕',2:'百城星火',3:'临界回声',4:'烽火临界'};
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
 {p:3,n:81,k:'地图',t:'无钟站',d:'顾长渊受邀前往北境无钟站，接触祁望失踪案的旧观测线索。'},
 {p:3,n:82,k:'人物',t:'秦栖',d:'北境观测员秦栖讲述祁望失踪前后留下的记录与设备。'},
 {p:3,n:83,k:'势力',t:'白砾猎团',d:'段凛的队伍寻找旧刻盘，一项高价委托引来新的危险。'},
 {p:3,n:84,k:'职业',t:'断雪剑线',d:'顾长渊在切磋中改变折步三连的终点，剑士技艺继续成长。'},
 {p:3,n:85,k:'事件',t:'被偷走的一息',d:'北井出现模仿声音和移动的残像，其机制尚待进一步查证。'},
 {p:3,n:86,k:'人物',t:'沉弦',d:'神秘委托者在镜海现身，利用旧式共振装置安排伏击。'},
 {p:3,n:87,k:'怪物',t:'无钟守卫',d:'古代构装体失控，团队协作寻找停止核心的办法。'},
 {p:3,n:88,k:'地点',t:'第零道刻痕',d:'旧机关留下一处紧急止动刻痕，祁望的刻盘被用于测试。'},
 {p:3,n:89,k:'事件',t:'一剑破回声',d:'第零刻痕成功触发，顾长渊经历代价沉重的绝境之战。'},
 {p:3,n:90,k:'事件',t:'无钟的黎明',d:'北井暂时停机，新地图公告令前世记忆的可靠性受到挑战。'},
 {p:3,n:91,k:'事件',t:'偏移的日期',d:'公开新地图开放日期与顾长渊记忆中的北境事件出现偏差。'},
 {p:3,n:92,k:'势力',t:'程寻的测绘队',d:'独立绘图员重视实测安全路线，与长渊工作室协同校验。'},
 {p:3,n:93,k:'地图',t:'无声门廊',d:'回廊石壁吸收与反射声音，旧标识和防护兽带来探索风险。'},
 {p:3,n:94,k:'怪物',t:'回纹猎犬',d:'会依据已记录的行动轨迹逼迫玩家走向危险路线的防护兽。'},
 {p:3,n:95,k:'地点',t:'第七座路碑',d:'缺失的零位石柱与旧传力水道成为公开测绘关注点。'},
 {p:3,n:96,k:'事件',t:'沉弦的价码',d:'沉弦要求交换战斗资料，工作室拒绝把危险情报变成交易条件。'},
 {p:3,n:97,k:'职业',t:'双盾交错',d:'林烈与神锋盾卫配合守住断桥与撤离通道。'},
 {p:3,n:98,k:'事件',t:'错误的钟点',d:'独立记录出现尚待解释的提前脉冲，调查组继续寻找可靠声源。'},
 {p:3,n:99,k:'怪物',t:'零刻引路者',d:'错误校验触发回廊高危防护体，众人依靠剑术和团队配合完成止动。'},
 {p:3,n:100,k:'事件',t:'临界之前',d:'零刻回廊外围校验结束，第三篇阶段完成，未来偏移仍在继续。'},
 {p:2,n:99,k:'势力',t:'深渊方舟第一阶段',d:'初步现实应急据点运转'},
 {p:4,n:1,k:'地图',t:'北坡合法护运路线',d:'公开补给路线引发玩家收费与通行争执；深层核心仍未开放。'},
 {p:4,n:2,k:'人物',t:'驿工陆荻',d:'北坡救援中获救的驿工，伤势与后续工作恢复仍需照顾。'},
 {p:4,n:3,k:'事件',t:'药材车伏击',d:'野外玩家冲突与断章取义的视频让护运队面临双重风险。'},
 {p:4,n:4,k:'势力',t:'自愿护运协作',d:'独立队伍可以暂时结盟守路，无须加入长渊工作室。'},
 {p:4,n:5,k:'事件',t:'黑槲主力报名',d:'敌方具有完整资金与战阵部署，主角团必须控制真实后勤成本。'},
 {p:4,n:6,k:'职业',t:'重剑回锋',d:'林烈在正规争夺中恢复重剑主战，同时吸收此前盾防训练的战场判断。'},
 {p:4,n:7,k:'事件',t:'冻河交付失利',d:'北坡护运遇到真实损失，反击不能以战斗胜利掩盖货物损毁。'},
 {p:4,n:8,k:'事件',t:'雪线会战',d:'多支独立队伍用明确职责与任务目标应对完整公会战阵。'},
 {p:4,n:9,k:'事件',t:'最后交付成功',d:'合法补给经正式核验过线，收益与胜负仍依公开规则结算。'},
 {p:4,n:10,k:'事件',t:'路仍向前',d:'第31卷公开护运争夺阶段收束，相关伤亡责任与后续道路仍需继续面对。'},
 {p:4,n:11,k:'事件',t:'东湾猎榜竞速',d:'第32卷开始，东湾试炼场的等级榜与猎场材料争夺升级。'}, {p:4,n:12,k:'事件',t:'断旗试阵',d:'正式对战训练检验护送与夺旗协作，重剑进攻需要与队伍站位衔接。'},
 {p:4,n:13,k:'地图',t:'折光矿谷',d:'夜间猎场的有效材料争夺与蒙面袭击考验合法交付。'},
 {p:4,n:14,k:'地图',t:'无主猎区',d:'猎场驻守席位依公开积分结算，而非永久占有公共道路。'},
 {p:4,n:15,k:'事件',t:'分旗之夜',d:'临时阵营与正式旗分不同，断章取义的视频无法替代现场战报。'},
 {p:4,n:16,k:'人物',t:'邵临川',d:'燎星战团枪阵指挥，正面竞技给长渊队伍带来清晰的战术压力。'},
 {p:4,n:17,k:'事件',t:'赤线伏杀',d:'车队遭袭导致实际财物损毁和人员受伤，责任仍须按证据调查。'},
 {p:4,n:18,k:'势力',t:'临时旗阵协作',d:'长渊与灰獠在运输安全目标上暂时合作，仍独立结算旗分。'},
 {p:4,n:19,k:'势力',t:'逐昼挑战队',d:'榜首竞速队的高效率战术与公开交付成绩，在竞技场得到实际检验。'},
 {p:4,n:20,k:'事件',t:'回响环道终场',d:'长渊队伍赢得有期限的合法补给优先申请资格，第32卷争夺阶段收束。'},
 {p:4,n:21,k:'事件',t:'南驿货运争夺',d:'长渊在合法补给资格之外遭遇铁隼运力竞争，首批货单失利。'},
 {p:4,n:22,k:'势力',t:'铁隼联队',d:'陆峥率领的商路联运势力拥有车辆与承保优势，合作条款涉及独立指挥权。'},
 {p:4,n:23,k:'地图',t:'风桥前哨',d:'秦苍利用高台射线和双旗赛制，使长渊队伍丢失完整前哨资格。'},
 {p:4,n:24,k:'事件',t:'驿门争胜',d:'长渊与神锋梁策依正式赛制对决，赢得短期轻车租用资格。'},
 {p:4,n:25,k:'事件',t:'重剑夺塔',d:'林烈独立指挥夺塔成功，但东侧材料补给线同时失守。'},
 {p:4,n:26,k:'事件',t:'联运围城',d:'铁隼依靠多公会合作掌握主干线，长渊局部失守并进行止损。'},
 {p:4,n:27,k:'事件',t:'断粮之局',d:'运输改签导致仓储压力，队伍明确医疗与经营最低保障。'},
 {p:4,n:28,k:'势力',t:'小型联合护运',d:'长渊、灰獠与独立车队建立可执行的责任与分成合作。'},
 {p:4,n:29,k:'事件',t:'烽线决战',d:'逐昼、铁隼与长渊在公开联运会战中分别取得有效赛果。'},
 {p:4,n:30,k:'事件',t:'有限联运配额',d:'长渊取得一定期限的合法外圈联运份额，公共道路未被任何一方独占。'},
 {p:4,n:31,k:'事件',t:'跨区战盟试炼',d:'东湾、赤沙与苍岭开放跨区公会资格战，报名需真实公开成绩。'},
 {p:4,n:32,k:'事件',t:'白石旗门争位',d:'长渊在资格赛中通过旗台轮换和队伍协作赢得候选名额。'},
 {p:4,n:33,k:'地图',t:'黄盐驿',d:'赤沙陌生砂地与沙暴降低原有战术效率，护运队只能取得基础分。'},
 {p:4,n:34,k:'势力',t:'荒烬公会',d:'闻秋棠统筹的大型护运公会与长渊采用有限互援合同。'},
 {p:4,n:35,k:'事件',t:'双城奔袭',d:'赤沙与苍岭两路同时交付，合作队伍必须独立判断路线。'},
 {p:4,n:36,k:'地图',t:'旧修理站',d:'长渊在夜间据点战赢得限时工坊使用顺位，付出真实消耗。'},
 {p:4,n:37,k:'事件',t:'苍岭东墙失守',d:'狼庭与苍牙协调攻城，长渊失去据点并保住伤员撤退。'},
 {p:4,n:38,k:'事件',t:'东关重剑反击',d:'林烈调整重剑与盾阵换位，带队重新取得公开晋级成绩。'},
 {p:4,n:39,k:'事件',t:'千旗跨区决战',d:'逐昼、铁隼、狼庭和长渊在不同项目取得真实成绩。'},
 {p:4,n:40,k:'势力',t:'跨区支线承运',d:'长渊取得期限与责任明确的跨区支线申请资格，后续赛事仍待公开。'},
 {p:4,n:41,k:'事件',t:'百旗城战报名',d:'燧河城按正式规则开放百旗竞赛，队伍负责不同街区。'},
 {p:4,n:42,k:'事件',t:'东门夺旗',d:'长渊抵挡狼庭枪阵和乌鸦庭骚扰，取得有限东门旗台成绩。'},
 {p:4,n:43,k:'势力',t:'乌鸦庭雇佣团',d:'黑羽雇佣团承接合法PK和旗令阻击任务，以延误目标获得报酬。'},
 {p:4,n:44,k:'事件',t:'夜袭粮仓',d:'长渊守住交付任务并协助危旧木梁事故救援，安全责任仍待裁定。'},
 {p:4,n:45,k:'事件',t:'重剑守街',d:'林烈与戴玄岳协调盾剑阵形，守住第二号主街旗道。'},
 {p:4,n:46,k:'事件',t:'黑榜猎杀',d:'乌鸦庭连续分线袭扰，导致长渊后勤认证超时，成绩失效。'},
 {p:4,n:47,k:'事件',t:'城门崩线',d:'东门第二旗失守，工作室承担真实积分与资源损失。'},
 {p:4,n:48,k:'事件',t:'逆火盟旗',d:'长渊按有限职责重整旗令交付路线，取得最后的决赛资格。'},
 {p:4,n:49,k:'事件',t:'百旗决战',d:'各公会按自身优势争得项目成绩，长渊完成东门支线和中央入口防卫。'},
 {p:4,n:50,k:'事件',t:'城火长明',d:'长渊获得有限训练资源申请权，不曾永久占有燧河城。'},
 {p:4,n:51,k:'事件',t:'榜前夺席',d:'赤谷公开资格预选开启，长渊先处理合法护送与报名争议。'},
 {p:4,n:52,k:'事件',t:'窄谷抢旗',d:'队伍在第二巡旗取得基础挑战积分，主要占旗权仍由其他队伍争夺。'},
 {p:4,n:53,k:'事件',t:'灰印委托',d:'多份运输合同引发桥梁安全与交付责任争议，事故证据进入正式程序。'},
 {p:4,n:54,k:'地图',t:'夜赛断桥',d:'赤谷旧矿桥在夜间赛段发生结构事故，工坊和参赛者分别承担后果。'},
 {p:4,n:55,k:'势力',t:'仇敌同路',d:'长渊与狼庭依赛制临时联队，合作不等于永久结盟。'},
 {p:4,n:56,k:'事件',t:'算错的代价',d:'过时的地形判断造成排名失利，长渊接受伙伴复核战术。'},
 {p:4,n:57,k:'事件',t:'夜色围猎',d:'有人威胁原住民商队，证据提交后仍待正式调查。'},
 {p:4,n:58,k:'事件',t:'赤榜突围',d:'长渊以运输认证和团队配合重返资格竞争区间。'},
 {p:4,n:59,k:'事件',t:'双线反攻',d:'竞技与安全运输同时进行，队伍取得关键有效积分。'},
 {p:4,n:60,k:'事件',t:'旗未归城',d:'赤谷阶段成绩达到下一阶段申请门槛，仍需审核并承担后勤成本。'},
];
function storeRead(){try{const x=JSON.parse(localStorage.getItem(KEY)||'{}');return x&&typeof x==='object'?x:{};}catch(e){return {};}}
function storeWrite(obj){try{localStorage.setItem(KEY,JSON.stringify(obj));}catch(e){}}
function partOf(v){return Math.floor((v-1)/10)+1;}
function nameOf(p){return partNames[p]||'待公开';}
function get(p){const item=storeRead()['p'+String(p).padStart(2,'0')]||{};return {max:Math.max(0,Math.min(p===4?70:100,Number(item.max)||0)),prologue:!!item.prologue,updated:item.updated||0};}
function set(p,n,prologue){if(p<1||p>99)return;const all=storeRead(),key='p'+String(p).padStart(2,'0');const prev=get(p);all[key]={max:Math.max(prev.max,Math.max(0,Math.min(p===4?70:100,n))),prologue:prev.prologue||!!prologue,updated:Date.now()};storeWrite(all);document.dispatchEvent(new Event('zs:part-progress-changed')); }
function available(entry){return get(entry.p).max>=entry.n;}
function el(tag,cls,content){const node=document.createElement(tag);if(cls)node.className=cls;if(content!==undefined)node.textContent=content;return node;}
function aLink(href,text,cls){const a=el('a',cls,text);a.href=href;return a;}
function css(){if(document.getElementById('zs-unlock-style'))return;
const s=document.createElement('style');s.id='zs-unlock-style';s.textContent=
'.zs-unlock-panel{margin:25px 0;padding:24px;border:1px solid #dac38e75;border-radius:20px;background:linear-gradient(135deg,#32375cbf,#1b213eec);box-shadow:0 14px 42px #0a0d202c}.zs-unlock-panel h2,.zs-unlock-panel h3{margin:4px 0 14px;font-size:22px;letter-spacing:.04em}.zs-unlock-panel p,.zs-unlock-panel small{color:#d5d6e1;line-height:1.8}.zs-progress-meter{height:11px;background:#14182b;border-radius:20px;overflow:hidden;margin:12px 0}.zs-progress-meter>i{display:block;height:100%;background:linear-gradient(90deg,#9776e3,#f0d496);border-radius:20px}.zs-unlock-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}.zs-unlock-actions a,.zs-unlock-actions button,.zs-unlock-button{display:inline-block;border:1px solid #e4c78799;padding:9px 14px;border-radius:10px;background:#2d3156;color:#fae7b6;font:inherit;font-size:13px;cursor:pointer}.zs-unlock-actions a:hover,.zs-unlock-actions button:hover,.zs-unlock-button:hover{background:#42476e}.zs-unlock-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin:18px 0 35px}.zs-unlock-card{padding:18px;border-radius:15px;border:1px solid #e2d2a047;background:#313658aa;min-height:160px}.zs-unlock-card h3{font-size:18px;margin:10px 0}.zs-unlock-card small{font-size:11px;color:#f2d69b}.zs-unlock-card p{font-size:13px;line-height:1.8;color:#d6d5e1}.zs-unlock-card.locked{opacity:.7;border-style:dashed}.zs-chapter-complete{margin:26px 0 8px;padding:18px;border:1px solid #dac38e55;border-radius:14px;background:#30365b}.zs-chapter-complete p{font-size:13px;margin:7px 0;color:#d6d8e6}.zs-part-card{margin:16px 0}.zs-part-card .zs-progress-meter{max-width:500px}.zs-gated-main>:not(.crumb):not(.zs-spoiler-wall):not(.eyebrow):not(h1){display:none!important}.zs-spoiler-wall{display:block;margin:25px 0;padding:25px;border:1px solid #d4c18e88;border-radius:18px;background:#252a4b}.zs-spoiler-wall h2{font-size:25px;margin:2px 0 13px}.zs-spoiler-wall p{line-height:1.9}.zs-spoiler-wall a{color:#f2d7a0;text-decoration:underline}.zs-preview-note{color:#f0cb89;font-size:12px;margin:8px 0}.zs-next-lock{font-size:12px;color:#c9c3d6}.zs-part-locked{color:#c6c5d7}.zs-locked-summary{opacity:.7}.zs-locked-summary summary{cursor:not-allowed}.zs-footer-notice{font-size:12px;color:#ceccdc;margin-top:20px}@media(max-width:650px){.zs-unlock-panel{padding:18px}.zs-unlock-grid{grid-template-columns:1fr}}';
document.head.append(s);}
function summary(p){const state=get(p);const cap=p===4?70:100;return (state.prologue?'序章已读 · ':'')+'已解锁 '+Math.min(state.max,cap)+'/'+cap+' 章';}
function meter(p){const outer=el('div','zs-progress-meter');outer.setAttribute('role','progressbar');outer.setAttribute('aria-valuenow',String(get(p).max));outer.setAttribute('aria-valuemin','0');outer.setAttribute('aria-valuemax',p===4?'70':'100');outer.setAttribute('aria-label','第'+p+'篇已解锁章节');const fill=el('i');fill.style.width=(p===4?Math.min(100,Math.round(get(p).max/70*100)):get(p).max)+'%';outer.append(fill);return outer;}
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
if(p===1)actions.append(aLink(BASE+'chapters/volume-01/prologue.html','从序章开始'));if(p===2)actions.append(aLink(BASE+'chapters/volume-11/chapter-001.html','从第101章开始'));if(p===3)actions.append(aLink(BASE+'chapters/volume-21/chapter-001.html','从第201章开始'));if(p===4)actions.append(aLink(BASE+'chapters/volume-31/chapter-001.html','从第301章开始'));
actions.append(aLink(BASE+'parts/final-archive.html','查看总档案'));box.append(actions);return box;}
function homepage(){if(!document.body.classList.contains('home-page'))return;
if(document.getElementById('zs-home-resume'))return; // 首页V2已有独立阅读进度区域，避免重复卡片。
const container=document.getElementById('volumes');if(!container)return;
const sec=el('section','');sec.id='zs-progress-home';sec.append(el('p','eyebrow','UNLOCK PROGRESS · 独立进度'),el('h2','','篇章解锁进度'));
sec.append(el('p','lead','第一篇与后续每一篇独立记录进度；总档案只汇总已经读到的剧情。'));
const grid=el('div','zs-unlock-grid');
[1,2,3,4].forEach(p=>{const card=el('div','zs-unlock-card');card.append(el('small','',p===1?'PART 01 · 已发布':p===2?'PART 02 · 全100章正式完成':p===3?'PART 03 · 全100章正式完成':'PART 04 · 第31—37卷完整发布'),el('h3','','第'+p+'篇 · '+nameOf(p)),el('p','',summary(p)));card.append(meter(p));card.append(aLink(BASE+'parts/part-0'+p+'.html','阅读本篇 →'),aLink(BASE+'archive/unlocks.html?part='+p,'查看解锁状态 →'));grid.append(card);});
const total=el('div','zs-unlock-card');total.append(el('small','','ALL PARTS'),el('h3','','最终篇 · 全部总结'),el('p','','只整合目前已经解锁的信息；未公开的真相仍然封存。'),aLink(BASE+'parts/final-archive.html','打开总档案 →'));grid.append(total);sec.append(grid);container.insertAdjacentElement('afterend',sec);
}
function partPage(){if(!/\/parts\/part-0\d\.html$/.test(location.pathname))return;const p=Number((location.pathname.match(/part-(\d+)\.html/)||[])[1]||1);const hero=document.querySelector('.part-hero, .part2-hero');if(hero)hero.insertAdjacentElement('afterend',partCard(p));
if(![1,2,3,4].includes(p))return;
// 只同步卡片状态，不篡改原始卷名和简介；避免读者解锁后文字无法恢复。
function updateCovers(){document.querySelectorAll('a[href*="/volumes/volume-"]').forEach(link=>{const found=link.getAttribute('href')?.match(/volume-(\d+)\.html/);if(!found)return;const vol=Number(found[1]);const need=(vol-((p-1)*10+1))*10;link.classList.toggle('zs-cover-unlocked',need<=get(p).max);});}
updateCovers();document.addEventListener('zs:part-progress-changed',updateCovers);
const lead=hero&&hero.querySelector('.lead');if(p===1&&lead&&get(1).max<90)lead.textContent='从重生的起点出发。随着阅读推进，第一篇的地图、人物、势力与谜团将逐步揭晓。';
}
function recapGate(){const m=location.pathname.match(/\/parts\/recap-0([12])\.html$/);if(!m)return;const p=Number(m[1]);
document.querySelectorAll('.r-list details').forEach((node,i)=>{const need=(i+1)*10;if(get(p).max>=need)return;node.replaceChildren(el('summary','','第'+(i+1+(p-1)*10)+'卷 · 🔒 读完本卷后解锁'));node.classList.add('zs-locked-summary');node.addEventListener('toggle',()=>{if(node.open)node.open=false;});});
const intro=document.querySelector('main>.lead');if(intro)intro.textContent='每卷回顾按阅读进度开放，未读卷的剧情继续封存。';document.body.classList.add('zs-recap-ready');
}
function archiveGate(){if(document.querySelector('[data-public-archive]'))return;if(!/\/archive\//.test(location.pathname)||/\/archive\/(?:unlocks|quests|bestiary|equipment|characters|classes)\.html$/.test(location.pathname)||/\/archive\/characters\//.test(location.pathname))return;
const main=document.querySelector('main');if(!main)return;
if(get(1).max>=100&&get(2).max>=100&&get(3).max>=100){document.body.classList.add('zs-archive-approved');return;}
main.classList.add('zs-gated-main');const wall=el('div','zs-spoiler-wall');
wall.append(el('h2','','🔒 完整设定档案暂未解锁'),el('p','','此页可能包含尚未阅读篇章的信息。为了避免剧透，先展示与你已读章节对应的渐进档案；完整专题需要第一、第二、第三篇分别读完100章后才开放。'));
const actions=el('div','zs-unlock-actions');actions.append(aLink(BASE+'archive/unlocks.html','查看已解锁档案 →'),aLink(BASE+'parts/part-01.html','返回第一篇目录 →'),aLink(BASE+'archive/quests.html','查看已解锁剧情事件 →'));wall.append(actions);main.append(wall);
}
function catalogPage(){if(!/\/archive\/unlocks\.html$/.test(location.pathname))return;const host=document.getElementById('zs-dynamic-catalog');if(!host)return;const params=new URLSearchParams(location.search),sel=Number(params.get('part'))||1;
function render(){host.replaceChildren();const top=el('div','zs-unlock-panel');
top.append(el('h2','','分篇独立解锁'),el('p','','当前查看：第'+sel+'篇 · '+nameOf(sel)+' · '+summary(sel)),meter(sel));
const actions=el('div','zs-unlock-actions');[1,2,3,4].forEach(p=>actions.append(aLink('?part='+p,'第'+p+'篇')));actions.append(aLink(BASE+'parts/final-archive.html','全部总结'));top.append(actions);host.append(top);
if(sel>4){host.append(el('p','zs-next-lock','该篇尚未发布正式章节。'));return;}
const cats=['人物','职业','地图','势力','世界','事件'];cats.forEach(cat=>{const data=entries.filter(x=>x.p===sel&&x.k===cat);if(!data.length)return;host.append(el('h2','',cat+'档案'));const grid=el('div','zs-unlock-grid');data.forEach(item=>{const ok=available(item),cell=el('article','zs-unlock-card'+(ok?'':' locked'));cell.append(el('small','',ok?'✓ 已解锁 · 第'+item.n+'章':'🔒 第'+item.n+'章后解锁'),el('h3','',ok?item.t:'尚未揭晓'),el('p','',ok?item.d:'继续阅读本篇，达到对应章节后自动显示。'));grid.append(cell);});host.append(grid);});host.append(el('p','zs-footer-notice','本页只显示经过公开核对的阶段资料；未来剧情、人物终局和作者私密笔记不会预先上传。'));}
render();document.addEventListener('zs:part-progress-changed',render);
}
function finalPage(){if(!/\/parts\/final-archive\.html$/.test(location.pathname))return;const host=document.getElementById('zs-final-container');if(!host)return;
function render(){host.replaceChildren();const intro=el('div','zs-unlock-panel');intro.append(el('h2','','全篇进度总览'),el('p','','每篇分别计算，以下只汇总你目前已经解锁的内容。'));
[1,2,3,4].forEach(p=>{const line=el('div','zs-part-card');line.append(el('h3','','第'+p+'篇 · '+nameOf(p)),el('p','',summary(p)),meter(p));intro.append(line);});host.append(intro);
const shown=entries.filter(available);
host.append(el('h2','','已解锁总档案 · '+shown.length+'条'));
if(!shown.length)host.append(el('p','lead','尚未解锁正文档案。阅读第一篇序章与第一章后，故事资料会陆续汇集到这里。'));
['人物','职业','地图','势力','世界','事件'].forEach(cat=>{const data=shown.filter(e=>e.k===cat);if(!data.length)return;host.append(el('h2','',cat));const grid=el('div','zs-unlock-grid');data.forEach(item=>{const card=el('article','zs-unlock-card');card.append(el('small','','第'+item.p+'篇 · 第'+item.n+'章'),el('h3','',item.t),el('p','',item.d));grid.append(card);});host.append(grid);});
host.append(el('p','zs-footer-notice','这里是当前阅读进度的阶段总结，并非全书已完结。最终真相只会在相应正文公开后进入档案。'));const acts=el('div','zs-unlock-actions');acts.append(aLink(BASE+'archive/unlocks.html','进入分篇档案'),aLink(BASE+'parts/part-01.html','返回第一篇'));host.append(acts);}
render();document.addEventListener('zs:part-progress-changed',render);
}
function init(){css();articleUnlock();homepage();partPage();recapGate();archiveGate();catalogPage();finalPage();
if(!document.querySelector('script[src*="site-ui.js"]')){const shell=document.createElement('script');shell.src=BASE+'assets/js/site-ui.js?v=8';document.body.appendChild(shell);}
}
window.ZSUnlock={get,set,entries,partOf};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
