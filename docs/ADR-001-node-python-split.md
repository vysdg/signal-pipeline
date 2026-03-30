# ADR-001 — Separação Node.js (API) e Python (Worker)

**Status:** Aceito  
**Data:** 2026-03-30

## Contexto

O sistema precisa receber webhooks de CRMs com alta frequência e, para cada evento,
executar um pipeline pesado de IA (ETL, embeddings, LLM). Executar tudo na mesma
thread/processo causaria timeouts no webhook e desperdício de recursos.

## Decisão

Separar em dois microsserviços com responsabilidades distintas:

- **API (Node.js):** responsável exclusivamente por receber, validar e enfileirar.
  Responde em < 50ms independente da carga de IA.
- **Worker (Python):** responsável pelo processamento pesado. Consome a fila de
  forma assíncrona, com controle de concorrência via `prefetch_count`.

A comunicação entre os dois é feita via RabbitMQ com fila durável,
garantindo que nenhuma mensagem seja perdida em caso de falha do worker.

## Alternativas consideradas

| Alternativa | Motivo para rejeitar |
|-------------|---------------------|
| Tudo em Node.js | Ecossistema de IA/ML inferior; LangChain tem suporte limitado |
| Tudo em Python (FastAPI) | FastAPI é excelente mas Node.js tem melhor performance em I/O puro para webhooks de alta frequência |
| Comunicação REST entre serviços | Acoplamento síncrono; se o worker estiver lento, a API fica lenta |

## Consequências

**Positivo:**
- Escalabilidade independente: worker pode ter N réplicas sem afetar a API
- Falhas no processamento de IA não derrubam o webhook
- Cada serviço usa a linguagem mais adequada para sua responsabilidade

**Negativo:**
- Maior complexidade operacional (dois runtimes, dois Dockerfiles)
- Observabilidade distribuída requer instrumentação adicional (planejada)
