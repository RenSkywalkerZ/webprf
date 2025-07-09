// Salin dan ganti seluruh isi file: api/team-registration/route.ts

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { registrationId, competitionId, teamMembers } = await request.json()

    // --- AWAL PERUBAHAN ---

    // 1. Validasi dasar
    if (!registrationId || !competitionId || !teamMembers) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // 2. Ambil max_team_size dari database
    const { data: competition, error: compError } = await supabaseAdmin
      .from("competitions")
      .select("max_team_size")
      .eq("id", competitionId)
      .single()

    if (compError || !competition) {
      return NextResponse.json({ error: "Competition not found" }, { status: 404 })
    }

    // 3. Validasi ukuran tim secara dinamis
    if (teamMembers.length !== competition.max_team_size) {
      return NextResponse.json({ 
        error: `Invalid team size. Expected ${competition.max_team_size}, but got ${teamMembers.length}` 
      }, { status: 400 })
    }
    
    // --- AKHIR PERUBAHAN ---

    // Verify that the registration belongs to the current user
    const { data: registration, error: regError } = await supabaseAdmin
      .from("registrations")
      .select("*")
      .eq("id", registrationId)
      .eq("user_id", session.user.id)
      .single()

    if (regError || !registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 })
    }

    // Check if team data already exists (prevent duplicate submissions)
    const { data: existingTeamMembers } = await supabaseAdmin
      .from("team_members")
      .select("id")
      .eq("registration_id", registrationId)

    if (existingTeamMembers && existingTeamMembers.length > 0) {
      // Delete existing team members to allow re-submission
      await supabaseAdmin.from("team_members").delete().eq("registration_id", registrationId)
    }

    // Save team members data
    const teamMembersWithRegistrationId = teamMembers.map((member: any, index: number) => ({
      registration_id: registrationId,
      name: member.name,
      email: member.email,
      phone: member.phone,
      school: member.school,
      grade: member.grade,
      identity_type: member.identity_type,
      identity_number: member.identity_number,
      address: member.address,
      birth_date: member.birth_date,
      gender: member.gender,
      role: index === 0 ? "leader" : "member", // First member is the leader
      created_at: new Date().toISOString(),
    }))

    const { error: insertError } = await supabaseAdmin.from("team_members").insert(teamMembersWithRegistrationId)

    if (insertError) {
      console.error("Error inserting team members:", insertError)
      return NextResponse.json({ error: "Failed to save team data" }, { status: 500 })
    }

    // Update registration to mark team data as complete
    const { error: updateError } = await supabaseAdmin
      .from("registrations")
      .update({
        team_data_complete: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", registrationId)

    if (updateError) {
      console.error("Error updating registration:", updateError)
      return NextResponse.json({ error: "Failed to update registration status" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Team registration completed successfully",
    })
  } catch (error) {
    console.error("Team registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}