import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  const t0 = Date.now();
  try {
    const r = await pool.query(`
      SELECT
        COUNT(*)                                                                        AS total,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24h')                   AS today,
        COUNT(*) FILTER (WHERE temperature = 'QUENTE' AND created_at > NOW() - INTERVAL '24h') AS hot_today,
        COUNT(*) FILTER (WHERE temperature = 'MORNO'  AND created_at > NOW() - INTERVAL '24h') AS warm_today,
        COUNT(*) FILTER (WHERE temperature = 'FRIO'   AND created_at > NOW() - INTERVAL '24h') AS cold_today,
        COUNT(*) FILTER (WHERE pitch IS NOT NULL AND pitch != '')                       AS with_pitch,
        ROUND(AVG(score)::numeric, 1)                                                  AS avg_score,
        MAX(created_at)                                                                AS last_at
      FROM leads
    `);
    const dbMs = Date.now() - t0;
    const row  = r.rows[0];

    return NextResponse.json({
      ok: true,
      db: { status: "ok", latencyMs: dbMs },
      leads: {
        total:     Number(row.total),
        today:     Number(row.today),
        hotToday:  Number(row.hot_today),
        warmToday: Number(row.warm_today),
        coldToday: Number(row.cold_today),
        withPitch: Number(row.with_pitch),
        avgScore:  Number(row.avg_score) || 0,
        lastAt:    row.last_at,
      },
    });
  } catch (err) {
    return NextResponse.json({ ok: false, db: { status: "error", error: String(err) } }, { status: 503 });
  }
}
