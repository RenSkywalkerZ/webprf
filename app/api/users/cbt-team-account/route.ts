// app\api\users\cbt-team-account\route.ts

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const competitionId = searchParams.get("competitionId")

    if (!competitionId) {
      return NextResponse.json({ error: "Competition ID is required" }, { status: 400 })
    }

    // 1. Cari pendaftaran LCC yang relevan milik pengguna yang sedang login
    const { data: registration, error: regError } = await supabaseAdmin
      .from("registrations")
      .select("id") // Hanya butuh ID pendaftarannya
      .eq("user_id", session.user.id)
      .eq("competition_id", competitionId)
      .eq("status", "approved")
      .single()
    
    if (regError || !registration) {
      return NextResponse.json({ error: "No approved LCC registration found" }, { status: 404 })
    }

    // 2. Gunakan registration.id untuk mengambil SEMUA akun tim dari tabel BARU
    const { data: teamAccounts, error: cbtError } = await supabaseAdmin
      .from("cbt_team_accounts")
      .select("team_member_name, cbt_username, cbt_password")
      .eq("registration_id", registration.id)

    if (cbtError || !teamAccounts || teamAccounts.length === 0) {
      return NextResponse.json({ error: "CBT team accounts not found for this registration" }, { status: 404 })
    }

    // Kembalikan array dari akun-akun tim
    return NextResponse.json({ teamAccounts })

  } catch (error) {
    console.error("Error fetching LCC team accounts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
