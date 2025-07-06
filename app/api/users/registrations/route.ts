import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { type NextRequest, NextResponse } from "next/server"

import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // First, clean up expired registrations without payment proof
    const now = new Date().toISOString()

    const { data: expiredRegistrations } = await supabaseAdmin
      .from("registrations")
      .select("id, expires_at, payment_proof_url")
      .eq("user_id", session.user.id)
      .eq("status", "pending")
      .lt("expires_at", now)

    if (expiredRegistrations && expiredRegistrations.length > 0) {
      const expiredIds = expiredRegistrations
        .filter((reg) => !reg.payment_proof_url) // Only delete if no payment proof
        .map((reg) => reg.id)

      if (expiredIds.length > 0) {
        await supabaseAdmin.from("registrations").delete().in("id", expiredIds)

        console.log(`Cleaned up ${expiredIds.length} expired registrations for user ${session.user.id}`)
      }
    }

    // Now fetch current valid registrations
    const { data: registrations, error } = await supabaseAdmin
      .from("registrations")
      .select(`
        id,
        competition_id,
        status,
        created_at,
        batch_number,
        expires_at,
        payment_proof_url,
        payment_submitted_at
      `)
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 })
    }

    // Filter out any remaining expired pending registrations without payment proof
    const validRegistrations =
      registrations?.filter((reg) => {
        if (reg.status === "pending" && reg.expires_at && !reg.payment_proof_url) {
          const expirationTime = new Date(reg.expires_at)
          const currentTime = new Date()
          return expirationTime > currentTime
        }
        return true
      }) || []

    return NextResponse.json({
      registrations: validRegistrations,
    })
  } catch (error) {
    console.error("Error fetching registrations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
