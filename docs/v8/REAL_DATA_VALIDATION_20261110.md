# V8 · Cloudflare GraphQL 真实统计读取验证（2026-11-10）

**状态：后端只读数据已接通；尚未获准公开展示。不要合并部署。**

## 已验证
- GitHub Actions Secret `CF_ANALYTICS_TOKEN` 可以认证；Actions Variable `CF_ACCOUNT_ID` 可以查询 GraphQL 数据。
- `rumPageloadEventsAdaptiveGroups` 支持 `siteTag`、`requestHost`、`requestPath_like` 和时间过滤。
- 近30天针对 `prolv202020-maker.github.io` + `/zero-sequence-public/%` 的查询找到 RUM 页面加载统计数据。
- RUM 按 `siteTag` 分组：此路径上找到1组页面事件，**与正式 main 分支 `visitor-analytics.js` 的已配置 Beacon Site Token 不同**。需要作者到 Cloudflare Web Analytics 面板确认正确的属性和嵌入代码；不能自动推断并覆盖正式 token。

## 查询注意
- 单独直接聚合近期时间段，出现近7日575、近30日500的非单调结果；不能当作真实准确且互相可比的合计。
- 按 UTC 日期一次性获取30个日桶、再从相同日桶推导，得到今日0、近7日500、近30日500（仅为 **Cloudflare RUM 页加载事件诊断值，不是500个人**）。共4个日桶有数据。
- Cloudflare RUM AdaptiveGroups 有自适应采样可能，两个查询口径不可混搭；对外展示前仍需要和 Cloudflare 仪表板口径核对。
- UTC 日期不等于马来西亚当天日期；发布前要确认合适的时间边界及文字。
- 因 Site Token 不一致，目前 V8 公开组件保持只显示“— / 访问数据暂未取得”，不发布上述诊断数值。

## 关联 Actions
- 账号变量和带 Site Token 的 API 读取：42742814401
- 完整 scope 诊断：42743082180
- 公开 Beacon Token 与真实 RUM 分组不一致：42743229704
- 每日同口径统计：42743736190

## 下一道安全门槛
1. 在 Cloudflare 控制台 Web Analytics → 对应网站 → Manage Site / Installation snippet，确认当前有效的 **public beacon site token**。它不是账户 API 密钥。
2. 不需要扩大 API Token 的读取权限；Web Analytics Sites 管理 REST API 另要求 Account Settings Read，不建议为了这次统计任务开放额外权限。
3. 核实部署中的旧/新 beacon token 是否相同，并对照 dashboard 的数据；只在独立分支修复配置。
4. 通过浏览器、日期与部署负载检查后再确定公开主页发布方案；不允许改动 V7 MP3、小说正文、阅读记录或防剧透。

## 安全约束
Token 放在 Actions Secrets；不能向读者展示 API Token，不需要新付费服务。整个 V8 仍是独立分支准备状态，main 和正式网站没有被更改。
