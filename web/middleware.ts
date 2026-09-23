import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";

// Protege o dashboard e os endpoints de leitura/escrita de leads.
// NÃO cobre /api/ingest (proxy do webhook, autenticado por HMAC — ver
// api/src/middleware/verifySignature.ts) nem /login e /api/auth/* (senão
// ninguém conseguiria logar).
export const config = {
  matcher: ["/dashboard/:path*", "/api/leads/:path*", "/api/status"],
};

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const valid = await verifySessionToken(token);
  if (valid) return NextResponse.next();

  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}
