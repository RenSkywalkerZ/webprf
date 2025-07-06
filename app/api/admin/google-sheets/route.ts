import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { NextResponse } from "next/server"

import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { competitionId } = await request.json()

    // Fetch participants for the specific competition
    const { data: participants, error } = await supabaseAdmin
      .from("registrations")
      .select(`
        *,
        users (
          id,
          email,
          full_name,
          phone,
          school,
          grade,
          address,
          birth_date,
          gender
        ),
        competitions (
          id,
          title
        )
      `)
      .eq("competition_id", competitionId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch participants" }, { status: 500 })
    }

    // Format data for Google Sheets
    const formattedData = participants.map((participant, index) => ({
      no: index + 1,
      nama_lengkap: participant.users?.full_name || "",
      email: participant.users?.email || "",
      no_telepon: participant.users?.phone || "",
      sekolah: participant.users?.school || "",
      kelas: participant.users?.grade || "",
      alamat: participant.users?.address || "",
      tanggal_lahir: participant.users?.birth_date
        ? new Date(participant.users.birth_date).toLocaleDateString("id-ID")
        : "",
      jenis_kelamin: participant.users?.gender || "",
      batch: participant.batch_number,
      tanggal_daftar: new Date(participant.registration_date).toLocaleDateString("id-ID"),
      status:
        participant.status === "approved" ? "Disetujui" : participant.status === "pending" ? "Menunggu" : "Ditolak",
      kompetisi: participant.competitions?.title || "",
    }))

    return NextResponse.json({
      success: true,
      data: formattedData,
      competition: participants[0]?.competitions?.title || "Unknown Competition",
    })
  } catch (error) {
    console.error("Google Sheets API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
