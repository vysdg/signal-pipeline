import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT id, raw_text, source, temperature, pitch,
             contact_name, contact_email, contact_company, created_at
      FROM leads
      ORDER BY created_at DESC
      LIMIT 50
    `);
    return NextResponse.json({ leads: result.rows });
  } catch (err) {
    console.error("[api/leads] erro:", err);
    return NextResponse.json({ error: "Falha ao buscar leads" }, { status: 500 });
  }
}
