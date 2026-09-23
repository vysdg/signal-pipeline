import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";
import { isApiRateLimited } from "@/lib/apiRateLimit";

// Protege o dashboard e os endpoints de leitura/escrita de leads.
// NÃO cobre /api/ingest (proxy do webhook, autenticado por HMAC — ver
// api/src/middleware/verifySignature.ts) nem /login e /api/auth/* (senão
// ninguém conseguiria logar).
export const config = {
  matcher: ["/dashboard/:path*", "/api/leads/:path*", "/api/status"],
};

function clientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export async function middleware(req: NextRequest) {
  const isApiRoute = req.nextUrl.pathname.startsWith("/api/");

  if (isApiRoute && isApiRateLimited(clientIp(req))) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const valid = await verifySessionToken(token);
  if (valid) return NextResponse.next();

  if (isApiRoute) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}
