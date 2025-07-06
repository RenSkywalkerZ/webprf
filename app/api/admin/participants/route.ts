import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { NextResponse } from "next/server"

import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: participants, error } = await supabaseAdmin
      .from("registrations")
      .select(`
        id,
        status,
        batch_number,
        registration_date,
        competition_id,
        payment_proof_url,
        users (
          id,
          email,
          full_name,
          phone,
          school,
          grade,
          address,
          date_of_birth,
          gender
        ),
        competitions (
          id,
          title
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database error fetching participants:", error.message)
      return NextResponse.json({ error: "Failed to fetch participants", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ participants })
  } catch (error) {
    console.error("Admin error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
