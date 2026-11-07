#!/usr/bin/env python3
"""Verify the prologue recording uses all 85 publicly published paragraphs and the approved Zi Yue voice."""
from __future__ import annotations
import importlib.util,re,unittest
from pathlib import Path
from unittest import mock
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("tts",ROOT/"scripts"/"elevenlabs_narrate.py")
tts=importlib.util.module_from_spec(spec)
spec.loader.exec_module(tts)
CHAPTER=ROOT/"chapters/volume-01/prologue.html"
SCRIPT=ROOT/"tts/production/volume_01_prologue_zi_yue_v4.txt"
TAG=re.compile(r"(?m)^\[(?:curious|sad|whispers|warmly|softly|playfully)\]\s*\n")
class PrologueTests(unittest.TestCase):
    def test_complete_original_text_and_one_voice(self):
        html=CHAPTER.read_text(encoding="utf-8")
        section=html.split('<div class="article">',1)[1].split('<div class="pager">',1)[0]
        paragraphs=re.findall(r'<p(?:\s[^>]*)?>(.*?)</p>',section,re.S)
        self.assertEqual(len(paragraphs),85)
        source="序章　最后的时刻\n\n"+"\n\n".join(paragraphs)+"\n"
        production=SCRIPT.read_text(encoding="utf-8")
        self.assertEqual(re.sub(r"\s+","",TAG.sub("",production)),re.sub(r"\s+","",source))
        self.assertGreaterEqual(production.count("[whispers]"),4)
        self.assertGreaterEqual(production.count("[sad]"),3)
        self.assertLessEqual(len(production),tts.CHAPTER_LIMIT)
        self.assertEqual(len(tts.split_text(production,tts.CHAPTER_LIMIT)),1)
        self.assertEqual(tts.VOICE_PRESETS["zi-yue"],"5qr5FEpvZGzmVOPBS55W")
        self.assertEqual(tts.V4_NARRATOR_SETTINGS,{"stability":0.53,"similarity_boost":0.78})
    def test_free_dry_run(self):
        with mock.patch.object(tts,"api_speak",side_effect=AssertionError("Paid API cannot run during testing")):
            tts.run("tts/production/volume_01_prologue_zi_yue_v4.txt",ROOT/"_no_output",True,"expressive","eleven_v4","zi-yue")
if __name__=="__main__": unittest.main()
