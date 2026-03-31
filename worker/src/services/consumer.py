import json
import pika
import os
import sys
import traceback

print("[consumer] carregando módulo...", flush=True)

QUEUE_NAME = "lead.ingest"

def process_message(ch, method, properties, body):
    print("[worker] mensagem recebida!", flush=True)
    try:
        payload = json.loads(body)

        from src.etl.processor import clean_text, generate_embedding
        raw_text = payload["raw_text"]
        cleaned = clean_text(raw_text)
        embedding = generate_embedding(cleaned)
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
            contact_name=payload.get("contact", {}).get("name", ""),
            contact_email=payload.get("contact", {}).get("email", ""),
            contact_company=payload.get("contact", {}).get("company", ""),
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
    channel.queue_declare(queue=QUEUE_NAME, durable=True)
    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue=QUEUE_NAME, on_message_callback=process_message)
    print(f"[worker] aguardando mensagens na fila '{QUEUE_NAME}'...", flush=True)
    channel.start_consuming()
