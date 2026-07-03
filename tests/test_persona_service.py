import json
import unittest
from pathlib import Path
from unittest.mock import patch

from persona_service import DeepSeekPersona, PersonaKnowledge, sanitize_history


ROOT = Path(__file__).resolve().parents[1]


class _FakeResponse:
    def __init__(self, payload):
        self.payload = payload

    def __enter__(self):
        return self

    def __exit__(self, *_):
        return False

    def read(self):
        return json.dumps(self.payload).encode("utf-8")


class PersonaServiceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.knowledge = PersonaKnowledge(
            ROOT / "knowledgebase" / "knowledge.json",
            ROOT / "knowledgebase" / "resume.json",
        )

    def test_retrieval_selects_matching_resume_section(self):
        context = self.knowledge.context_for("What did Joseph do at NCS?")
        self.assertIn('"company":"NCS Group"', context)
        self.assertNotIn('"company":"Globe Telecom"', context)

    def test_retrieval_filters_template_placeholders(self):
        context = self.knowledge.context_for("What is his education?")
        self.assertIn("Technological Institute of the Philippines", context)
        self.assertNotIn("[Your", context)

    def test_history_keeps_most_recent_content_within_budget(self):
        history = [
            {"role": "user", "content": str(index) * 1500}
            for index in range(6)
        ]
        cleaned = sanitize_history(history)
        self.assertLessEqual(sum(len(item["content"]) for item in cleaned), 4000)
        self.assertTrue(cleaned[-1]["content"].startswith("5"))

    @patch("persona_service.request.urlopen")
    def test_deepseek_payload_uses_flash_and_non_thinking_mode(self, urlopen):
        urlopen.return_value = _FakeResponse({
            "choices": [{"message": {"content": "I build BI solutions."}}]
        })
        persona = DeepSeekPersona(self.knowledge, api_key="test-key")

        answer = persona.answer("What do you do?")

        self.assertEqual(answer, "I build BI solutions.")
        payload = json.loads(urlopen.call_args.args[0].data.decode("utf-8"))
        self.assertEqual(payload["model"], "deepseek-v4-flash")
        self.assertEqual(payload["thinking"], {"type": "disabled"})
        self.assertLessEqual(payload["max_tokens"], 500)


if __name__ == "__main__":
    unittest.main()
