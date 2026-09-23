/**
 * Senha do dashboard: por padrão vem de DASHBOARD_PASSWORD (.env), mas pode
 * ser trocada pela tela de Settings — nesse caso passa a ficar armazenada
 * com hash (scrypt, nativo do Node — sem dependência nova) numa linha
 * única em `app_settings` (app é single-tenant, não tem conta por usuário).
 *
 * Login sempre confere a senha trocada (se existir) antes de cair no
 * fallback do .env — ver web/app/api/auth/login/route.ts.
 */
import crypto from "crypto";
import pool from "@/lib/db";

const KEY_LEN = 64;

function scrypt(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, KEY_LEN, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
}

export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt);
  return { hash: derived.toString("hex"), salt };
}

export async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  const derived = await scrypt(password, salt);
  const stored = Buffer.from(hash, "hex");
  if (derived.length !== stored.length) return false;
  return crypto.timingSafeEqual(derived, stored);
}

export async function getStoredPassword(): Promise<{ hash: string; salt: string } | null> {
  try {
    const r = await pool.query(
      "SELECT password_hash, password_salt FROM app_settings WHERE id = 1"
    );
    const row = r.rows[0];
    if (!row?.password_hash || !row?.password_salt) return null;
    return { hash: row.password_hash, salt: row.password_salt };
  } catch (err) {
    console.error("[passwordAuth] erro ao ler app_settings:", err);
    return null;
  }
}

export async function setStoredPassword(newPassword: string): Promise<void> {
  const { hash, salt } = await hashPassword(newPassword);
  await pool.query(
    `INSERT INTO app_settings (id, password_hash, password_salt, updated_at)
     VALUES (1, $1, $2, NOW())
     ON CONFLICT (id) DO UPDATE SET
       password_hash = EXCLUDED.password_hash,
       password_salt = EXCLUDED.password_salt,
       updated_at = NOW()`,
    [hash, salt]
  );
}

/**
 * Confere a senha informada contra a senha trocada no banco (se existir),
 * senão contra DASHBOARD_PASSWORD do .env (comparação timing-safe, igual
 * ao fallback original). Usado tanto no login quanto na troca de senha
 * (pra confirmar a senha atual antes de trocar).
 */
export async function verifyCurrentPassword(provided: string): Promise<boolean> {
  const stored = await getStoredPassword();
  if (stored) {
    return verifyPassword(provided, stored.hash, stored.salt);
  }

  const envPassword = process.env.DASHBOARD_PASSWORD;
  if (!envPassword) return false; // fail-closed

  const expectedBuf = Buffer.from(envPassword, "utf8");
  const providedBuf = Buffer.from(provided, "utf8");
  return (
    expectedBuf.length === providedBuf.length &&
    crypto.timingSafeEqual(expectedBuf, providedBuf)
  );
}
