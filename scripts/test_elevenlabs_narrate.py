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
        self.assertEqual(len(tts.split_text(text)),1)

    def test_new_pacing_presets(self):
        self.assertEqual(tts.CHUNK_LIMIT,1250)
        self.assertEqual(tts.NATURAL_SETTINGS["speed"],1.0)
        self.assertTrue(tts.NATURAL_SETTINGS["use_speaker_boost"])
        self.assertTrue(all(0.98<=x["speed"]<=1.01 for x in tts.SCENE_PRESETS.values()))
        self.assertGreaterEqual(tts.NATURAL_SETTINGS["stability"],0.60)

    def test_api_previous_next_context(self):
        import json
        class FakeAudio:
            headers={"Content-Type":"audio/mpeg"}
            def __enter__(self): return self
            def __exit__(self,*args): return False
            def read(self): return b"x"*420
        with mock.patch.object(tts.urllib.request,"urlopen",return_value=FakeAudio()) as send:
            audio=tts.api_speak("dummy-key","1234567890abcdef","你好，这里是测试。","战斗","natural","之前的文字","之后的文字")
        self.assertEqual(len(audio),420)
        body=json.loads(send.call_args.args[0].data)
        self.assertEqual(body["voice_settings"],tts.NATURAL_SETTINGS)
        self.assertEqual(body["previous_text"],"之前的文字")
        self.assertEqual(body["next_text"],"之后的文字")

    def test_v4_chinese_emotive_settings_and_voice_distinct(self):
        import json
        self.assertIn("eleven_v4",tts.ALLOWED_MODELS)
        self.assertEqual(tts.VOICE_PRESETS["zi-yue"],"5qr5FEpvZGzmVOPBS55W")
        self.assertNotEqual(tts.VOICE_PRESETS["zi-yue"],"bhJUNIXWQQ94l8eI2VUf")
        class FakeAudio:
            headers={"Content-Type":"audio/mpeg"}
            def __enter__(self): return self
            def __exit__(self,*args): return False
            def read(self): return b"x"*420
        with mock.patch.object(tts.urllib.request,"urlopen",return_value=FakeAudio()) as send:
            audio=tts.api_speak("dummy-key",tts.VOICE_PRESETS["zi-yue"],
                "[sad] 顾长渊想起了苏紫璃。","悲伤","expressive",model="eleven_v4")
        self.assertEqual(len(audio),420)
        body=json.loads(send.call_args.args[0].data)
        self.assertEqual(body["model_id"],"eleven_v4")
        self.assertEqual(body["language_code"],"zh")
        self.assertEqual(body["voice_settings"],tts.V4_NARRATOR_SETTINGS)
        self.assertNotIn("speed",body["voice_settings"])
        self.assertNotIn("style",body["voice_settings"])
        self.assertIn("[sad]",body["text"])

    def test_v4_short_audition_is_single_request_and_dry_run_safe(self):
        file="tts/auditions/zi_yue_v4_part01_ch001.txt"
        sample=tts.input_file(file)
        content=sample.read_text(encoding="utf-8")
        self.assertGreater(len(content),300)
        self.assertLessEqual(len(content),tts.PREVIEW_LIMIT)
        self.assertEqual(len(tts.split_text(content)),1)
        self.assertTrue(all(x in content for x in ("[curious]","[sad]","[whispers]")))
        with tempfile.TemporaryDirectory() as temp:
            with mock.patch.object(tts,"api_speak",side_effect=AssertionError("API called during dry run")):
                tts.run(file,Path(temp),True,"expressive","eleven_v4","zi-yue")
        with tempfile.TemporaryDirectory() as temp:
            with self.assertRaises(ValueError):
                tts.run(file,Path(temp),True,"natural",tts.MODEL,"existing")

    def test_long_chapter_mp3_merge_paths_are_absolute(self):
        from types import SimpleNamespace
        with tempfile.TemporaryDirectory() as temp:
            article=tts.INBOX/"__mp3_concat_test__.txt"
            article.write_text("这是完整第一章配音的分段测试。"*140,encoding="utf-8")
            output=Path(temp)/"audio"
            commands=[]
            def fake_ffmpeg(cmd,**kwargs):
                commands.append(cmd)
                source=Path(cmd[cmd.index("-i")+1])
                target=Path(cmd[-1])
                self.assertTrue(source.is_absolute(),"ffmpeg list path must be absolute with cwd=folder")
                self.assertTrue(target.is_absolute(),"ffmpeg output path must be absolute with cwd=folder")
                self.assertTrue(source.is_file())
                target.write_bytes(b"test-mp3")
                return SimpleNamespace(returncode=0)
            try:
                with mock.patch.dict(tts.os.environ,{"ELEVENLABS_API_KEY":"dummy","ELEVENLABS_VOICE_ID":"1234567890abcdefgh"}):
                    with mock.patch.object(tts,"api_speak",return_value=b"x"*600):
                        with mock.patch.object(tts.shutil,"which",return_value="/usr/bin/ffmpeg"):
                            with mock.patch.object(tts.subprocess,"run",side_effect=fake_ffmpeg):
                                tts.run("tts/inbox/__mp3_concat_test__.txt",output,False,"natural",tts.MODEL,"existing")
                self.assertEqual(len(commands),1)
                self.assertTrue((output/"__mp3_concat_test__"/"__mp3_concat_test__.mp3").is_file())
            finally:
                article.unlink(missing_ok=True)

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
