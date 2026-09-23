import { NextRequest, NextResponse } from "next/server";
import { verifyCurrentPassword, setStoredPassword } from "@/lib/passwordAuth";
import { isRateLimited, recordAttempt, clearAttempts } from "@/lib/loginRateLimit";

function clientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

// Rota já protegida por sessão via web/middleware.ts (/api/settings/:path*).
export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde alguns minutos." },
      { status: 429 }
    );
  }

  let body: { currentPassword?: string; newPassword?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { currentPassword, newPassword } = body;
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Preencha a senha atual e a nova senha" }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: "A nova senha precisa ter pelo menos 8 caracteres" }, { status: 422 });
  }

  const validCurrent = await verifyCurrentPassword(currentPassword);
  if (!validCurrent) {
    recordAttempt(ip);
    return NextResponse.json({ error: "Senha atual incorreta" }, { status: 401 });
  }

  clearAttempts(ip);
  try {
    await setStoredPassword(newPassword);
  } catch (err) {
    console.error("[settings/password] erro ao salvar nova senha:", err);
    return NextResponse.json({ error: "Falha ao salvar a nova senha" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
