from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

prompt = ChatPromptTemplate.from_messages([
    ("system", """Você é um especialista em vendas B2B.
Analise o texto de interação com o lead e classifique a temperatura:
- QUENTE: demonstra urgência, budget confirmado, pedindo proposta
- MORNO: interesse claro mas sem urgência, pedindo mais informações
- FRIO: apenas curiosidade, sem dor clara, sem budget mencionado

Responda APENAS com uma palavra: QUENTE, MORNO ou FRIO."""),
    ("user", "{text}")
])

chain = prompt | llm

def classify_lead(text: str) -> str:
    result = chain.invoke({"text": text})
    temperature = result.content.strip().upper()
    if temperature not in ["QUENTE", "MORNO", "FRIO"]:
        return "FRIO"
    return temperature