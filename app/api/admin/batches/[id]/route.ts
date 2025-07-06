import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { type NextRequest, NextResponse } from "next/server"

import { supabaseAdmin } from "@/lib/supabase"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, start_date, end_date } = await request.json()
    const batchId = Number.parseInt(params.id)

    if (!name || !start_date || !end_date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data: batch, error } = await supabaseAdmin
      .from("batches")
      .update({
        name,
        start_date,
        end_date,
      })
      .eq("id", batchId)
      .select("*")
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to update batch" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Batch updated successfully",
      batch,
    })
  } catch (error) {
    console.error("Batch update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
