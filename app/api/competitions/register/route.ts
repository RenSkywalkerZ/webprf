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

    const { competitionId, batchNumber } = await request.json()

    if (!competitionId || !batchNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if the user has any existing active registration (approved or pending and not expired)
    const { data: activeRegistrations, error: activeRegError } = await supabaseAdmin
      .from("registrations")
      .select("id, status, expires_at, competition_id")
      .eq("user_id", session.user.id)
      .in("status", ["pending", "approved"])

    if (activeRegError) {
      console.error("Error checking active registrations:", activeRegError)
      return NextResponse.json({ error: "Failed to check existing registrations" }, { status: 500 })
    }

    const now = new Date()
    const existingActiveRegistration = activeRegistrations.find((reg) => {
      if (reg.status === "approved") return true;
      if (reg.status === "pending" && reg.expires_at) {
        return new Date(reg.expires_at) > now;
      }
      return false;
    });

    if (existingActiveRegistration) {
      // If the existing active registration is for the same competition, handle it as before
      if (existingActiveRegistration.competition_id === competitionId) {
        if (existingActiveRegistration.status === "approved") {
          return NextResponse.json({ error: "Already registered and approved for this competition" }, { status: 400 });
        } else if (existingActiveRegistration.status === "pending") {
          return NextResponse.json(
            {
              error: "Registration already in progress for this competition. Please complete payment or wait for expiration.",
              registration: existingActiveRegistration,
            },
            { status: 400 },
          );
        }
      } else {
        // If there's an active registration for a *different* competition
        return NextResponse.json(
          { error: "You can only register for one competition at a time." },
          { status: 400 },
        );
      }
    }

    // Clean up expired pending registrations for the *current* competition if they exist and have no payment proof
    const { data: expiredPendingRegs } = await supabaseAdmin
      .from("registrations")
      .select("id, expires_at, payment_proof_url")
      .eq("user_id", session.user.id)
      .eq("competition_id", competitionId)
      .eq("status", "pending");

    for (const reg of expiredPendingRegs || []) {
      if (reg.expires_at && new Date(reg.expires_at) <= now && !reg.payment_proof_url) {
        await supabaseAdmin.from("registrations").delete().eq("id", reg.id);
        console.log(`Expired registration ${reg.id} deleted for user ${session.user.id}`);
      }
    }

    // Create new registration with 5-minute expiration
    const expirationTime = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now

    const { data: registration, error } = await supabaseAdmin
      .from("registrations")
      .insert({
        user_id: session.user.id,
        competition_id: competitionId,
        batch_number: batchNumber,
        status: "pending",
        expires_at: expirationTime.toISOString(),
      })
      .select("*")
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to register for competition" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Successfully registered for competition. You have 5 minutes to complete payment.",
      registration,
      expiresAt: expirationTime.toISOString(),
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
