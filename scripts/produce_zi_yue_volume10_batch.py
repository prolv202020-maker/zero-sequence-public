#!/usr/bin/env python3
"""Make exactly one Zi Yue v4 full-length audiobook MP3 for each published volume 10 chapter (1-10).
Before any paid requests validate all original chapter text and quote ElevenLabs credit count.
Each verified result is saved immediately in a review branch. No automatic paid retries.
"""
from __future__ import annotations
import argparse
import html as html_lib
import re
import subprocess
import sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
REVIEW="feat/zi-yue-v4-volume10-audio-20261108"
VOICE="zi-yue"
VOLUME=10
def source(i):
    path=ROOT/f"chapters/volume-10/chapter-{i:03d}.html"
    raw=path.read_text(encoding="utf-8")
    article=raw.split('<div class="article">',1)[1].split('<div class="pager">',1)[0]
    paragraphs=[html_lib.unescape(re.sub(r"<br\s*/?>","\n",x,flags=re.I)) for x in re.findall(r'<p(?:\s[^>]*)?>(.*?)</p>',article,re.S)]
    title=html_lib.unescape(re.search(r'<h1[^>]*>(.*?)</h1>',raw).group(1))
    assert len(paragraphs)>=30 and not any("<" in x for x in paragraphs),f"Unexpected HTML in chapter {i}"
    assert not "zs-audiobook-player" in raw,f"Chapter {i} already has an audio player; refuse duplicate"
    return path,raw,title,paragraphs
