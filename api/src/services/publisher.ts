import amqplib from "amqplib";

const QUEUE_NAME = "lead.ingest";
let channel: amqplib.Channel;

export async function connectBroker(): Promise<void> {
  const connection = await amqplib.connect(process.env.RABBITMQ_URL!);
  channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME, { durable: true });
  console.log(`[broker] connected — queue: ${QUEUE_NAME}`);
}

export async function publishLead(payload: object): Promise<void> {
  const message = Buffer.from(JSON.stringify(payload));
  channel.sendToQueue(QUEUE_NAME, message, { persistent: true });
}