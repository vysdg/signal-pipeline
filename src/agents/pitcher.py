from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)

prompt = ChatPromptTemplate.from_messages([
    ("system", """Você é um especialista em vendas consultivas B2B.
Com base na interação do lead e sua temperatura ({temperature}), 
escreva um e-mail de follow-up personalizado em português.
O e-mail deve:
- Ter no máximo 150 palavras
- Endereçar a principal objeção ou dúvida identificada
- Ter um CTA claro e específico
- Soar humano, não como template
Responda apenas com o corpo do e-mail, sem assunto."""),
    ("user", "Interação do lead:\n{text}")
])

chain = prompt | llm

def generate_pitch(text: str, temperature: str) -> str:
    result = chain.invoke({"text": text, "temperature": temperature})
    return result.content.strip()