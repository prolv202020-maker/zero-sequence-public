# 第零序列 · THE ZERO SEQUENCE

《第零序列》的公开读者网站。

## 入口

- `index.html`：首页
- `parts/`、`volumes/`、`chapters/`：正式公开篇章、29卷目录与290章正文及序章
- `archive/characters.html`：按阅读进度显示的公开人物图鉴
- `archive/classes.html`：公开基础职业图鉴
- `archive/unlocks.html`：分篇独立解锁记录
- `archive/quests.html`：已发布剧情事件索引
- `archive/` 其他专题：仅展示经过读者发布审核的里程碑摘要

## 公开/私人边界

本仓库完全公开。网页上的锁定只用于阅读体验，不能保护源代码或 Git 历史。

作者原始世界观、隐藏职业、人物完整命运、设计草案与内部数据存于独立 **Private** 仓库；请勿把它们直接放回本仓库。

本仓库 `zero-sequence-public` 是使用独立初始提交建立的全新公开发布仓库，**没有复制旧仓库 `zero-sequence` 的 Git 提交历史**。但旧仓库及第三方缓存里曾公开的历史内容仍可能被找回，因此不能声称过去的泄露已撤回。

详情见 [PUBLICATION_BOUNDARY.md](PUBLICATION_BOUNDARY.md)。

发布前运行 `node scripts/audit-public-boundary.mjs`、`node scripts/audit-site-links.mjs`、`node scripts/ensure-chapter-bootstrap.mjs --check`；GitHub Actions 会在提交后自动执行。防剧透关键词扫描不能替代人工逐章审稿。

## 正式网站

- 读者站：https://prolv202020-maker.github.io/zero-sequence-public/
- 本仓库只接受已公开章节、已公开读者摘要和前端程序。请勿迁入 `source-backup/` 或任何私人底稿。
- 由于新站域名路径与旧站不同，浏览器本地阅读进度**不会自动从旧站迁移到新站**，因此不应删除旧站来强制读者切换。

## 阅读数据

阅读进度仅储存在浏览器 `localStorage` 中，默认不跨设备同步。所有已发布章节可直接阅读；人物、任务与世界档案则按每篇已读进度逐步显示。

> 故事尚在书写，命运仍未定稿。
