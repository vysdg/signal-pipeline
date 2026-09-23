import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { connectBroker } from "./services/publisher";
import webhookRouter from "./routes/webhook";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(helmet());
// Esta API só é chamada server-to-server (CRM externo assinando com HMAC,
// ou o proxy interno em web/app/api/ingest) — nenhum browser bate aqui
// direto. Por padrão (ALLOWED_ORIGINS ausente) libera nenhuma origem de
// browser; defina ALLOWED_ORIGINS (lista separada por vírgula) só se um
// cliente browser precisar chamar esta API diretamente no futuro.
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",").map(o => o.trim()).filter(Boolean) ?? [];
app.use(cors({ origin: allowedOrigins }));
app.use(
  express.json({
    limit: "1mb",
    // Guarda o corpo bruto para validação de assinatura HMAC no webhook.
    verify: (req, _res, buf) => {
      (req as express.Request & { rawBody?: Buffer }).rawBody = buf;
    },
  })
);

const ingestLimiter = rateLimit({
  windowMs: 60_000,
  max: 60,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Rate limit exceeded. Max 60 requests per minute." },
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "signal-api" });
});

app.use("/api", ingestLimiter, webhookRouter);

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