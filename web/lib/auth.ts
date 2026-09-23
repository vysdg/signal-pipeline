/**
 * Sessão do dashboard via cookie assinado (HMAC-SHA256, Web Crypto API —
 * funciona tanto no runtime Node quanto no Edge do middleware, sem
 * depender do módulo `crypto` do Node).
 *
 * Fail-closed: sem AUTH_SECRET no ambiente, nenhuma sessão é validada.
 */

const encoder = new TextEncoder();
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12h
export const SESSION_COOKIE = "signal_session";

async function hmacHex(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSessionToken(): Promise<string> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET não configurado");
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = String(exp);
  const sig = await hmacHex(secret, payload);
  return `${payload}.${sig}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  const secret = process.env.AUTH_SECRET;
  if (!secret || !token) return false; // fail-closed

  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;

  const expected = await hmacHex(secret, payload);
  if (!timingSafeEqualStr(expected, sig)) return false;

  const exp = Number(payload);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return false;

  return true;
}

export const SESSION_MAX_AGE = SESSION_TTL_SECONDS;
