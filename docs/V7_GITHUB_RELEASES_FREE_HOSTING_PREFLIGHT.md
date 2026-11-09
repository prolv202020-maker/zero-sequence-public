# 第零序列 V7 · GitHub Releases 零新增付费托管预检

> 状态：方案A已选择；本文件只记录只读检查及拟议测试。不创建Release、不上传MP3、不删除Pages文件、不修改主站。

## 核验事实（2026-11-09）
- 官方文档：https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases
- 每个Release附件数最多1000；单附件小于2 GiB；官方未对Release总容量及带宽设定配额。但使用仍受GitHub服务条款、风控及资源政策约束，**不代表永远无限或提供流媒体SLA**。
- Pages官网：https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- Pages发布站点上限1 GB，部署超过10分钟会超时。
- 当前项目音频清单见 docs/v7-audio-inventory.json（131段，929684308字节，Git blob SHA）；审计脚本见 scripts/test-v7-audio-integrity.mjs。
- 2026-11-09查询公开仓库 Releases API 返回空数组（无现成Release可供网页兼容性测试）。

## 阶段1：不上传的准备
1. 保持 main 原样并沿用独立审计分支；所有文件路径、播放/下载功能、听书进度键、三篇独立防剧透、BGM不变。
2. 按章节生成**仅在测试环境使用的**映射：例如 `https://github.com/prolv202020-maker/zero-sequence-public/releases/download/audio-v7-test/part01-volume01-chapter001.mp3`；这是命名规则示例，**链接尚不存在**，不得写进正式网页。
3. 上传前应完成131段源音频离线备份（逐一验证SHA），并规划发布分卷资产命名与校验表；不得消耗ElevenLabs积分进行重生成。

## 阶段2：单文件小规模真实测试（待具备上传授权和可用工具）
- 在测试Release上传**一段已有MP3**，记录asset id、文件长度、SHA256、HTTP响应状态、重定向结果、Content-Type、Access-Control-Allow-Origin、Accept-Ranges和Range 206；必要时将跨域播放器URL作为测试用例。
- 在桌面Chrome与手机Safari/Chrome实测：HTML Audio metadata、play、pause、seek、resume、download及章节切换、BGM互斥。
- 注意GitHub release直链在不同浏览器/CORS条件下可能触发下载，不能以下载成功代替 `<audio>` 播放成功。
- 如果不稳定，不扩大迁移；研究其他真正免费的合规托管方式。

## 阶段3：仅测试成功后才考虑全量迁移
1. 用版本化Release组织131文件，记录每个文件的新url/大小/哈希；保持稳定命名，不覆盖旧资产。
2. **仅在独立网站分支**将章节播放器及听书中心改用已验证URL；保留原 `zs:audiobook:last:v1` / `zs:audiobook:positions:v1` 数据格式。
3. 完整自动校验131段链接和全站浏览器回归；确认新发布产物低于Pages限制并能够部署成功。
4. 必须明确提醒：移除Pages原MP3后，先前收藏的旧MP3直链无法自动301/302；如要求旧MP3直链永久可用，则不应移除它们。
5. 正式切换前再次取得授权；**不删Git历史或原件**。发布失败保持旧站，绝不宣称迁移成功。

## 费用防护
- 只使用现有GitHub免费权益；不注册任何收费CDN或外部对象存储、不绑定付款卡、不启用GitHub付费附加服务。
- 如果出现必须付费、政策限制或兼容性失败，立即停止测试并反馈，不自动购买。
