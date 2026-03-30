import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { connectBroker } from "./services/publisher";
import webhookRouter from "./routes/webhook";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "signal-api" });
});

app.use("/api", webhookRouter);

async function bootstrap() {
  await connectBroker();
  app.listen(PORT, () => {
    console.log(`[api] running on port ${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("[api] fatal startup error:", err);
  process.exit(1);
});