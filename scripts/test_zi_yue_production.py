#!/usr/bin/env python3
"""Prepaid voice production: preserve published Chinese text and a single consistent Eleven v4 voice."""
from __future__ import annotations
import importlib.util,re,unittest
from pathlib import Path
from unittest import mock
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("zs_tts",ROOT/"scripts"/"elevenlabs_narrate.py")
tts=importlib.util.module_from_spec(spec)
spec.loader.exec_module(tts)
ORIGINAL=ROOT/"tts/inbox/volume_01_chapter_001.txt"
NEW=ROOT/"tts/production/volume_01_chapter_001_zi_yue_v4.txt"
TAG=re.compile(r"(?m)^\[(?:curious|sad|whispers|warmly|softly)\]\s*\n")
class Check(unittest.TestCase):
    def test_exact_story_and_title_preserved(self):
        raw=ORIGINAL.read_text(encoding="utf-8")
        dressed=NEW.read_text(encoding="utf-8")
        self.assertGreater(len(dressed),1950)
        self.assertLess(len(dressed),4500)
        self.assertGreaterEqual(dressed.count("[curious]"),2)
        self.assertGreaterEqual(dressed.count("[sad]"),1)
        self.assertGreaterEqual(dressed.count("[whispers]"),2)
        only_story=TAG.sub("",dressed)
        self.assertEqual(re.sub(r"\s+","",only_story),re.sub(r"\s+","",raw))
        self.assertTrue(raw.strip().endswith("——【零】。"))
    def test_approved_voice_and_single_full_chapter_request(self):
        self.assertEqual(tts.VOICE_PRESETS["zi-yue"],"5qr5FEpvZGzmVOPBS55W")
        self.assertEqual(tts.V4_NARRATOR_SETTINGS,{"stability":0.53,"similarity_boost":0.78})
        draft=NEW.read_text(encoding="utf-8")
        self.assertEqual(len(tts.split_text(draft,tts.CHAPTER_LIMIT)),1)
        self.assertEqual(tts.input_file("tts/production/volume_01_chapter_001_zi_yue_v4.txt"),NEW)
    def test_free_dry_run(self):
        with mock.patch.object(tts,"api_speak",side_effect=AssertionError("Called paid TTS API")):
            tts.run("tts/production/volume_01_chapter_001_zi_yue_v4.txt",ROOT/"_no_output",True)
if __name__=="__main__":
    unittest.main()
