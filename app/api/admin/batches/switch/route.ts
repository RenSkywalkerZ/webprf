import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { type NextRequest, NextResponse } from "next/server"

import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { batchId } = await request.json()

    if (!batchId) {
      return NextResponse.json({ error: "Batch ID is required" }, { status: 400 })
    }

    console.log("🔄 Admin switching to batch:", batchId)

    // Update current batch in system settings
    const { error: updateError } = await supabaseAdmin.from("system_settings").upsert(
      {
        setting_key: "current_batch_id",
        setting_value: batchId.toString(),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "setting_key",
      },
    )

    if (updateError) {
      console.error("❌ Database error updating current batch:", updateError)
      return NextResponse.json({ error: "Failed to switch batch" }, { status: 500 })
    }

    // Get the batch details
    const { data: batch, error: batchError } = await supabaseAdmin
      .from("batches")
      .select("*")
      .eq("id", batchId)
      .single()

    if (batchError) {
      console.error("❌ Database error fetching batch:", batchError)
      return NextResponse.json({ error: "Failed to fetch batch details" }, { status: 500 })
    }

    console.log("✅ Batch switched successfully:", batch)

    return NextResponse.json({
      message: "Batch switched successfully",
      batch,
      currentBatchId: batchId,
    })
  } catch (error) {
    console.error("💥 Batch switch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
