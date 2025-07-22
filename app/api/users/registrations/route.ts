import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

// Helper map untuk membuat tampilan jenjang lebih baik
const EDUCATION_LEVEL_MAP: { [key: string]: string } = {
  sd: "SD/Sederajat",
  smp: "SMP",
  sma: "SMA",
  universitas: "Perguruan Tinggi/Universitas",
  umum: "Umum",
};

// Helper untuk mengubah grade (Contoh: "Kelas 10 (SMA)") menjadi jenjang (Contoh: "sma")
const mapGradeToEducationLevel = (grade: string): string => {
  const gradeLower = grade.toLowerCase();
  if (gradeLower.includes("sd")) return "sd";
  if (gradeLower.includes("smp")) return "smp";
  if (gradeLower.includes("sma") || gradeLower.includes("smk")) return "sma";
  if (gradeLower.includes("univ") || gradeLower.includes("mahasiswa")) return "universitas";
  return "umum";
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // // First, clean up expired registrations without payment proof
    // const now = new Date().toISOString()

    // const { data: expiredRegistrations } = await supabaseAdmin
    //   .from("registrations")
    //   .select("id, expires_at, payment_proof_url")
    //   .eq("user_id", session.user.id)
    //   .eq("status", "pending")
    //   .lt("expires_at", now)

    // if (expiredRegistrations && expiredRegistrations.length > 0) {
    //   const expiredIds = expiredRegistrations
    //     .filter((reg) => !reg.payment_proof_url) // Only delete if no payment proof
    //     .map((reg) => reg.id)

    //   if (expiredIds.length > 0) {
    //     await supabaseAdmin.from("registrations").delete().in("id", expiredIds)

    //     console.log(`Cleaned up ${expiredIds.length} expired registrations for user ${session.user.id}`)
    //   }
    // }

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
        payment_submitted_at,
        is_team_registration, 
        team_data_complete,
        user_id
      `) // <-- TAMBAHKAN DUA FIELD INI
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

          const enrichedRegistrations = await Promise.all(
      validRegistrations.map(async (reg) => {
        let displayCategory = "N/A";

        if (reg.is_team_registration) {
          // Untuk Lomba Tim: Ambil grade ketua tim
          const { data: leader } = await supabaseAdmin
            .from("team_members")
            .select("grade")
            .eq("registration_id", reg.id)
            .eq("role", "leader")
            .single();
            
          if (leader?.grade) {
            const level = mapGradeToEducationLevel(leader.grade);
            displayCategory = EDUCATION_LEVEL_MAP[level] || leader.grade;
          }
        } else {
          // Untuk Lomba Individu: Ambil education_level pengguna
          const { data: user } = await supabaseAdmin
            .from("users")
            .select("education_level")
            .eq("id", reg.user_id)
            .single();

          if (user?.education_level) {
            displayCategory = EDUCATION_LEVEL_MAP[user.education_level] || user.education_level;
          }
        }
        
        // Kembalikan data registrasi asli + field baru
        return { ...reg, displayCategory };
      })
    );

    return NextResponse.json({
      registrations: enrichedRegistrations,
    })
  } catch (error) {
    console.error("Error fetching registrations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }


  
}