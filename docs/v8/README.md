# 第零序列 V8 · 免费公开访问统计（独立分支准备稿）

## 执行状态
- 公开站保持不变。此分支不修改 main/index.html、不发布任何统计数字、不启用定时调度。
- 仅已添加独立的浏览量组件 JS 和 HTML 预览代码。
- 尚未连接 Cloudflare Analytics API，尚未查询真实数据；前端必须显示“访问数据暂未取得”。
- **不能把页面浏览量、访问次数误称独立访客人数。** Cloudflare Web Analytics 数据可能有抽样，API 展示应注明平台统计口径。

## 可靠的数据路径
Cloudflare Web Analytics（现有站点 Beacon）→ 需要账户权限的 GraphQL Analytics API → GitHub Actions Secrets 中的只读 API Token → 校验聚合统计 → 仓库内公开 JSON → GitHub Pages 读取 JSON（无密钥）。

### 发布格式
`assets/data/public-traffic.json`：必须严格符合以下格式才能被 V8 组件显示。
```json
{
  "schema": "zs-public-traffic-v1",
  "site": "zero-sequence-public",
  "status": "verified",
  "updatedAt": "2026-11-10T00:00:00Z",
  "metrics": {
    "unit": "page_views",
    "todayPageViews": 0,
    "sevenDayPageViews": 0,
    "thirtyDayPageViews": 0
  }
}
```
上述 JSON 是字段示例，数字0**不是实际数据**，绝不可当成正式文件发布。只有 API 成功查询并核实筛选范围后，才写入正式 JSON；否则保留旧值并标记更新时间或不输出文件。

### 正确的网站筛选
- 正式站 URL 前缀：`https://prolv202020-maker.github.io/zero-sequence-public/`。
- GitHub Pages 主机名可能同时承载其他项目，仅按 hostname 聚合会污染统计。必须确认 Cloudflare API 能按项目的 `requestPath` 前缀精确筛选，或在 Web Analytics 上确认当前 siteTag 数据仅属于本项目。
- API 字段、采样区间、账户读权限需要对真实账号做一次最小化查询后才确定。未知条件下拒绝输出看似准确的数字。
- 一次浏览量不等于一个独立真人。暂不实现“累计总访客”，因为 Cloudflare Web Analytics 并不保证从项目上线第一天完整保留历史。

### 安全条件
1. 创建范围最小的 Cloudflare 只读 API Token，永不粘贴在聊天里，不保存到 HTML、Git、JSON 或调试日志。
2. GitHub 仓库 Settings → Secrets and variables → Actions → New repository secret；使用 `CF_ANALYTICS_TOKEN`。Cloudflare 账户 ID 作为普通变量 `CF_ACCOUNT_ID` 即可。
3. 只有完成真实账号 API 试读、确认站点范围及指标口径、检查 Actions 免费额度，才添加读取脚本与发布工作流。
4. GitHub Secrets 不可通过公开 JS 读取。任何 API 错误都不显示虚构数值；不得触发全站高频部署。
5. 不触及现有正文、阅读进度、小说图鉴、有声 MP3、音频迁移 V7 与防剧透逻辑。

## 未完成的门槛
- Cloudflare API 账户权限与 siteTag/子目录隔离能力实际验证
- 今日/7日/30日时区和 Cloudflare 时间窗口边界确认
- 统计获取脚本、只读与更新 workflow 的隔离验收
- UI 适配原官网风格，手机布局、0/不可用等状态检查
- 正式站是否增设统计卡片须单独批准和验证 Pages 构建体积

官方文档：
https://developers.cloudflare.com/analytics/graphql-api/
https://developers.cloudflare.com/web-analytics/faq/
https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets
