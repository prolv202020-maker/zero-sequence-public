import importlib.util
import tempfile
import unittest
from pathlib import Path
from unittest import mock

SRC=Path(__file__).with_name("elevenlabs_narrate.py")
spec=importlib.util.spec_from_file_location("tts",SRC)
tts=importlib.util.module_from_spec(spec)
spec.loader.exec_module(tts)

class Tests(unittest.TestCase):
    def test_long_text(self):
        source="这是测试，"*850
        chunks=tts.split_text(source,1450)
        self.assertTrue(len(chunks)>=2)
        self.assertTrue(all(len(c)<=1450 for c in chunks))
        self.assertEqual("".join(chunks),source)

    def test_restrict_file(self):
        for path in ("README.md","tts/inbox/../../README.md"):
            with self.assertRaises(ValueError): tts.input_file(path)

    def test_narration_scene_presets(self):
        self.assertEqual(tts.classify_scene("这是普通叙述。"), "旁白")
        self.assertEqual(tts.classify_scene("他挥剑格挡，随后斩向怪物，爆炸声响起。"), "战斗")
        self.assertEqual(tts.classify_scene("黑暗中的秘密让他怀疑，不可能突然发生。"), "悬疑")
        self.assertEqual(tts.classify_scene("她痛哭流泪，无法忘记那次离别和失去。"), "悲伤")
        self.assertEqual(tts.classify_scene("她轻声安慰，微笑着说：早点睡，放心。"), "温柔")
        self.assertEqual(set(tts.SCENE_PRESETS), {"旁白","战斗","悬疑","悲伤","温柔"})
        self.assertTrue(all(0.7<=x["speed"]<=1.2 for x in tts.SCENE_PRESETS.values()))

    def test_sample_path_and_cap(self):
        sample=tts.input_file("tts/samples/volume_01_chapter_001_audition.txt")
        self.assertTrue(sample.is_file())
        text=sample.read_text(encoding="utf-8-sig")
        self.assertLessEqual(len(text),tts.PREVIEW_LIMIT)
        self.assertGreater(len(tts.split_text(text,125)),1)

    def test_no_request_in_dry_run(self):
        with tempfile.TemporaryDirectory() as temp:
            file=tts.INBOX/"__narration_test__.txt"
            file.parent.mkdir(parents=True,exist_ok=True)
            file.write_text("顾长渊走进晨星镇。",encoding="utf-8")
            try:
                with mock.patch.object(tts,"api_speak",side_effect=AssertionError("API called")):
                    tts.run("tts/inbox/__narration_test__.txt",Path(temp),True)
            finally: file.unlink(missing_ok=True)

if __name__=="__main__": unittest.main()
