# 《第零序列》ChatGPT → ElevenLabs 女声连接桥

**公开仓库警告：** tts/inbox 中的文本与提交历史对所有人公开。只能放已公开的章节。未公开底稿请使用本地朗读工具。

## 作者只需设置一次
1. 在 ElevenLabs → Developers → API Keys 新建 API Key，勾选 Text to Speech 权限，建议设定月度额度限制。
2. 在 GitHub 仓库 Settings → Secrets and variables → Actions → Repository secrets，新建 Secret：ELEVENLABS_API_KEY，填入密钥。不要把密钥发在聊天里或提交到仓库。
3. 在同一页面 Variables，新建变量：ELEVENLABS_VOICE_ID，填入已选定的中文女声 Voice ID。可以在 ElevenLabs Voices → My Voices 复制。

## 朗读流程
把已经发布的小说正文交给 ChatGPT，让它整理保留原文的中文朗读稿，再作为一个 tts/inbox/chapter_001.txt 文件提交合并到 main 分支；一次只提交一个 .txt 文件。GitHub Actions 会自动使用 ElevenLabs 生成语音，并保存为可下载 MP3 Artifact。

若要先测试而不消耗额度：GitHub → Actions → ElevenLabs Chinese Female Narration → Run workflow，输入对应的 TXT 路径，保持 dry_run=true。测试通过后可改为 false 手动生成。

下载路径：GitHub → Actions → 对应的 ElevenLabs Chinese Female Narration 成功运行 → Artifacts → 下载 chinese-female-mp3-... ZIP，解压找到 MP3。

安全规则：单次最多 4500 字符，自动分段 1450 字符；只生成已公开文本，不自动发布 MP3 到小说网站。重新提交或重新运行会再次消耗 ElevenLabs Credits；生成失败时不会自动重复收费请求。Artifacts 默认保存 30 天。
