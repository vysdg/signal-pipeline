import type { NextConfig } from "next";

// A API (Express) já tem helmet; o dashboard (Next.js) é a superfície mais
// exposta de verdade (porta que um browser abre) e não tinha nenhum header
// de segurança. CSP aqui usa 'unsafe-inline' pra script/style porque o
// Next.js App Router embute o payload de hidratação inline — uma CSP
// baseada em nonce é uma melhoria futura, não implementada agora pra não
// arriscar quebrar o build sem uma bateria de teste maior.
//
// 'unsafe-eval' entra só em desenvolvimento: React usa eval() em dev pra
// reconstruir stack traces (Fast Refresh / DevTools) — a própria mensagem
// de erro do React confirma que isso nunca acontece em produção.
const isDev = process.env.NODE_ENV !== "production";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
