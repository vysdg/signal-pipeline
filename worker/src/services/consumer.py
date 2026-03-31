import json
import pika
import os
from src.etl.processor import clean_text, generate_embedding
from src.agents.classifier import classify_lead
from src.agents.pitcher import generate_pitch
from src.services.database import save_lead

QUEUE_NAME = "lead.ingest"

def process_message(ch, method, properties, body):
    try:
        payload = json.loads(body)
        contact = payload.get("contact", {})
        print(f"[worker] processing lead from {payload.get('source')}")

        raw_text    = payload["raw_text"]
        cleaned     = clean_text(raw_text)
        embedding   = generate_embedding(cleaned)
        temperature = classify_lead(cleaned)
        pitch       = generate_pitch(cleaned, temperature)

        save_lead(
            raw_text=cleaned,
            source=payload.get("source", "unknown"),
            embedding=embedding,
            temperature=temperature,
            pitch=pitch,
            contact_name=contact.get("name", ""),
            contact_email=contact.get("email", ""),
            contact_company=contact.get("company", ""),
        )

        ch.basic_ack(delivery_tag=method.delivery_tag)
        print(f"[worker] lead processado — temperatura: {temperature}")

    except Exception as e:
        print(f"[worker] erro ao processar mensagem: {e}")
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

def start_consumer():
    params = pika.URLParameters(os.environ["RABBITMQ_URL"])
    connection = pika.BlockingConnection(params)
    channel = connection.channel()
    channel.queue_declare(queue=QUEUE_NAME, durable=True)
    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue=QUEUE_NAME, on_message_callback=process_message)
    print(f"[worker] aguardando mensagens na fila '{QUEUE_NAME}'...")
    channel.start_consuming()
