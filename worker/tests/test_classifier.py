from unittest.mock import MagicMock

import src.agents.classifier as classifier_module
from src.agents.classifier import classify_lead


class _FakeChain:
    """Substitui o RunnableSequence (LangChain) inteiro nos testes.

    `chain` é um objeto Pydantic (RunnableSequence) que rejeita setattr de
    atributos fora de seus campos declarados, então não dá para fazer
    monkeypatch em `chain.invoke` diretamente — trocamos o `chain` do
    módulo por este dublê simples.
    """

    def __init__(self, content: str) -> None:
        self._content = content

    def invoke(self, payload: dict) -> MagicMock:
        result = MagicMock()
        result.content = self._content
        return result


def _mock_invoke(monkeypatch, content: str) -> None:
    monkeypatch.setattr(classifier_module, "chain", _FakeChain(content))


def test_classify_lead_parses_valid_json(monkeypatch):
    _mock_invoke(
        monkeypatch,
        '{"temperature": "quente", "score": 85, "niche": "SaaS B2B", '
        '"pain_point": "sem tempo para qualificar leads"}',
    )

    result = classify_lead("Preciso fechar isso ainda esse mes, temos orcamento aprovado.")

    assert result == {
        "temperature": "QUENTE",
        "score": 85,
        "niche": "SaaS B2B",
        "pain_point": "sem tempo para qualificar leads",
    }


def test_classify_lead_clamps_score_above_100(monkeypatch):
    _mock_invoke(monkeypatch, '{"temperature": "QUENTE", "score": 150}')

    result = classify_lead("texto qualquer")

    assert result["score"] == 100


def test_classify_lead_clamps_score_below_0(monkeypatch):
    _mock_invoke(monkeypatch, '{"temperature": "FRIO", "score": -20}')

    result = classify_lead("texto qualquer")

    assert result["score"] == 0


def test_classify_lead_defaults_unknown_temperature_to_frio(monkeypatch):
    _mock_invoke(monkeypatch, '{"temperature": "MORNO_PLUS", "score": 50}')

    result = classify_lead("texto qualquer")

    assert result["temperature"] == "FRIO"


def test_classify_lead_falls_back_safely_on_malformed_json(monkeypatch):
    _mock_invoke(monkeypatch, "isso claramente não é um JSON válido")

    result = classify_lead("texto qualquer")

    assert result == {"temperature": "FRIO", "score": 0, "niche": "", "pain_point": ""}


def test_classify_lead_fills_missing_optional_fields(monkeypatch):
    _mock_invoke(monkeypatch, '{"temperature": "MORNO", "score": 40}')

    result = classify_lead("texto qualquer")

    assert result["niche"] == ""
    assert result["pain_point"] == ""
