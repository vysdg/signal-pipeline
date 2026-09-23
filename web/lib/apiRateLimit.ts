/**
 * Rate limit em memória para as rotas de API do dashboard (/api/leads,
 * /api/status) — hoje protegidas por sessão, mas sem limite de requests.
 * Mesmo racional do loginRateLimit.ts: processo Node único de longa
 * duração, não serverless, então estado em memória é suficiente.
 */

const WINDOW_MS = 60 * 1000; // 1 minuto
const MAX_REQUESTS = 120; // generoso o bastante pro AutoRefresh (30s) + uso normal

const hits = new Map<string, number[]>();

export function isApiRateLimited(key: string): boolean {
  const now = Date.now();
  const history = (hits.get(key) ?? []).filter(t => now - t < WINDOW_MS);
  history.push(now);
  hits.set(key, history);
  return history.length > MAX_REQUESTS;
}
