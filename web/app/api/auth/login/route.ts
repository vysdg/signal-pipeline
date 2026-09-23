import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth";
import { isRateLimited, recordAttempt, clearAttempts } from "@/lib/loginRateLimit";

function clientIp(req: NextRequest): string {
  // Sem reverse proxy configurado hoje — usa o IP direto da conexão.
  // Se um proxy for adicionado na frente, isto precisa ler X-Forwarded-For
  // de uma fonte confiável (ver achado "trust proxy" da auditoria).
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export async function POST(req: NextRequest) {
  const password = process.env.DASHBOARD_PASSWORD;
  if (!password) {
    // Fail-closed: sem senha configurada, ninguém entra.
    console.error("[auth] DASHBOARD_PASSWORD não configurado — bloqueando login (fail-closed)");
    return NextResponse.json({ error: "Login not configured" }, { status: 500 });
  }

  const ip = clientIp(req);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde alguns minutos." },
      { status: 429 }
    );
  }

  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const provided = body.password ?? "";
  const expectedBuf = Buffer.from(password, "utf8");
  const providedBuf = Buffer.from(provided, "utf8");
  const valid =
    expectedBuf.length === providedBuf.length &&
    crypto.timingSafeEqual(expectedBuf, providedBuf);

  if (!valid) {
    recordAttempt(ip);
    return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
  }

  clearAttempts(ip);
  const token = await createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
