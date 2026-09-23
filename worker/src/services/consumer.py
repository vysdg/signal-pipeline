import json
import pika
import os
import sys
import traceback

print("[consumer] carregando módulo...", flush=True)

QUEUE_NAME = "lead.ingest"
# Dead-letter: mensagens que este worker nack (requeue=False) — erro na
# classificação, embedding, banco fora do ar, etc — vão pra cá em vez de
# serem descartadas pra sempre. Precisa bater exatamente com os argumentos
# declarados em api/src/services/publisher.ts (RabbitMQ rejeita redeclarar
# uma fila já existente com argumentos diferentes).
DLX_NAME = "lead.ingest.dlx"
DLQ_NAME = "lead.ingest.dlq"

def process_message(ch, method, properties, body):
    print("[worker] mensagem recebida!", flush=True)
    try:
        payload = json.loads(body)

        from src.etl.processor import clean_text, chunk_text, generate_embedding
        raw_text = payload["raw_text"]
        cleaned = clean_text(raw_text)
        # raw_text aceita até 50.000 caracteres (schema Zod da API), mas
        # text-embedding-3-small tem limite de ~8191 tokens de entrada.
        # Sem chunk_text aqui, um lead grande estourava o limite, a
        # chamada à OpenAI falhava, e a mensagem era perdida (nack sem
        # requeue). Embeda só o primeiro chunk — é o início da interação,
        # a parte mais relevante pra similaridade semântica.
        chunks = chunk_text(cleaned)
        embedding = generate_embedding(chunks[0] if chunks else cleaned)
        print(f"[worker] embedding gerado, len: {len(embedding)}", flush=True)

        from src.agents.classifier import classify_lead
        result = classify_lead(cleaned)
        print(f"[worker] classificação: {result}", flush=True)

        # suporta dict ou string
        if isinstance(result, dict):
            temperature = result.get("temperature", "FRIO")
            score       = result.get("score", 0)
            niche       = result.get("niche", "")
            pain_point  = result.get("pain_point", "")
        else:
            temperature = str(result)
            score, niche, pain_point = 0, "", ""

        from src.agents.pitcher import generate_pitch
        pitch = generate_pitch(cleaned, temperature)
        print(f"[worker] pitch gerado — temperatura: {temperature}", flush=True)

        contact_name    = payload.get("contact", {}).get("name", "")
        contact_email   = payload.get("contact", {}).get("email", "")
        contact_company = payload.get("contact", {}).get("company", "")

        from src.services.database import save_lead
        save_lead(
            raw_text=cleaned,
            source=payload.get("source", "unknown"),
            embedding=embedding,
            temperature=temperature,
            pitch=pitch,
            score=score,
            niche=niche,
            pain_point=pain_point,
            contact_name=contact_name,
            contact_email=contact_email,
            contact_company=contact_company,
        )

        if temperature == "QUENTE":
            from src.services.notifier import notify_hot_lead
            notify_hot_lead(
                contact_name=contact_name,
                contact_company=contact_company,
                score=score,
                pain_point=pain_point,
                niche=niche,
            )

        ch.basic_ack(delivery_tag=method.delivery_tag)
        print(f"[worker] lead processado com sucesso!", flush=True)

    except Exception as e:
        print(f"[worker] ERRO: {e}", flush=True)
        traceback.print_exc()
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

def start_consumer():
    print(f"[consumer] conectando: {os.environ.get('RABBITMQ_URL', 'NÃO DEFINIDO')}", flush=True)
    params = pika.URLParameters(os.environ["RABBITMQ_URL"])
    params.socket_timeout = 10
    connection = pika.BlockingConnection(params)
    channel = connection.channel()

    channel.exchange_declare(exchange=DLX_NAME, exchange_type="fanout", durable=True)
    channel.queue_declare(queue=DLQ_NAME, durable=True)
    channel.queue_bind(queue=DLQ_NAME, exchange=DLX_NAME)

    channel.queue_declare(
        queue=QUEUE_NAME,
        durable=True,
        arguments={"x-dead-letter-exchange": DLX_NAME},
    )
    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue=QUEUE_NAME, on_message_callback=process_message)
    print(f"[worker] aguardando mensagens na fila '{QUEUE_NAME}'...", flush=True)
    channel.start_consuming()
