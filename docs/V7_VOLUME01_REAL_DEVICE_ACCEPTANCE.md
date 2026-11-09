# 第零序列 V7 · 第一卷真实设备音频验收单（仅测试，不改正式站）

## 当前已核实
- Actions 42619897879：原始11段源文件SHA/字节核对、备份 artifact、测试 Release 11/11、11段下载SHA-256比对、Range 206、Chromium 桌面及模拟手机续播和跨章节连续播放均成功。
- 测试 Release：https://github.com/prolv202020-maker/zero-sequence-public/releases/tag/zs-v7-volume01-drill-20261109
- 浏览器WebKit模拟验收成功不等于真实 iPhone Safari 已通过；GitHub Releases 直链带 Content-Disposition: attachment，可能在不同手机浏览器转为下载而非内联播放。
- 测试不会切换正式站或覆盖用户目前已保存的阅读/收听进度。

## 测试音源（已存在，不是拟议URL）
1. 序章：https://github.com/prolv202020-maker/zero-sequence-public/releases/download/zs-v7-volume01-drill-20261109/part-01-volume-01-prologue.mp3
2. 第8章：https://github.com/prolv202020-maker/zero-sequence-public/releases/download/zs-v7-volume01-drill-20261109/part-01-volume-01-chapter-008.mp3
3. 第9章：https://github.com/prolv202020-maker/zero-sequence-public/releases/download/zs-v7-volume01-drill-20261109/part-01-volume-01-chapter-009.mp3

## 真实设备手动验收步骤（每台分别执行）
1. 用 Safari（iPhone）或 Chrome（Android）直接打开第8章测试MP3，记录：内联播放/下载/报错/需登录。
2. 如能够内联播放，尝试暂停、从播放起点跳到中间、继续播放；记录是否可拖动。
3. 下载到设备后独立播放，记录文件是否正常。（注意：下载成功不等于网站内嵌播放成功。）
4. 连接Wi-Fi与移动网络分别进行一次短时间加载；不要强行下载所有11段。
5. 如条件允许，尝试从第8章链接打开第9章，确认两者都可访问。
6. 记录设备型号、系统版本、浏览器版本、日期、是否内联播放、是否可以拖动、是否正常下载，以及报错截图。**不要记录或共享账号密码、隐私信息**。

## 待独立环境验证
- 正式网站的播放器尚未切换到Release音源，所以不能在正式站把本次手动测试当作源站迁移后的真实手机整合验收。
- 在真实设备上完整验证站内有声中心、localStorage续播、章节自动连播，需要一个隔离且可公开访问的测试页；不可直接把演练网址写进正式站。
- 压力/长期可用性/服务条款仍待评估；GitHub Releases不承诺为流媒体CDN。
- 旧GitHub Pages MP3绝对直链在移除旧文件后不能保证继续可用，正式迁移前必须取得明确确认。

## 安全边界
- 无付费服务、无新增 TTS、无删除文件、无主站音频URL替换。
- 第1卷已有11段MP3在测试Release并不是正式发布迁移。
- 真实设备测试失败时先诊断，不继续上传后续120段。
