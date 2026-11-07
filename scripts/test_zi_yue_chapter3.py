#!/usr/bin/env python3
"""Zi Yue published Chapter 003 production: exact source preservation, same voice, dry run without payment."""
from __future__ import annotations
import importlib.util,re,unittest
from pathlib import Path
from unittest import mock
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("tts",ROOT/"scripts"/"elevenlabs_narrate.py")
tts=importlib.util.module_from_spec(spec)
spec.loader.exec_module(tts)
CHAPTER=ROOT/"chapters/volume-01/chapter-003.html"
SCRIPT=ROOT/"tts/production/volume_01_chapter_003_zi_yue_v4.txt"
TAG=re.compile(r"(?m)^\[(?:curious|sad|whispers|warmly|softly|playfully)\]\s*\n")
class Tests(unittest.TestCase):
    def test_full_source_is_unchanged_and_voice_consistent(self):
        html=CHAPTER.read_text(encoding="utf-8")
        section=html.split('<div class="article">',1)[1].split('<div class="pager">',1)[0]
        paragraphs=re.findall(r'<p(?:\s[^>]*)?>(.*?)</p>',section,re.S)
        self.assertEqual(len(paragraphs),58)
        expected="第三章　神魔轮回\n\n"+"\n\n".join(paragraphs)+"\n"
        script=SCRIPT.read_text(encoding="utf-8")
        self.assertEqual(re.sub(r"\s+","",TAG.sub("",script)),re.sub(r"\s+","",expected))
        self.assertGreaterEqual(script.count("[curious]"),3)
        self.assertGreaterEqual(script.count("[whispers]"),3)
        self.assertLessEqual(len(script),tts.CHAPTER_LIMIT)
        self.assertEqual(len(tts.split_text(script,tts.CHAPTER_LIMIT)),1)
        self.assertEqual(tts.VOICE_PRESETS["zi-yue"],"5qr5FEpvZGzmVOPBS55W")
        self.assertEqual(tts.V4_NARRATOR_SETTINGS,{"stability":0.53,"similarity_boost":0.78})
    def test_dry_run_is_free_and_one_chapter_only(self):
        with mock.patch.object(tts,"api_speak",side_effect=AssertionError("No paid API in tests")):
            tts.run("tts/production/volume_01_chapter_003_zi_yue_v4.txt",ROOT/"_no_output",True,"expressive","eleven_v4","zi-yue")
if __name__=="__main__": unittest.main()
