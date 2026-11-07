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
