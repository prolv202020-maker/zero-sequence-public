#!/usr/bin/env python3
"""Confirm Zi Yue chapter 002 preserves every published word, uses one voice, and has safe dry-run."""
from __future__ import annotations
import importlib.util,re,unittest
from pathlib import Path
from unittest import mock
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("tts",ROOT/"scripts"/"elevenlabs_narrate.py")
tts=importlib.util.module_from_spec(spec)
spec.loader.exec_module(tts)
CHAPTER=ROOT/"chapters/volume-01/chapter-002.html"
SCRIPT=ROOT/"tts/production/volume_01_chapter_002_zi_yue_v4.txt"
TAG=re.compile(r"(?m)^\[(?:curious|sad|whispers|warmly|softly)\]\s*\n")
class Tests(unittest.TestCase):
    def test_exact_original_text_and_one_request(self):
        html=CHAPTER.read_text(encoding="utf-8")
        self.assertIn('<div class="article">',html)
        excerpt=html.split('<div class="article">',1)[1].split('<div class="pager">',1)[0]
        paragraphs=re.findall(r'<p(?:\s[^>]*)?>(.*?)</p>',excerpt,re.S)
        self.assertEqual(len(paragraphs),45)
        expected="第二章　熟悉的日期"+"\n\n"+"\n\n".join(paragraphs)+"\n"
        annotated=SCRIPT.read_text(encoding="utf-8")
        text=TAG.sub("",annotated)
        self.assertEqual(re.sub(r"\s+","",text),re.sub(r"\s+","",expected))
        self.assertLess(len(annotated),4500)
        self.assertGreaterEqual(annotated.count("[curious]"),2)
        self.assertGreaterEqual(annotated.count("[whispers]"),2)
        self.assertEqual(len(tts.split_text(annotated,tts.CHAPTER_LIMIT)),1)
        self.assertEqual(tts.VOICE_PRESETS["zi-yue"],"5qr5FEpvZGzmVOPBS55W")
        self.assertEqual(tts.V4_NARRATOR_SETTINGS,{"stability":0.53,"similarity_boost":0.78})
    def test_dry_run_has_no_paid_requests(self):
        with mock.patch.object(tts,"api_speak",side_effect=AssertionError("Charged API call")):
            tts.run("tts/production/volume_01_chapter_002_zi_yue_v4.txt",ROOT/"_no_output",True,"expressive","eleven_v4","zi-yue")
if __name__=="__main__":unittest.main()
