#!/usr/bin/env python3
"""Attach audio only once an actual checked MP3 exists."""
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
audio=ROOT/"assets/audio/audiobook/part-01/volume-02/chapter-001.mp3"
assert audio.exists() and audio.stat().st_size>700000,"No verified MP3"
page=ROOT/"chapters/volume-02/chapter-001.html"
html=page.read_text(encoding="utf-8")
assert "第一章　开服倒计时" in html and "zs-audiobook-player" not in html
html=html.replace('<link rel="stylesheet" href="../../assets/css/style.css">','<link rel="stylesheet" href="../../assets/css/style.css"><link rel="stylesheet" href="../../assets/css/chapter-audiobook.css?v=1">',1)
panel='''<section id="zs-audiobook-player" class="zs-audiobook-panel" aria-labelledby="zs-audiobook-title"><p class="zs-audiobook-kicker">AUDIO EDITION · 第一篇《轮回启幕》</p><h2 id="zs-audiobook-title">🎧 第一章 · 子悦中文女声有声版</h2><p class="zs-audiobook-description">《开服倒计时》· Zi Yue 子悦 · Eleven v4 · 情绪旁白 · 完整章回</p><audio id="zs-chapter-narration" controls preload="none" aria-label="第二卷第一章《开服倒计时》子悦中文女声朗读"><source src="../../assets/audio/audiobook/part-01/volume-02/chapter-001.mp3?v=zi-yue-v4" type="audio/mpeg">您的浏览器暂不支持音频播放，请使用下面的 MP3 下载链接。</audio><div class="zs-audiobook-actions"><span>点击后开始朗读 · 不自动播放</span><a href="../../assets/audio/audiobook/part-01/volume-02/chapter-001.mp3?v=zi-yue-v4" download="第零序列_第二卷第一章_开服倒计时_子悦_ZiYue_V4.mp3">下载完整 MP3</a></div><p id="zs-chapter-narration-status" class="zs-audiobook-status" role="status" aria-live="polite">如正在播放背景音乐，开始朗读时会自动暂停背景音乐。</p></section>'''
html=html.replace('<div class="article">',panel+'<div class="article">',1)
html=html.replace('</body></html>','<script src="../../assets/js/chapter-audiobook.js?v=2" defer></script></body></html>',1)
page.write_text(html,encoding="utf-8")
print("Audio player attached after verified MP3.")
