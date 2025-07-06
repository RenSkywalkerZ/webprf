import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { type NextRequest, NextResponse } from "next/server"

import { supabaseAdmin } from "@/lib/supabase"

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { participantIds, status } = await request.json()

    if (!participantIds || !status || !Array.isArray(participantIds)) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("registrations")
      .update({ status })
      .in("id", participantIds)
      .select("*")

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to update status" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Status updated successfully",
      updated: data.length,
    })
  } catch (error) {
    console.error("Status update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