def narrated_text(title,paragraphs):
    flags={0:"softly",max(1,len(paragraphs)//5):"curious",max(2,len(paragraphs)//2):"warmly",max(3,3*len(paragraphs)//4):"curious",len(paragraphs)-7:"whispers"}
    lines=[title]
    for j,p in enumerate(paragraphs):
        if j in flags: lines.append(f"[{flags[j]}]")
        lines.append(p)
    text="\n\n".join(lines)+"\n"
    cleaned=re.sub(r"(?m)^\[(?:softly|curious|warmly|whispers)\]\s*\n","",text)
    assert re.sub(r"\s+","",cleaned)==re.sub(r"\s+","",title+"".join(paragraphs))
    return text

def segment_text(title,paragraphs):
    # Split only at original paragraph boundaries for the first, unusually long chapter.
    # Every segment stays within ElevenLabs' tested 4,500-character request limit.
    groups=[]
    current=[]
    for paragraph in paragraphs:
        attempt=current+[paragraph]
        if current and len(narrated_text(title if not groups else "",attempt))>4200:
            groups.append(current)
            current=[paragraph]
        else:
            current=attempt
    if current:groups.append(current)
    scripts=[narrated_text(title if i==0 else "",group) for i,group in enumerate(groups)]
    assert all(0<len(part)<=4500 for part in scripts)
    stripped="".join(re.sub(r"(?m)^\[(?:softly|curious|warmly|whispers)\]\s*\n","",part) for part in scripts)
    assert re.sub(r"\s+","",stripped)==re.sub(r"\s+","",title+"".join(paragraphs))
    return scripts

def player(i,title):
    file=f"chapter-{i:03d}.mp3"
    url=f"../../assets/audio/audiobook/part-01/volume-10/{file}?v=zi-yue-v4"
    return (
      '<section id="zs-audiobook-player" class="zs-audiobook-panel" aria-labelledby="zs-audiobook-title">'
      '<p class="zs-audiobook-kicker">AUDIO EDITION · 第一篇《轮回启幕》</p>'
      f'<h2 id="zs-audiobook-title">🎧 第{i}章 · 子悦中文女声有声版</h2>'
      f'<p class="zs-audiobook-description">《{title.split("　",1)[-1]}》· Zi Yue 子悦 · Eleven v4 · 情绪旁白 · 完整章回</p>'
      f'<audio id="zs-chapter-narration" controls preload="none" aria-label="{title}子悦中文女声朗读">'
      f'<source src="{url}" type="audio/mpeg">您的浏览器暂不支持音频播放，请使用下面的 MP3 下载链接。</audio>'
      '<div class="zs-audiobook-actions"><span>点击后开始朗读 · 不自动播放</span>'
      f'<a href="{url}" download="第零序列_第十卷_第{i}章_子悦_ZiYue_V4.mp3">下载完整 MP3</a></div>'
      '<p id="zs-chapter-narration-status" class="zs-audiobook-status" role="status" aria-live="polite">如正在播放背景音乐，开始朗读时会自动暂停背景音乐。</p></section>'
    )
def patch_page(raw,i,title):
    assert raw.count('<div class="article">')==1
    raw=raw.replace('<link rel="stylesheet" href="../../assets/css/style.css">','<link rel="stylesheet" href="../../assets/css/style.css"><link rel="stylesheet" href="../../assets/css/chapter-audiobook.css?v=1">',1)
    raw=raw.replace('<div class="article">',player(i,title)+'<div class="article">',1)
    raw=raw.replace('</body></html>','<script src="../../assets/js/chapter-audiobook.js?v=2" defer></script></body></html>',1)
    return raw
def git(*args):
    subprocess.run(["git",*args],cwd=ROOT,check=True)
def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--preflight",action="store_true")
    ap.add_argument("--produce",action="store_true")
    args=ap.parse_args()
    assert args.preflight != args.produce
    total=0
    for i in range(1,11):
        _,_,title,paragraphs=source(i)
        parts=segment_text(title,paragraphs)
        total+=sum(len(part) for part in parts)
        print(f"PRECHECK {i}/10: {title}: {len(paragraphs)} paragraphs; {len(parts)} TTS requests; {sum(map(len,parts))} characters",flush=True)
    print(f"10 chapters: ~{total} TTS characters; Zi Yue / Eleven v4; no paid calls during preflight",flush=True)
    if args.preflight:return
    git("config","user.name","github-actions[bot]")
    git("config","user.email","41898282+github-actions[bot]@users.noreply.github.com")
    git("switch","-c",REVIEW)
    git("push","--set-upstream","origin",REVIEW)
    for i in range(1,11):
        page,raw,title,paras=source(i)
        parts=segment_text(title,paras)
        dest=ROOT/f"assets/audio/audiobook/part-01/volume-10/chapter-{i:03d}.mp3"
        assert not dest.exists(),f"Duplicate paid request prevented: {i}"
        generated=[]
        scripts=[]
        for n,part in enumerate(parts,1):
            stem=f"volume_10_chapter_{i:03d}_zi_yue_v4"+(f"_part_{n:02d}" if len(parts)>1 else "")
            script=ROOT/"tts/production"/(stem+".txt")
            script.parent.mkdir(parents=True,exist_ok=True)
            script.write_text(part,encoding="utf-8")
            print(f"GENERATING chapter {i} part {n}/{len(parts)}: {title}",flush=True)
            subprocess.run([sys.executable,str(ROOT/"scripts/elevenlabs_narrate.py"),
               "--input",str(script.relative_to(ROOT)),"--voice-preset",VOICE,"--model","eleven_v4","--profile","expressive"],cwd=ROOT,check=True)
            audio=ROOT/"tts-output"/stem/(stem+".mp3")
            assert audio.is_file(),f"Missing generated audio: {audio}"
            b=audio.read_bytes()
            assert b[:3]==b"ID3" and 700000<len(b)<20000000,f"Bad MP3 {i}/{n}"
            generated.append(audio)
            scripts.append(script)
        dest.parent.mkdir(parents=True,exist_ok=True)
        if len(generated)==1:
            dest.write_bytes(generated[0].read_bytes())
        else:
            playlist=ROOT/"tts-output"/f"volume10_chapter_{i:03d}_concat.txt"
            playlist.write_text("".join("file '"+str(p.resolve())+"'\n" for p in generated),encoding="utf-8")
            subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-y","-f","concat","-safe","0","-i",str(playlist),"-c","copy",str(dest)],cwd=ROOT,check=True)
        result=dest.read_bytes()
        assert result[:3]==b"ID3" and 700000<len(result)<30000000
        page.write_text(patch_page(raw,i,title),encoding="utf-8")
        git("add",*(str(p.relative_to(ROOT)) for p in scripts),str(dest.relative_to(ROOT)),str(page.relative_to(ROOT)))
        git("commit","-m",f"Add complete Zi Yue v4 narration for volume 10 chapter {i}")
        git("push","origin",REVIEW)
        print(f"STAGED chapter {i}/10 ({len(result)} bytes) in review branch",flush=True)
    print("ALL 10 CHAPTERS GENERATED AND STAGED; review before merging",flush=True)
if __name__=="__main__":main()
