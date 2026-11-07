#!/usr/bin/env python3
"""ChatGPT -> GitHub Actions -> ElevenLabs text-to-speech. Uses environment secrets only."""
from __future__ import annotations
import argparse, json, os, re, shutil, subprocess, sys, urllib.error, urllib.request
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
INBOX=ROOT/"tts"/"inbox"
SAMPLES=ROOT/"tts"/"samples"
AUDITIONS=ROOT/"tts"/"auditions"
PRODUCTION=ROOT/"tts"/"production"
MODEL="eleven_multilingual_v2"
ALLOWED_MODELS=(MODEL,"eleven_v4")
# Public candidate from the Chinese ElevenLabs voice catalog; not the old Amy voice.
VOICE_PRESETS={"zi-yue":"5qr5FEpvZGzmVOPBS55W"}
V4_NARRATOR_SETTINGS={"stability":0.53,"similarity_boost":0.78}
CHUNK_LIMIT=1250
CHAPTER_LIMIT=4500
PREVIEW_LIMIT=520

# 单人女声的轻度表演：只改变声学参数，不向正文插入会被朗读的指令。
# Multilingual v2 暂不使用 v3/v4 音频标签。
# Clear, steady narrator. Chinese punctuation carries emotion naturally without abrupt parameter jumps.
NATURAL_SETTINGS={"stability":0.64,"similarity_boost":0.82,"style":0.0,"speed":1.0,"use_speaker_boost":True}
# Optional mild drama for long chapters; all blocks still use the same Voice ID.
SCENE_PRESETS={
    "旁白":{"stability":0.62,"similarity_boost":0.82,"style":0.0,"speed":1.0,"use_speaker_boost":True},
    "战斗":{"stability":0.57,"similarity_boost":0.82,"style":0.0,"speed":1.01,"use_speaker_boost":True},
    "悬疑":{"stability":0.60,"similarity_boost":0.82,"style":0.0,"speed":0.99,"use_speaker_boost":True},
    "悲伤":{"stability":0.64,"similarity_boost":0.82,"style":0.0,"speed":0.98,"use_speaker_boost":True},
    "温柔":{"stability":0.62,"similarity_boost":0.82,"style":0.0,"speed":0.99,"use_speaker_boost":True},
}

EMOTION_LEXICON={
    "战斗":("剑锋","刀锋","挥剑","斩","冲锋","厮杀","爆炸","突袭","击退","格挡","护盾","怪物","魔物","血","危险","战斗","怒吼","大喊","追击","倒下"),
    "悬疑":("不可能","异常","突然","谜","秘密","怀疑","陌生","警告","凝视","沉默","冷汗","恐惧","记忆","回声","黑暗","疑惑"),
    "悲伤":("泪","哭","离别","失去","牺牲","死去","再也","遗憾","悲伤","对不起","最后一刻","最后那一刻"),
    "温柔":("微笑","轻声","温柔","安慰","放心","早点睡","谢谢","握住","拥抱","安心","醒了吗","守护"),
}
def classify_scene(text:str)->str:
    """轻量场景判断；避免给每一句话频繁切换音色。"""
    if not text.strip(): return "旁白"
    scores={kind:sum(text.count(phrase) for phrase in words) for kind,words in EMOTION_LEXICON.items()}
    strongest=max(scores,key=scores.get)
    if scores[strongest]==0: return "旁白"
    if scores["悲伤"]>=2 and scores["悲伤"]>=scores["战斗"]: return "悲伤"
    if scores["战斗"]>=2 and scores["战斗"]>=scores["悬疑"]: return "战斗"
    if scores["温柔"]>=2 and scores["温柔"]>=scores["悬疑"]: return "温柔"
    if scores["悬疑"]>=1: return "悬疑"
    return "旁白"


