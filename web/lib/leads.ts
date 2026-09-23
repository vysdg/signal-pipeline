import { unstable_noStore as noStore } from "next/cache";
import pool from "@/lib/db";
import type { Lead } from "@/app/dashboard/components/LeadTable";

export async function getLeads(): Promise<Lead[]> {
  noStore();
  try {
    const r = await pool.query(`
      SELECT id, raw_text, source, temperature, pitch,
             score, niche, pain_point,
             contact_name, contact_email, contact_company, created_at
      FROM leads ORDER BY created_at DESC LIMIT 100
    `);
    return r.rows;
  } catch { return []; }
}
