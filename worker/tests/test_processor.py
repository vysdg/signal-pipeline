from src.etl.processor import clean_text, chunk_text


def test_clean_text_collapses_whitespace_and_newlines():
    raw = "Olá   mundo\n\ncomo   vai?"
    assert clean_text(raw) == "Olá mundo como vai?"


def test_clean_text_removes_disallowed_characters():
    raw = "Contato: user@email.com (urgente!!)"
    assert clean_text(raw) == "Contato user@email.com urgente!!"


def test_clean_text_keeps_allowed_punctuation():
    raw = "Preço final: 12.500,00 - fechamos hoje?"
    cleaned = clean_text(raw)
    # ':' é removido, o resto (letras, dígitos, . , - ?) é preservado
    assert ":" not in cleaned
    assert "12.500,00" in cleaned
    assert cleaned.endswith("fechamos hoje?")


def test_clean_text_strips_leading_and_trailing_whitespace():
    assert clean_text("   oi   ") == "oi"


def test_chunk_text_splits_on_sentence_boundaries_when_over_limit():
    text = "Frase um. Frase dois. Frase tres."
    chunks = chunk_text(text, max_chars=15)
    assert chunks == ["Frase um.", "Frase dois.", "Frase tres."]


def test_chunk_text_merges_short_sentences_into_one_chunk():
    text = "Frase um. Frase dois. Frase tres."
    chunks = chunk_text(text, max_chars=1000)
    assert len(chunks) == 1
    assert "Frase um." in chunks[0]
    assert "Frase dois." in chunks[0]
    assert "Frase tres." in chunks[0]


def test_chunk_text_empty_string_returns_single_empty_chunk():
    # re.split em string vazia produz [''], então o chunk resultante é
    # uma string vazia após o strip — não uma lista vazia.
    assert chunk_text("", max_chars=100) == [""]
