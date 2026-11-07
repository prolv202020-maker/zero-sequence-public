#!/usr/bin/env python3
"""ChatGPT -> GitHub Actions -> ElevenLabs text-to-speech. Uses environment secrets only."""
from __future__ import annotations
import argparse, json, os, re, shutil, subprocess, sys, urllib.error, urllib.request
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
INBOX=ROOT/"tts"/"inbox"
MODEL="eleven_multilingual_v2"
CHUNK_LIMIT=1450
CHAPTER_LIMIT=4500

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

def api_speak(key:str,voice:str,text:str)->bytes:
    url=f"https://api.elevenlabs.io/v1/text-to-speech/{voice}?output_format=mp3_44100_128"
    payload=json.dumps({"text":text,"model_id":MODEL,"voice_settings":{"stability":0.55,"similarity_boost":0.75,"style":0.0}},ensure_ascii=False).encode("utf-8")
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
    if not path.is_relative_to(INBOX.resolve()) or path.suffix.lower()!=".txt":
        raise ValueError("Only .txt in tts/inbox/ is allowed")
    if not path.is_file(): raise FileNotFoundError("Article text does not exist")
    return path

def run(filename:str,output_root:Path,dry_run:bool)->None:
    path=input_file(filename)
    text=path.read_text(encoding="utf-8-sig")
    if not text.strip(): raise ValueError("Empty article")
    if len(text)>CHAPTER_LIMIT: raise ValueError(f"Chapter over {CHAPTER_LIMIT} characters; stop to protect credits")
    chunks=split_text(text)
    credits=sum(len(part) for part in chunks)
    print(f"Chapter: {path.name}; approx {credits} credits; {len(chunks)} segments")
    if dry_run:
        print("DRY RUN: 0 requests to ElevenLabs; no credits consumed")
        return
    key=os.environ.get("ELEVENLABS_API_KEY","").strip()
    voice=os.environ.get("ELEVENLABS_VOICE_ID","").strip()
    if not key or not voice:
        raise RuntimeError("Missing GitHub Secret ELEVENLABS_API_KEY or Variable ELEVENLABS_VOICE_ID")
    if not re.fullmatch(r"[A-Za-z0-9_-]{8,120}",voice):
        raise ValueError("Invalid voice ID")
    folder=output_root/path.stem
    folder.mkdir(parents=True,exist_ok=True)
    files=[]
    for idx,chunk in enumerate(chunks,1):
        name=folder/f"part_{idx:03d}.mp3"
        print(f"Generating {idx}/{len(chunks)}: {len(chunk)} characters",flush=True)
        name.write_bytes(api_speak(key,voice,chunk))
        files.append(name)
    result=folder/f"{path.stem}.mp3"
    if len(files)==1:
        shutil.copyfile(files[0],result)
    elif shutil.which("ffmpeg"):
        playlist=folder/"_concat.txt"
        playlist.write_text("".join(f"file '{p.name}'\n" for p in files),encoding="utf-8")
        check=subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-y","-f","concat","-safe","0","-i",str(playlist),"-c","copy",str(result)],cwd=folder,capture_output=True,text=True)
        playlist.unlink(missing_ok=True)
        if check.returncode!=0: print("MP3 merge failed; segments remain saved")
    else:
        print("FFmpeg not installed; download segments")
    print("Saved audio as a GitHub Actions artifact:",folder)

if __name__=="__main__":
    cli=argparse.ArgumentParser()
    cli.add_argument("--input",required=True)
    cli.add_argument("--out",default="tts-output")
    cli.add_argument("--dry-run",action="store_true")
    args=cli.parse_args()
    try:
        run(args.input,Path(args.out),args.dry_run)
    except (OSError,ValueError,RuntimeError) as error:
        print("TTS ERROR:",error,file=sys.stderr)
        sys.exit(1)
