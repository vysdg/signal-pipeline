import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth";
import { verifyCurrentPassword } from "@/lib/passwordAuth";
import { isRateLimited, recordAttempt, clearAttempts } from "@/lib/loginRateLimit";

function clientIp(req: NextRequest): string {
  // Sem reverse proxy configurado hoje — usa o IP direto da conexão.
  // Se um proxy for adicionado na frente, isto precisa ler X-Forwarded-For
  // de uma fonte confiável (ver achado "trust proxy" da auditoria).
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export async function POST(req: NextRequest) {
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
  // Confere primeiro contra a senha trocada no banco (Settings); sem uma
  // senha trocada, cai no fallback de DASHBOARD_PASSWORD do .env.
  // Fail-closed: sem nenhuma das duas configuradas, nunca autentica —
  // ver verifyCurrentPassword em lib/passwordAuth.ts.
  const valid = await verifyCurrentPassword(provided);

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
