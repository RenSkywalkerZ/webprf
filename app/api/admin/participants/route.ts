// Path: /api/admin/participants/route.ts

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

    // Kueri yang sudah diperbaiki dengan alias
    const { data: participants, error } = await supabaseAdmin
      .from("registrations")
      .select(`
        id,
        status,
        batch_number,
        registration_date,
        competition_id,
        payment_proof_url,
        is_team_registration,
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
        ),
        team_members (
          id,
          role,
          full_name:name,
          email,
          phone,
          school,
          grade,
          address,
          date_of_birth:birth_date,
          gender,
          identity_type,
          student_id:identity_number
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