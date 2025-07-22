import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  console.log(`[CRON JOB TEST] - Cron job dipicu pada: ${new Date().toISOString()}`);
  // Amankan endpoint ini dengan secret key
  const authorization = request.headers.get('Authorization');
  console.log("--- START CRON JOB DEBUG ---");
  console.log("Received Authorization Header:", authorization);
  console.log("Vercel Environment Secret (first 5 chars):", process.env.CRON_SECRET?.substring(0, 5));
  console.log("---  END CRON JOB DEBUG  ---");
  if (authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date().toISOString();

    // Logika untuk menghapus registrasi kedaluwarsa tanpa bukti bayar
    const { count, error } = await supabaseAdmin
      .from("registrations")
      .delete({ count: 'exact' })
      .eq("status", "pending")
      .is("payment_proof_url", null)
      .lt("expires_at", now);

    if (error) {
      console.error("Cron Job Error: Failed to delete expired registrations", error);
      return NextResponse.json({ error: "Database query failed" }, { status: 500 });
    }

    const cleanedCount = count || 0;
    console.log(`Cron Job: Successfully cleaned up ${cleanedCount} expired registrations.`);
    return NextResponse.json({ success: true, cleaned: cleanedCount });

  } catch (error) {
    console.error("Cron Job Exception:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}