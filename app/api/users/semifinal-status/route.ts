// /app/api/users/semifinal-status/route.ts
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      // Jika tidak ada user yang login, kirim error
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Cek ke tabel semifinal_participants
    const { data, error } = await supabaseAdmin
      .from("semifinal_participants")
      .select("competition_id")
      .eq("user_id", session.user.id)

    if (error) throw error

    // Ambil hanya daftar ID kompetisinya saja
    const semifinalCompetitions = data?.map(item => item.competition_id) || []

    // Kirim kembali daftar kompetisi dimana user adalah semifinalis
    return NextResponse.json({ semifinalCompetitions })
  } catch (err) {
    console.error("Error fetching semifinal status:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}