# 《第零序列》官方中文女声 · Zi Yue（子悦）Eleven v4

自 2026-11-07 起，作者已确认**所有后续有声章节使用同一位 Zi Yue 女声**，Eleven v4 通过轻量情绪标签演绎悬疑、回忆、温柔对话等场景。旧女声 Amy 仅作为备选，不再默认使用。

## 正式默认配置
- `voice_preset=zi-yue`，Voice ID `5qr5FEpvZGzmVOPBS55W`（已通过实际Eleven v4合成验证）
- `model=eleven_v4`、`profile=expressive`
- stability 0.53、similarity boost 0.78。v4 不传旧版 speed/style；采用真实标点、少量适度音频标签维持自然节奏。
- 每次只生成**一个**已发表的章节；4,500 字符上限，v4 允许一章作为一个请求，保留连贯的朗读语气。
- GitHub Secret `ELEVENLABS_API_KEY` 维持不变；既有 GitHub Variable `ELEVENLABS_VOICE_ID` 是旧声回退，不需删除/替换，默认不读取它。

## 第一章换声
- 已公开原文：`tts/inbox/volume_01_chapter_001.txt`
- 完整单人情绪朗读稿：`tts/production/volume_01_chapter_001_zi_yue_v4.txt`，仅新增 Eleven v4 情绪标签，移除标签后与第一章原文一致。
- 一次性工作流 `.github/workflows/produce-zi-yue-chapter1.yml` 在首次合并后自动生成完整版，将 MP3 存为 GitHub Artifact 以及独立审核分支。合成需付费，作者已明确同意替换第一章并上线。设置分支防重复运行。
- 最终与网站播放器相关 PR 合并后，正文页 MP3 使用 `?v=zi-yue-v4` 防止用户看到旧缓存。

## 之后制作其他章节
提交**已公开**的章节到 `tts/inbox/*.txt` 一次一个，自动生成使用 Zi Yue v4。为准确控制感情，建议为每章准备与原文完全对应的情绪标记朗读稿，并按需使用 GitHub Actions 的手动运行入口（`voice_preset=zi-yue`, `tts_model=eleven_v4`）。不会自动批量制作尚未指定的章节，也不会自动上线未经核对的 MP3。

## 安全
公开仓库中的 TXT/标签都完全公开，只放已发表正文。不能提交 API Key。生成失败不会自动重试收费请求。免费 `dry_run=true` 测试文本但不生成 MP3。
