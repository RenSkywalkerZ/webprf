// app\api\users\cbt-account\route.ts

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Cek apakah user punya registrasi Physics Competition yang approved
    const { data: registration } = await supabaseAdmin
      .from("registrations")
      .select("id, status, competition_id")
      .eq("user_id", session.user.id)
      .eq("status", "approved")
      .single()

    if (!registration) {
      return NextResponse.json({ error: "No approved registration" }, { status: 404 })
    }

    // Ambil data competition untuk memastikan ini Physics Competition
    const { data: competition } = await supabaseAdmin
      .from("competitions")
      .select("title")
      .eq("id", registration.competition_id)
      .single()

    if (competition?.title !== "Physics Competition") {
      return NextResponse.json({ error: "CBT account only for Physics Competition" }, { status: 404 })
    }

    // Ambil akun CBT berdasarkan email
    const { data: cbtAccount, error } = await supabaseAdmin
      .from("cbt_accounts")
      .select("cbt_username, cbt_password, education_level, participant_code")
      .eq("user_email", session.user.email)
      .eq("competition_title", "Physics Competition")
      .single()

    if (error || !cbtAccount) {
      return NextResponse.json({ error: "CBT account not found" }, { status: 404 })
    }

    return NextResponse.json({ cbtAccount })
  } catch (error) {
    console.error("Error fetching CBT account:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}