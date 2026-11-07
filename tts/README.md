# 《第零序列》中文女声朗读 · 清晰自然 V2

## 本次试听改进
第一次约296字试听曾被切成3段，声线切换与不同语速影响连贯性。新版约296字一次请求，**默认 natural（自然清晰）**。保持一个 Voice ID，使用 Eleven Multilingual v2。
- natural：Stability 0.64、Similarity 0.82、Speaker Boost 开、Style 0、Speed 1.00。不硬切换场景速度，由自然语义和标点表达情绪。
- expressive：后续可选的柔和情绪模式。场景稳定度0.57—0.64，语速仅0.98—1.01，避免突然变快变慢。
- 正式长章分段最多1250字符，传前后文上下文维持语气。GitHub 自动安装 FFmpeg，生成单个MP3，同时保留片段以便定位问题。
- 如仍口齿含糊或带英语口音，优先试听**以普通话录制的原生中文女声音色**，更改稳定度不能消除声音样本固有的发音问题。

## 重新试听（需手动确认付费额度）
打开 GitHub → Actions → ElevenLabs Chinese Female Narration → Run workflow：
1. Branch：main
2. file：`tts/samples/volume_01_chapter_001_audition.txt`
3. voice_profile：**natural**
4. dry_run：**true** 先验证（0额度），之后按需取消勾选生成MP3（会消耗 ElevenLabs Credits）。
5. 运行成功在 Artifacts 下载 `chinese-female-mp3-...` ZIP。里面应该有完整试听MP3，也有单独分段。

对比 natural 版本与原版听感，再决定是否试 expressive；**不要频繁重跑整个章节**。

## 凭据（设置一次）
- GitHub Actions Repository secret：`ELEVENLABS_API_KEY`
- GitHub Actions Repository variable：`ELEVENLABS_VOICE_ID`

安全：只把已经发表的正文放到公开仓库的 `tts/inbox/`。不要把未发表小说或 API Key 发进仓库。自动提交一篇公开正文将使用默认 natural 生成，最大4500字符，试听不超过520字符；没有自动重试消费。MP3 Artifact 默认保留30天。网页有声书不会自行上线。
