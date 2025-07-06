import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    // Get all batches
    const { data: batches, error: batchesError } = await supabaseAdmin
      .from("batches")
      .select("*")
      .order("id", { ascending: true })

    if (batchesError) {
      console.error("Database error:", batchesError)
      return NextResponse.json({ error: "Failed to fetch batches" }, { status: 500 })
    }

    // Get current batch ID from system settings
    const { data: setting, error: settingError } = await supabaseAdmin
      .from("system_settings")
      .select("setting_value")
      .eq("setting_key", "current_batch_id")
      .single()

    let currentBatchId = 1 // Default to batch 1
    if (!settingError && setting) {
      currentBatchId = Number.parseInt(setting.setting_value)
    }

    // Check if registration is closed
    const { data: registrationSetting, error: regError } = await supabaseAdmin
      .from("system_settings")
      .select("setting_value")
      .eq("setting_key", "registration_closed")
      .single()

    let registrationClosed = false
    if (!regError && registrationSetting) {
      registrationClosed = registrationSetting.setting_value === "true"
    }

    return NextResponse.json({
      batches,
      currentBatchId,
      registrationClosed,
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
