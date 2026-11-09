# 《第零序列》V7 · 有声书托管准备与发布减负（未执行迁移）

**状态：准备阶段 / 需要用户另行授权外部存储与确认原始直链兼容策略。不得据此宣称已迁移、已发布或已备份至云端。**

## 已核实事实（2026-11-09）

- 公开站 `prolv202020-maker/zero-sequence-public`，主分支基线 `3137f25df8f508c4186b3c3a07f6e9832ae1231d`。
- 已发布录音：第1—13卷每卷10章，共130个MP3，加第一卷序章1个MP3，合计 **131** 个。Git树字节和 **929,684,308**；文件精确路径、原始字节和Git对象SHA-1见 `docs/v7-audio-source-manifest.json`。
- GitHub Pages 的两次部署在 `syncing_files` 阶段超过10分钟而失败，V6的桌面与模拟手机Chrome验收通过。Pages部署错误详情见 [GitHub Actions 42600215592](https://github.com/prolv202020-maker/zero-sequence-public/actions/runs/42600215592)。
- GitHub Pages 发布站点不能超过1GB，部署时长不能超过10分钟；来源：[GitHub官方限制](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)。上述失败与网站体量高度相关，但不能武断认定容量是唯一技术原因。
- 此准备分支不修改任何MP3、HTML章节播放器、`audiobook-center.js`、人物图鉴、原小说、阅读/朗读进度，也不修改 Pages 设置或生产环境。

## 已完成的可离线执行的工具

1. `docs/v7-audio-source-manifest.json`：131条 `path`、`bytes`、`gitBlobSha1`、固定基线提交，顺序从序章再按卷章排列；不含私人作者内容。
2. `node scripts/v7-audio-integrity.mjs --full --report`：流式比对所有源文件的 Git blob SHA-1，同时计算独立的原始字节 SHA-256；核对HTML音频链接、路径/大小/MP3头，输出 `v7-audio-results/checksum-report.json`。**无需再付 ElevenLabs 点数**。
3. `node scripts/v7-pages-size-plan.mjs --report`：只计算当前发布体量与不包含有声书时的理论静态站体量。**没有实际删除、复制或发布**。
4. `node scripts/test-v7-audio-preflight.mjs`：模拟远端MP3服务，验证HTTPS域名白名单、HTTP 206、分段字节与原始数据一致、CORS以及完整SHA256。坏CORS、Range返回200或嵌入密码URL均必须失败。
5. `node scripts/v7-remote-audio-check.mjs --origin=https://audio.YOUR_DOMAIN/ --deep --report`：待独立存储完成上传后才运行，检查全部131个公开对象的HTTP HEAD、Content-Length、Content-Type、CORS、Range 206及整文件SHA256。**不写原存储文件**。不得用少量抽样代替全库复核。

## 建议托管方式

推荐 Cloudflare R2 **Standard** 存储类 + 正式自有音频子域（例如 `https://audio.YOUR_DOMAIN/`）。R2当前标准存储有10 GB-month/月、每月100万次A类请求及1000万次B类请求免费额度；超额按实际计费，开通R2订阅可能要求账单资料。见 [官方计费说明](https://developers.cloudflare.com/r2/pricing/)。
本项目音频约0.93GB，初步在免费存储配额内，但请求、流量、关联服务与域名费用应另外评估。R2的 `r2.dev` 仅适合开发、会限流，**不可作为正式长期音频CDN**。见 [公共桶与自有域说明](https://developers.cloudflare.com/r2/buckets/public-buckets/)。

对象键与原相对路径严格一致。例如：
`assets/audio/audiobook/part-01/volume-01/prologue.mp3`
`assets/audio/audiobook/part-02/volume-13/chapter-010.mp3`

对象上传设置 `Content-Type: audio/mpeg`、可选 `Content-Disposition`（下载文件名），启用适当的静态缓存；按需允许 `Origin: https://prolv202020-maker.github.io` 的跨域 GET 和 HEAD，并暴露 `Content-Length`、`Content-Range`、`Accept-Ranges`。参考 [R2 CORS文档](https://developers.cloudflare.com/r2/buckets/cors/)。

> **账号要求：** 需要用户实际登录 Cloudflare，开通R2订阅、创建私密桶及备份方案、准备受控自有域名或其他能长期使用的生产级媒体域名。切勿在聊天中粘贴 API 秘钥或支付信息。若外部服务支持连接，连接时必须由用户明确授权。

## 不能省略的安全迁移顺序

1. **原件与备份：** Git公共仓库里全部131段MP3保持原样，不删除、不覆盖、不改音质或编码。取得一份独立可恢复备份（本地盘或独立私有存储），上传后对原件与备份逐一核实完整SHA256。
2. **先传后验：** 将**同一字节**按原路径作为对象键上传到R2的正式域名；设置音频MIME、HTTP Range、CORS；运行 `v7-remote-audio-check.mjs --deep --report`，必须全131段通过。
3. **仅在独立发布分支替换播放链接：** 修改131个有声章节原生 `audio source` 与下载 `href`（保留原始文件名）、有声中心 `pathFor`，通过全站HTML/JS检查和真实Chromium桌面与模拟手机测试，确认手动播放、拖动、续播、跨卷、BGM暂停、无自动播放、阅读进度不变。
4. **独立 GitHub Pages Actions 部署：** 需由仓库管理员把 Pages Source 改为 `GitHub Actions`。自定义构建**仅在已经验证远端的情况下**排除 `assets/audio/audiobook/**`，保留所有正文、图片、CG、BGM、字体和页面。MP3仍保存在Git仓库和外部备份，**只是从新发布包中排除**。核对自定义产物大小与链接无缺失，部署成功后再确认新站。
5. **回归和回滚：** 逐一检查131段HTTP 206与完整性、Chromium桌面/模拟手机和若干真实设备；失败则保留旧站现有服务、不推送不完整版本，回滚到上一版正常页面配置与已验证音频托管路径。记录发布SHA，严格禁用携带密码的公开对象链接。

## 重要历史直链限制（必须确认）

当前 `https://prolv202020-maker.github.io/zero-sequence-public/assets/audio/audiobook/...mp3` 是 GitHub 管理的域名：若自定义Pages部署包不再包含原MP3，该**具体旧音频直链**将返回404。我们**不能在不控制 github.io 域名的情况下保证这些原始直链透明重定向**。因此必须区分：

- **可以维持：** 旧小说章节页面网址、网站内有声中心网址、阅读进度键、音频进度键、章节间导航，以上页面中的播放器和下载按钮经切换仍可用。
- **无法自动维持：** 读者从外部复制保存的旧GitHub Pages MP3原始直链。若绝对要求旧直链继续播放，需另议保留旧资源的部署方案或用户自有域名的反向代理；不能承诺已经做到。
- 在用户确认可接受何种直链兼容性之前，**本V7仅做准备与验证，不执行生产切换。**

## 下一次需要用户协助的操作

用户确认可用的R2账户及自有域名／成熟公共音频托管方案；如需要创建Cloudflare API/对象存储访问令牌，请在安全平台配置权限，不要发送到聊天。若尚无自有域名，先确定域名预算或替代方案。只有外部端点和原始直链处理方式都定案，才进入真正的音频迁移与Pages部署。

**相关原站配额与登录数据：** 三篇独立 `zs:part-progress:v1`、正文阅读 `zs:reader:last:v1` 与收听 `zs:audiobook:*:v1` 均不修改；不强制读者注册登录、不删除已公开资料。
