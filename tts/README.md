# 《第零序列》方案 B：单一中文女声 + 情绪变化

## 已设定
- **模型：** Eleven Multilingual v2（适合长篇中文朗读）
- **唯一音色：** GitHub Actions Variable `ELEVENLABS_VOICE_ID`。五种场景均使用同一个 ID，不调用多人对话功能。
- **情绪：** 旁白 / 战斗 / 悬疑 / 悲伤 / 温柔。自动识别词汇，微调 stability 与 speed（风格强度仍为 0），不会往朗读稿插入音频标签。
- **收费保护：** 一章不超过 4,500 字符；试听样稿最多 520 字符。遇到请求失败不自动重试；手动重新运行会重新扣费。
- **资料保护：** 公开仓库只能放已正式发表的小说章节。未发表剧情使用本地工具。

## 第一次试听（不必上传新的正文）
已准备公开第1卷第1章摘录：
`tts/samples/volume_01_chapter_001_audition.txt`。

1. 登录 ElevenLabs，进入 **My Voices**，选一位你满意的普通话女声，点右侧 **··· → Copy voice ID**。
2. 在 GitHub 仓库 **Settings → Secrets and variables → Actions**，设置：
   - Repository **secret**：`ELEVENLABS_API_KEY` = 你的 API Key（保密，不发送到聊天）
   - Repository **variable**：`ELEVENLABS_VOICE_ID` = 所选女声的 Voice ID（可告诉我，但不用提供密钥）
3. 打开 GitHub → **Actions → ElevenLabs Chinese Female Narration → Run workflow**。
4. `file` 输入 `tts/samples/volume_01_chapter_001_audition.txt`，`dry_run` **保持 true**，先检查字数、段落和情绪标记；不会请求 ElevenLabs，也不消耗 credits。
5. 确认后重复第4步，把 `dry_run` 改为 **false**，生成真实试听。打开该工作流运行结果 → Artifacts，下载 `chinese-female-mp3-...`，解压试听 MP3。

**试听有多段**，目的是在同一中文女声下听到平静与悬疑／伤感之间的变化。连续朗读可能在分段接缝有微小变化，正式长篇建议逐章试听后再调整。

## 今后自动生成一章
把已经公开的章节发送到 ChatGPT，让它整理为忠实原文的中文朗读 TXT；上传到 `tts/inbox/chapter_001.txt` 并合并到 main 后，会自动触发生成。上传一个 TXT 一次，避免多个章节同时触发。**每次生成都会消耗你自己的 ElevenLabs 订阅额度。**

下载路径：GitHub → Actions → 对应运行 → Artifacts，30 天内下载 MP3。GitHub Pages 不会自动公开生成的音频。

## 情绪设置
| 场景 | Stability | Similarity | Speed |
|---|---:|---:|---:|
| 普通旁白 | 0.56 | 0.76 | 0.95 |
| 战斗与PK | 0.42 | 0.76 | 1.02 |
| 悬疑与调查 | 0.49 | 0.76 | 0.92 |
| 悲伤与离别 | 0.62 | 0.76 | 0.90 |
| 温柔与关心 | 0.53 | 0.76 | 0.94 |

注意：Multilingual v2 不能保证完全按情绪标签表演；这里是轻量参数调整，音质与情绪取决于原音色和上下文。
