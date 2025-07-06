// /api/batches/current/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    // Step 1: Fetch MULTIPLE settings at once.
    const { data: settings, error: settingError } = await supabaseAdmin
      .from("system_settings")
      .select("setting_key, setting_value")
      .in("setting_key", ["current_batch_id", "registration_closed"]); // Get both keys

    if (settingError || !settings || settings.length === 0) {
      console.error("Failed to find settings:", settingError);
      return NextResponse.json({ batch: null, registrationClosed: true });
    }

    // Find the specific settings from the results
    const currentBatchIdSetting = settings.find(s => s.setting_key === 'current_batch_id');
    const registrationClosedSetting = settings.find(s => s.setting_key === 'registration_closed');
    
    // Check for the global kill switch value
    const isGloballyClosed = registrationClosedSetting?.setting_value === 'true';

    if (!currentBatchIdSetting) {
        return NextResponse.json({ batch: null, registrationClosed: isGloballyClosed });
    }

    // Step 2: Use the ID to get the full details for that specific batch.
    const { data: batch, error: batchError } = await supabaseAdmin
      .from("batches")
      .select("*")
      .eq("id", currentBatchIdSetting.setting_value)
      .single();

    if (batchError || !batch) {
      return NextResponse.json({ error: "Failed to fetch current batch details" }, { status: 500 });
    }
    
    // Step 3: Check if the registration period has ended based on date.
    const now = new Date();
    const endDate = new Date(batch.end_date);
    const isPastEndDate = now > endDate;

    // Step 4: Combine the global kill switch AND the date check.
    // If registration is closed globally OR it's past the end date, then it's closed.
    const finalRegistrationStatus = isGloballyClosed || isPastEndDate;

    // Step 5: Return the batch data along with the FINAL registration status.
    return NextResponse.json({ batch, registrationClosed: finalRegistrationStatus });

  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}