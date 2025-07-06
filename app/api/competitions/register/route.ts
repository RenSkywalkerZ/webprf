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

    const { competitionId, batchNumber, isTeamRegistration = false } = await request.json()

    if (!competitionId || !batchNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if registration is currently open
    const { data: systemSettings } = await supabaseAdmin
      .from("system_settings")
      .select("value")
      .eq("key", "registration_closed")
      .single()

    if (systemSettings?.value === "true") {
      return NextResponse.json({ error: "Pendaftaran sedang ditutup sementara" }, { status: 400 })
    }

    // Check if user already has an approved registration or pending with payment proof
    const { data: existingRegistrations } = await supabaseAdmin
      .from("registrations")
      .select("id, status, payment_proof_url")
      .eq("user_id", session.user.id)

    const hasApprovedRegistration = existingRegistrations?.some((reg) => reg.status === "approved")
    const hasPendingWithPayment = existingRegistrations?.some(
      (reg) => reg.status === "pending" && reg.payment_proof_url,
    )

    if (hasApprovedRegistration || hasPendingWithPayment) {
      return NextResponse.json(
        {
          error:
            "Anda sudah terdaftar di salah satu kompetisi atau sedang dalam proses verifikasi. Setiap peserta hanya dapat mendaftar satu kompetisi.",
        },
        { status: 400 },
      )
    }

    // Check if user has incomplete registration for the same competition
    const { data: incompleteRegistration } = await supabaseAdmin
      .from("registrations")
      .select("id, expires_at")
      .eq("user_id", session.user.id)
      .eq("competition_id", competitionId)
      .eq("status", "pending")
      .is("payment_proof_url", null)
      .single()

    if (incompleteRegistration) {
      // Check if the existing registration is still valid (not expired)
      const expirationTime = new Date(incompleteRegistration.expires_at)
      const now = new Date()

      if (expirationTime > now) {
        // Return existing registration if still valid
        return NextResponse.json({
          registration: {
            id: incompleteRegistration.id,
          },
          expiresAt: incompleteRegistration.expires_at,
          message: "Continuing existing registration",
        })
      } else {
        // Delete expired registration
        await supabaseAdmin.from("registrations").delete().eq("id", incompleteRegistration.id)
      }
    }

    // Verify competition exists
    const { data: competition, error: competitionError } = await supabaseAdmin
      .from("competitions")
      .select("id, title")
      .eq("id", competitionId)
      .single()

    if (competitionError || !competition) {
      return NextResponse.json({ error: "Competition not found" }, { status: 404 })
    }

    // Verify batch exists
    const { data: batch, error: batchError } = await supabaseAdmin
      .from("batches")
      .select("id, name")
      .eq("id", batchNumber)
      .single()

    if (batchError || !batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 })
    }

    // Create registration with 48-hour expiration
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 48 * 60) // 48 hours

    const registrationData = {
      user_id: session.user.id,
      competition_id: competitionId,
      batch_number: batchNumber,
      status: "pending",
      expires_at: expiresAt.toISOString(),
      is_team_registration: isTeamRegistration,
      team_data_complete: false, // Will be set to true after team data is submitted
      created_at: new Date().toISOString(),
    }

    const { data: registration, error: registrationError } = await supabaseAdmin
      .from("registrations")
      .insert(registrationData)
      .select("id")
      .single()

    if (registrationError) {
      console.error("Registration error:", registrationError)
      return NextResponse.json({ error: "Failed to create registration" }, { status: 500 })
    }

    return NextResponse.json({
      registration: {
        id: registration.id,
      },
      expiresAt: expiresAt.toISOString(),
      isTeamRegistration,
      message: "Registration created successfully",
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
