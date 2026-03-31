import json
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

prompt = ChatPromptTemplate.from_messages([
    ("system", """Você é um especialista em vendas B2B.
Analise o texto de interação com o lead e retorne um JSON com exatamente estas chaves:

{{
  "temperature": "QUENTE" | "MORNO" | "FRIO",
  "score": <número de 0 a 100>,
  "niche": "<nicho do negócio em 2-3 palavras>",
  "pain_point": "<principal dor identificada em 1 frase curta>"
}}

Critérios de temperatura:
- QUENTE (score 70-100): urgência clara, budget mencionado, pedindo proposta
- MORNO (score 35-69): interesse real mas sem urgência, pedindo mais info
- FRIO (score 0-34): curiosidade, sem dor clara, sem budget

Responda APENAS com o JSON, sem texto adicional."""),
    ("user", "{text}")
])

chain = prompt | llm

def classify_lead(text: str) -> dict:
    result = chain.invoke({"text": text})
    try:
        data = json.loads(result.content.strip())
        temperature = data.get("temperature", "FRIO").upper()
        if temperature not in ["QUENTE", "MORNO", "FRIO"]:
            temperature = "FRIO"
        return {
            "temperature": temperature,
            "score": max(0, min(100, int(data.get("score", 0)))),
            "niche": data.get("niche", ""),
            "pain_point": data.get("pain_point", ""),
        }
    except Exception:
        return {"temperature": "FRIO", "score": 0, "niche": "", "pain_point": ""}
