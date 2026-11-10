# 第零序列 GitHub Pages 404 恢复说明（2026-11-11）

## 根因
第35卷提交已合并至 `main`，但 GitHub Pages 部署运行 `42817373659` 的部署步骤在 `syncing_files` 停留近十分钟，于 2026-11-10 12:49 UTC 以 `Timeout reached, aborting!` 失败并取消部署。
旧发布树约 **979.4 MB**，有声 MP3 共 **131 份、929.7 MB**；站点过于接近 GitHub Pages 最大 1 GB 发布限制。

## 保留与迁移
- 先于任何删除操作创建 `audio-archive-v1` 分支，保存原始完整 131 份子悦 Zi Yue V4 MP3，以及所有旧文件。
- 原始 MP3 从当前发布的 `main` 树中剔除，但在 `audio-archive-v1` 分支和 Git 历史中完好无损；可用 `assets/data/audio-archive-manifest.json` 核查每个文件的 SHA 和字节大小。
- 网站正文、音频中心、语音下载入口通过前端公共适配代码从 `https://raw.githubusercontent.com/prolv202020-maker/zero-sequence-public/audio-archive-v1/` 读取原有 MP3。
- 保留原有四首本地情绪 BGM、全部已发表小说正文、封面与CG、章节导航、搜索、防剧透和阅读进度存储键。
- 站点发布树预计由约979 MB降低至约50 MB。

## 注意
GitHub raw 文件服务是临时免付费公开音频来源，不应承诺与正式CDN等同的高并发、断点续传或下载行为。以后宜迁移至独立免费/低成本对象存储（如Cloudflare R2），并仅改变共同媒体根路径，避免重新向 Pages 塞入超过900MB 的音频。
上线验收需核对：Pages 部署结果=success；首页、第35卷、341/350章；手机章节切换；独立防剧透；真实音频播放/下载；BGM；读者匿名统计。真实Android实机测试仍单独标注，不以模拟测试替代。
