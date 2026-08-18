import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

const VALID_TEMPS = new Set(["QUENTE", "MORNO", "FRIO"]);

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id || !/^[0-9a-f-]{36}$/.test(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { temperature } = body;
  if (typeof temperature !== "string" || !VALID_TEMPS.has(temperature)) {
    return NextResponse.json(
      { error: "temperature must be QUENTE | MORNO | FRIO" },
      { status: 422 }
    );
  }

  try {
    const r = await pool.query(
      "UPDATE leads SET temperature = $1 WHERE id = $2 RETURNING id, temperature",
      [temperature, id]
    );
    if (r.rowCount === 0) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, lead: r.rows[0] });
  } catch (err) {
    console.error("[api/leads/[id]] update error:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
