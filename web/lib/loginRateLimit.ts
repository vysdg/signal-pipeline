/**
 * Rate limit em memória para o login do dashboard (proteção contra brute
 * force de senha). Simples de propósito: este serviço roda como um único
 * processo Node de longa duração (não serverless/multi-instância), então
 * estado em memória é suficiente — não precisa de Redis pra isso.
 */

const WINDOW_MS = 5 * 60 * 1000; // 5 minutos
const MAX_ATTEMPTS = 5;

const attempts = new Map<string, number[]>();

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const history = (attempts.get(ip) ?? []).filter(t => now - t < WINDOW_MS);
  attempts.set(ip, history);
  return history.length >= MAX_ATTEMPTS;
}

export function recordAttempt(ip: string): void {
  const now = Date.now();
  const history = (attempts.get(ip) ?? []).filter(t => now - t < WINDOW_MS);
  history.push(now);
  attempts.set(ip, history);
}

export function clearAttempts(ip: string): void {
  attempts.delete(ip);
}
