import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

const SIGNATURE_HEADER = "x-signal-signature";

/**
 * Valida a assinatura HMAC-SHA256 do payload bruto do webhook.
 *
 * Fail-closed: se WEBHOOK_SECRET não estiver definido no ambiente,
 * TODOS os requests são bloqueados — nunca deixamos passar sem segredo
 * configurado, mesmo em desenvolvimento.
 *
 * Assinatura esperada no header `X-Signal-Signature`:
 *   hex(HMAC-SHA256(rawBody, WEBHOOK_SECRET))
 */
export function verifySignature(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret) {
    console.error("[webhook] WEBHOOK_SECRET não configurado — bloqueando todos os requests (fail-closed)");
    res.status(500).json({ error: "Webhook not configured" });
    return;
  }

  const provided = req.header(SIGNATURE_HEADER);
  if (!provided) {
    res.status(401).json({ error: "Missing signature" });
    return;
  }

  const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
  if (!rawBody) {
    // Nunca deveria acontecer se o middleware de captura do raw body
    // estiver registrado — fail-closed por segurança mesmo assim.
    res.status(500).json({ error: "Unable to verify signature" });
    return;
  }

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

  const expectedBuf = Buffer.from(expected, "utf8");
  const providedBuf = Buffer.from(provided, "utf8");

  const valid =
    expectedBuf.length === providedBuf.length &&
    crypto.timingSafeEqual(expectedBuf, providedBuf);

  if (!valid) {
    res.status(401).json({ error: "Invalid signature" });
    return;
  }

  next();
}
