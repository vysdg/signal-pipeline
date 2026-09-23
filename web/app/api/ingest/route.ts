import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    const secret = process.env.WEBHOOK_SECRET;
    if (!secret) {
      // Fail-closed: sem segredo configurado, não repassamos nada ao webhook.
      console.error("[ingest] WEBHOOK_SECRET não configurado no ambiente do web");
      return NextResponse.json({ error: "Ingest not configured" }, { status: 500 });
    }

    const signature = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

    const response = await fetch("http://signal_api:3000/api/webhook/lead", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Signal-Signature": signature,
      },
      body: rawBody,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err) {
    console.error("[ingest] erro:", err);
    return NextResponse.json({ error: "Falha ao enviar lead" }, { status: 500 });
  }
}
