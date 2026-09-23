import amqplib from "amqplib";

const QUEUE_NAME = "lead.ingest";
// Dead-letter: mensagens que o worker nack (requeue:false) — erro na
// classificação, embedding, banco fora do ar, etc — vão pra cá em vez de
// serem descartadas pra sempre. Sem isso não há como inspecionar/
// reprocessar um lead que falhou no processamento.
const DLX_NAME = "lead.ingest.dlx";
const DLQ_NAME = "lead.ingest.dlq";

let channel: amqplib.Channel;

export async function connectBroker(): Promise<void> {
  const connection = await amqplib.connect(process.env.RABBITMQ_URL!);
  channel = await connection.createChannel();

  await channel.assertExchange(DLX_NAME, "fanout", { durable: true });
  await channel.assertQueue(DLQ_NAME, { durable: true });
  await channel.bindQueue(DLQ_NAME, DLX_NAME, "");

  await channel.assertQueue(QUEUE_NAME, {
    durable: true,
    arguments: { "x-dead-letter-exchange": DLX_NAME },
  });

  console.log(`[broker] connected — queue: ${QUEUE_NAME} (dlq: ${DLQ_NAME})`);
}

export async function publishLead(payload: object): Promise<void> {
  const message = Buffer.from(JSON.stringify(payload));
  const result = channel.sendToQueue(QUEUE_NAME, message, { persistent: true });
  console.log(`[broker] publish result: ${result} — payload: ${JSON.stringify(payload).slice(0, 80)}`);
}
