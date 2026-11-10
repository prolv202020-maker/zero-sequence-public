# V8 · Cloudflare GraphQL 访问统计核对（更新于 2026-11-10）

**状态：只读数据已连接；修正了字段误判；网站统计尚未发布。**

## 核心纠正
- Cloudflare Web Analytics 数据模型中的 `site_tag`（站点标识）与 `site_token`（供浏览器 Beacon 使用的令牌）是**两个不同字段**。GraphQL `rumPageloadEventsAdaptiveGroups.dimensions.siteTag` 不能与浏览器 `data-cf-beacon.token` 作字符串相等比较。
- 用户已确认 Cloudflare 控制台的 Beacon Site Token 与正式仓库中 `assets/js/visitor-analytics.js` 配置一致。没有证据要求替换它。
- 早前将 `siteTag !== siteToken` 解释为“统计归属于另一网站”的诊断**错误，已作废**。不要依据该误判修改正式统计代码。

## 已验证
- GitHub Actions Secrets `CF_ANALYTICS_TOKEN` 与仓库变量 `CF_ACCOUNT_ID` 可只读访问 Cloudflare GraphQL。
- `rumPageloadEventsAdaptiveGroups` 支持 `requestHost`、`requestPath_like`、`siteTag` 及时间筛选。
- 查询仅包含 `prolv202020-maker.github.io` 下以 `/zero-sequence-public/` 开头的页面路径，避免计入同域其他 GitHub Pages 项目。
- 在此域名/路径范围内，GraphQL 近30天数据按 `siteTag` 分组为**一个站点标识组**。这说明当前查询范围集中；不等于绝对证实该组与 Cloudflare 控制台某个站点的管理记录对应（当前最小权限不读取站点管理 API）。
- 按相同 UTC 日期日桶计算的诊断聚合为：UTC今日0，近7天500，近30天500；这些是 **RUM page load 统计估值，不是500位独立访客**，并且可能受到自适应采样影响。
- 分别查询7日与30日曾产生575和500的反常组合；已弃用该方式，统一以单次按日分组数据推导窗口。

## 仍需核实
1. 与 Cloudflare Web Analytics 控制台的页面浏览量指标、时间区间和统计口径比对（特别是采样和时区），确认可接受差异。
2. 目前预览按 **UTC 自然日**，不是马来西亚自然日。上线前需要明确标识“UTC”或使用经验证的马来西亚时区查询边界。
3. 若要统计“独立访客人数”，必须另外确认可用且语义准确的指标；不得把 `count` 叫作独立访客。
4. 核对公开站实际部署的 Beacon 脚本是否与 main 一致，避免缓存/旧部署带来的差异。
5. 公开 JSON、前端渲染和 GitHub Actions 更新策略完成安全测试后，仍要取得上线许可；不得自行修改 main。

## 安全状态
- **仅独立分支** `feature/v8-public-traffic-counter-prep-20261110`。
- GitHub Action 使用只读凭据，当前仅生成短期 Actions artifact，未写入公开统计 JSON。
- 原小说章节、读者解锁与阅读进度、V7 MP3 和公开站保持原状；不新增付费服务。

## 参考
- https://developers.cloudflare.com/api/terraform/resources/rum/subresources/site_info/ （同一站点具有不同的 site_tag、site_token 属性）
- https://developers.cloudflare.com/analytics/faq/graphql-api-inconsistent-results/
- https://developers.cloudflare.com/web-analytics/faq/
