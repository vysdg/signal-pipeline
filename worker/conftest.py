import os

# Os módulos de agentes (classifier.py, pitcher.py) e o processor.py instanciam
# clientes OpenAI no import do módulo. Para rodar os testes unitários sem uma
# chave real (e sem chamar a API de verdade — os testes mockam chain.invoke),
# garantimos uma chave dummy no ambiente antes de qualquer import.
os.environ.setdefault("OPENAI_API_KEY", "sk-test-dummy-key-for-unit-tests")
