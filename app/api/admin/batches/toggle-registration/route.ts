import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Toggle registration API called")

    // Get current registration status
    const { data: currentSetting, error: fetchError } = await supabase
      .from("system_settings")
      .select("setting_value")
      .eq("setting_key", "registration_closed")
      .single()

    if (fetchError) {
      console.error("❌ Error fetching current setting:", fetchError)
      return NextResponse.json({ error: "Failed to fetch current setting" }, { status: 500 })
    }

    const currentStatus = currentSetting?.setting_value === "true"
    const newStatus = !currentStatus

    console.log("📊 Current registration status:", { currentStatus, newStatus })

    // Update the registration status using UPSERT
    const { error: updateError } = await supabase.from("system_settings").upsert(
      {
        setting_key: "registration_closed",
        setting_value: newStatus.toString(),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "setting_key",
      },
    )

    if (updateError) {
      console.error("❌ Error updating registration status:", updateError)
      return NextResponse.json({ error: "Failed to update registration status" }, { status: 500 })
    }

    const message = newStatus
      ? "Pendaftaran berhasil ditutup untuk rekapitulasi data"
      : "Pendaftaran berhasil dibuka kembali"

    console.log("✅ Registration status updated:", { newStatus, message })

    return NextResponse.json({
      success: true,
      registrationClosed: newStatus,
      message,
    })
  } catch (error) {
    console.error("💥 Unexpected error in toggle registration:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