def split_text(text:str,limit:int=CHUNK_LIMIT)->list[str]:
    text=text.strip().replace("\r\n","\n").replace("\r","\n")
    if not text: return []
    units=re.split(r"(?<=[。！？!?；;])|(?<=\n)",text)
    parts=[]; buf=""
    for unit in units:
        if not unit: continue
        while len(unit)>limit:
            if buf.strip(): parts.append(buf.strip()); buf=""
            cut=limit
            for mark in ("，","、","："," "):
                index=unit.rfind(mark,limit//2,limit)
                if index>=0: cut=index+1; break
            parts.append(unit[:cut].strip());unit=unit[cut:]
        if buf and len(buf)+len(unit)>limit:
            parts.append(buf.strip());buf=""
        buf+=unit
    if buf.strip(): parts.append(buf.strip())
    return [p for p in parts if p]

def api_speak(key:str,voice:str,text:str,scene:str="旁白",profile:str="natural",previous_text:str="",next_text:str="",model:str=MODEL)->bytes:
    url=f"https://api.elevenlabs.io/v1/text-to-speech/{voice}?output_format=mp3_44100_128"
    if model not in ALLOWED_MODELS: raise ValueError("Unsupported ElevenLabs model")
    # v4 supports emotion tags and uses ONLY stability/similarity settings: no speed/style sliders.
    settings=V4_NARRATOR_SETTINGS if model=="eleven_v4" else (
        NATURAL_SETTINGS if profile=="natural" else SCENE_PRESETS.get(scene,SCENE_PRESETS["旁白"]))
    body={"text":text,"model_id":model,"voice_settings":settings,"apply_text_normalization":"auto"}
    if model=="eleven_v4": body["language_code"]="zh"
    # Surrounding story context is not spoken, but helps natural flow between longer blocks.
    if previous_text: body["previous_text"]=previous_text[-160:]
    if next_text: body["next_text"]=next_text[:160]
    payload=json.dumps(body,ensure_ascii=False).encode("utf-8")
    request=urllib.request.Request(url,data=payload,method="POST",headers={"xi-api-key":key,"Content-Type":"application/json","Accept":"audio/mpeg"})
    try:
        with urllib.request.urlopen(request,timeout=150) as response:
            data=response.read()
            if len(data)<300 or not response.headers.get("Content-Type","").startswith("audio/"):
                raise RuntimeError("ElevenLabs did not return valid audio")
            return data
    except urllib.error.HTTPError as error:
        raise RuntimeError(f"ElevenLabs HTTP {error.code}; check voice access, model permission and credits") from None
    except urllib.error.URLError:
        raise RuntimeError("Network failure; no paid request is automatically retried") from None

def input_file(name:str)->Path:
    path=(ROOT/name).resolve()
    if path.suffix.lower()!=".txt" or not (path.is_relative_to(INBOX.resolve()) or path.is_relative_to(SAMPLES.resolve()) or path.is_relative_to(AUDITIONS.resolve()) or path.is_relative_to(PRODUCTION.resolve())):
        raise ValueError("Only .txt in tts/inbox/, tts/samples/, tts/auditions/ or tts/production/ is allowed")
    if not path.is_file(): raise FileNotFoundError("Article text does not exist")
    return path

def run(filename:str,output_root:Path,dry_run:bool,profile:str="expressive",model:str="eleven_v4",voice_preset:str="zi-yue")->None:
    if profile not in ("natural","expressive"): raise ValueError("Unknown voice profile")
    if model not in ALLOWED_MODELS: raise ValueError("Unsupported ElevenLabs model")
    if voice_preset not in ("existing",*VOICE_PRESETS): raise ValueError("Unknown voice preset")
    path=input_file(filename)
    text=path.read_text(encoding="utf-8-sig")
    if not text.strip(): raise ValueError("Empty article")
    is_audition=path.is_relative_to(AUDITIONS.resolve())
    limit=PREVIEW_LIMIT if path.is_relative_to(SAMPLES.resolve()) or is_audition else CHAPTER_LIMIT
    if is_audition and (voice_preset=="existing" or model!="eleven_v4"):
        raise ValueError("New-voice auditions require an explicitly different voice and Eleven v4")
    if len(text)>limit: raise ValueError(f"Text over {limit} characters; stop to protect credits")
    # Eleven v4 accepts up to 10k characters. Keep each published <=4500-character chapter continuous.
    chunks=split_text(text,CHAPTER_LIMIT if model=="eleven_v4" else CHUNK_LIMIT)
    credits=sum(len(part) for part in chunks)
    print(f"File: {path.name}; approx {credits} characters; {len(chunks)} segments; voice = SAME; preset={voice_preset}; model={model}; profile={profile}")
    for i,part in enumerate(chunks,1):
        print(f"   Part {i}: {'自然旁白' if profile=='natural' else classify_scene(part)} ({len(part)} characters)")
    if dry_run:
        print("DRY RUN: 0 requests to ElevenLabs; no credits consumed")
        return
    key=os.environ.get("ELEVENLABS_API_KEY","").strip()
    voice=(os.environ.get("ELEVENLABS_VOICE_ID","").strip() if voice_preset=="existing" else VOICE_PRESETS[voice_preset])
    if not key or not voice:
        raise RuntimeError("Missing GitHub Secret ELEVENLABS_API_KEY or Variable ELEVENLABS_VOICE_ID")
    if not re.fullmatch(r"[A-Za-z0-9_-]{8,120}",voice):
        raise ValueError("Invalid voice ID")
    folder=output_root/path.stem
    folder.mkdir(parents=True,exist_ok=True)
    files=[]
    for idx,chunk in enumerate(chunks,1):
        name=folder/f"part_{idx:03d}.mp3"
        scene="旁白" if profile=="natural" else classify_scene(chunk)
        print(f"Generating {idx}/{len(chunks)}: {len(chunk)} characters, profile={profile}, delivery={scene}",flush=True)
        name.write_bytes(api_speak(key,voice,chunk,scene,profile,
            previous_text=chunks[idx-2] if idx>1 else "",
            next_text=chunks[idx] if idx<len(chunks) else "",model=model))
        files.append(name)
    result=folder/f"{path.stem}.mp3"
    if len(files)==1:
        shutil.copyfile(files[0],result)
    elif shutil.which("ffmpeg"):
        playlist=folder/"_concat.txt"
        playlist.write_text("".join(f"file '{p.name}'\n" for p in files),encoding="utf-8")
        check=subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-y","-f","concat","-safe","0","-i",str(playlist.resolve()),"-c","copy",str(result.resolve())],cwd=folder,capture_output=True,text=True)
        playlist.unlink(missing_ok=True)
        if check.returncode!=0 or not result.is_file():
            print("MP3 merge failed; original parts remain available in the workflow artifact",file=sys.stderr)
    else:
        print("FFmpeg not installed; download segments")
    print("Saved audio as a GitHub Actions artifact:",folder)

if __name__=="__main__":
    cli=argparse.ArgumentParser()
    cli.add_argument("--input",required=True)
    cli.add_argument("--out",default="tts-output")
    cli.add_argument("--dry-run",action="store_true")
    cli.add_argument("--profile",choices=("natural","expressive"),default="expressive")
    cli.add_argument("--model",choices=ALLOWED_MODELS,default="eleven_v4")
    cli.add_argument("--voice-preset",choices=("existing",*VOICE_PRESETS),default="zi-yue")
    args=cli.parse_args()
    try:
        run(args.input,Path(args.out),args.dry_run,args.profile,args.model,args.voice_preset)
    except (OSError,ValueError,RuntimeError) as error:
        print("TTS ERROR:",error,file=sys.stderr)
        sys.exit(1)
