#!/usr/bin/env python3
"""Check complete Volume 2 Chapter 1 text, selected voice, and dry-run cost."""
from pathlib import Path
import re, importlib.util, unittest
from unittest import mock
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("tts",ROOT/"scripts/elevenlabs_narrate.py")
tts=importlib.util.module_from_spec(spec);spec.loader.exec_module(tts)
class ChapterTests(unittest.TestCase):
    def test_same_text(self):
        html=(ROOT/"chapters/volume-02/chapter-001.html").read_text(encoding="utf-8")
        section=html.split('<div class="article">',1)[1].split('<div class="pager">',1)[0]
        paragraphs=re.findall(r'<p(?:\s[^>]*)?>(.*?)</p>',section,re.S)
        self.assertEqual(len(paragraphs),116)
        original="第一章　开服倒计时"+"".join(paragraphs)
        production=(ROOT/"tts/production/volume_02_chapter_001_zi_yue_v4.txt").read_text(encoding="utf-8")
        stripped=re.sub(r"(?m)^\[(?:curious|sad|whispers|warmly|softly|playfully)\]\s*\n","",production)
        self.assertEqual(re.sub(r"\s+","",stripped),re.sub(r"\s+","",original))
        self.assertLessEqual(len(production),tts.CHAPTER_LIMIT)
        self.assertEqual(len(tts.split_text(production,tts.CHAPTER_LIMIT)),1)
        self.assertEqual(tts.VOICE_PRESETS["zi-yue"],"5qr5FEpvZGzmVOPBS55W")
    def test_free_dry_run(self):
        with mock.patch.object(tts,"api_speak",side_effect=AssertionError("No paid call during test")):
            tts.run("tts/production/volume_02_chapter_001_zi_yue_v4.txt",ROOT/"_no_output",True,"expressive","eleven_v4","zi-yue")
if __name__=="__main__": unittest.main()
