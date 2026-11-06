# 第零序列 · 读者访问统计（隐私优先）

## 当前状态

统计适配器已部署，但 **默认关闭**。目前 Cloudflare Web Analytics 站点令牌尚未提供，因此网站不会向统计服务发送访问数据；不能据此声称已收集真实阅读量。所有小说阅读进度依然只储存在本设备浏览器的原有 localStorage 键中，不会发送给统计服务。

## 启用步骤（需作者拥有自己的 Cloudflare 账号）

1. 登录 https://dash.cloudflare.com/ ，在 Web Analytics 中新增一个手动安装站点。网站主机名填写 `prolv202020-maker.github.io`（Cloudflare 对 GitHub Pages 的子目录可通过页面 URL 筛选）。
2. 从 Cloudflare Web Analytics 的 Manage Site 复制**公开站点令牌**（不是账户 API Token）。
3. 将 `assets/js/visitor-analytics.js` 的 `CLOUDFLARE_SITE_TOKEN` 从空字符串改成 Cloudflare 提供的 32 位站点令牌，提交到公开仓库。
4. 在 Cloudflare 的 Web Analytics 面板查看 Page views、Referrers 和页面表现。访问数据不会出现在本网站公开页面上。

本网站默认不启用第三方追踪，适配器尊重浏览器 Do Not Track / Global Privacy Control；只有域名为 `prolv202020-maker.github.io` 时才可加载。Cloudflare 官方表示 Web Analytics 不使用 Cookie、localStorage 或设备指纹收集分析数据。请自行确认网站适用地区的隐私合规需求。

**局限**：Cloudflare Web Analytics 当前不会采集完整 UTM 查询参数，也不支持自定义事件，因此 TikTok/YouTube 的流量可结合 Referrer 和各平台点击分析观察，不能保证精确归因到每条视频。不可将“页面访问”解读为“完整阅读一章”。

官方说明：https://developers.cloudflare.com/web-analytics/get-started/

## 故障保护

未设置令牌：不发出第三方统计请求；所有小说、图鉴、解锁和阅读设置不受影响。统计请求被浏览器拦截或网络中断：阅读内容继续正常显示。
