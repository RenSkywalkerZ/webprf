// app/api/team-members/[registrationId]/route.ts

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(
  request: NextRequest,
  // TERIMA SELURUH OBJEK KONTEKS DI SINI
  context: { params: { registrationId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // AKSES PARAMS MELALUI OBJEK KONTEKS
    const { registrationId } = context.params

    if (!registrationId) {
      return NextResponse.json({ error: "Registration ID is required" }, { status: 400 })
    }

    // Verify that the registration belongs to the current user
    const { data: registration, error: regError } = await supabaseAdmin
      .from("registrations")
      .select("user_id, is_team_registration")
      .eq("id", registrationId)
      .single()

    if (regError || !registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 })
    }

    if (registration.user_id !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    if (!registration.is_team_registration) {
      return NextResponse.json({ error: "This is not a team registration" }, { status: 400 })
    }

    // Fetch team members
    const { data: teamMembers, error: teamError } = await supabaseAdmin
      .from("team_members")
      .select("*")
      .eq("registration_id", registrationId)
      .order("role", { ascending: false }) // leader first, then members
      .order("created_at", { ascending: true })

    if (teamError) {
      console.error("Error fetching team members:", teamError)
      return NextResponse.json({ error: "Failed to fetch team members" }, { status: 500 })
    }

    return NextResponse.json({
      teamMembers: teamMembers || [],
    })
  } catch (error) {
    console.error("Team members fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}