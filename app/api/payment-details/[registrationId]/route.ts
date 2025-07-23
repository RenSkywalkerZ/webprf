// File: app/api/payment-details/[registrationId]/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Helper function untuk memetakan 'grade' dari team_members ke 'education_level' standar.
 * Anda bisa menyesuaikan ini sesuai dengan data 'grade' di form Anda.
 */
// Definisikan konstanta opsi kelas agar bisa digunakan untuk pemetaan
const ALL_CLASS_OPTIONS = [
  { value: "Kelas 1 (SD)", label: "Kelas 1 (SD/Sederajat)", level: "sd" },
  { value: "Kelas 2 (SD)", label: "Kelas 2 (SD/Sederajat)", level: "sd" },
  { value: "Kelas 3 (SD)", label: "Kelas 3 (SD/Sederajat)", level: "sd" },
  { value: "Kelas 4 (SD)", label: "Kelas 4 (SD/Sederajat)", level: "sd" },
  { value: "Kelas 5 (SD)", label: "Kelas 5 (SD/Sederajat)", level: "sd" },
  { value: "Kelas 6 (SD)", label: "Kelas 6 (SD/Sederajat)", level: "sd" },
  { value: "Kelas 7 (SMP)", label: "Kelas 7 (SMP/Sederajat)", level: "smp" },
  { value: "Kelas 8 (SMP)", label: "Kelas 8 (SMP/Sederajat)", level: "smp" },
  { value: "Kelas 9 (SMP)", label: "Kelas 9 (SMP/Sederajat)", level: "smp" },
  { value: "Kelas 10 (SMA)", label: "Kelas 10 (SMA/Sederajat)", level: "sma" },
  { value: "Kelas 11 (SMA)", label: "Kelas 11 (SMA/Sederajat)", level: "sma" },
  { value: "Kelas 12 (SMA)", label: "Kelas 12 (SMA/Sederajat)", level: "sma" },
  { value: "Mahasiswa", label: "Mahasiswa (Universitas/PT)", level: "universitas" },
  { value: "Umum", label: "Umum/Lainnya", level: "umum" },
];

/**
 * Helper function untuk memetakan 'grade' dari team_members ke 'education_level' standar.
 * @param {string} grade - Nilai dari properti 'grade', contoh: "Kelas 7 (SMP)".
 * @returns {string | null} Mengembalikan level standar (cth: "smp") atau null jika tidak ditemukan.
 */
const mapGradeToEducationLevel = (grade: string): string | null => {
  const option = ALL_CLASS_OPTIONS.find(opt => opt.value === grade);
  return option ? option.level : null;
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ registrationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await the params before destructuring
    const { registrationId } = await params;
    if (!registrationId) {
      return NextResponse.json({ error: "Registration ID is required" }, { status: 400 });
    }

    // 1. Ambil data registrasi utama
    const { data: registration, error: regError } = await supabaseAdmin
      .from("registrations")
      .select("*")
      .eq("id", registrationId)
      .eq("user_id", session.user.id) // Pastikan user hanya bisa akses registrasinya sendiri
      .single();

    if (regError || !registration) {
      console.error("Registration fetch error:", regError);
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    let determinedEducationLevel = "";
    let teamMembersData: any[] = [];
    let displayCategory = "";

    const EDUCATION_LEVEL_MAP: { [key: string]: string } = {
        sd: "SD/Sederajat",
        smp: "SMP/Sederajat",
        sma: "SMA/Sederajat",
        universitas: "Mahasiswa (Universitas/PT)",
        umum: "Umum",
    };

    // 2. Tentukan jenjang pendidikan berdasarkan jenis registrasi
    if (registration.is_team_registration) {
      // --- Logika untuk Lomba Tim ---
      const { data: teamMembers, error: teamError } = await supabaseAdmin
        .from("team_members")
        .select("name, email, school, grade, role, id")
        .eq("registration_id", registrationId);

      if (teamError || !teamMembers || teamMembers.length === 0) {
        return NextResponse.json({ error: "Team members not found for this registration" }, { status: 404 });
      }

      // Aturan: Gunakan jenjang pendidikan dari Ketua Tim (role = 'leader')
      // Jika tidak ada leader, gunakan anggota pertama sebagai fallback
      const leader = teamMembers.find(m => m.role.toLowerCase() === 'ketua tim') || teamMembers[0];
      const mappedLevel = mapGradeToEducationLevel(leader.grade);
      if (!mappedLevel) {
          console.error(`Invalid grade value found for registration ${registrationId}: "${leader.grade}"`);
          return NextResponse.json(
              { error: `Kategori pendidikan tidak valid untuk kelas "${leader.grade}". Silakan hubungi admin.` },
              { status: 400 }
          );
      }
      determinedEducationLevel = mappedLevel
      teamMembersData = teamMembers; // Simpan data tim untuk dikirim ke frontend
      displayCategory = EDUCATION_LEVEL_MAP[determinedEducationLevel] || "Tim";

    } else {
      // --- Logika untuk Lomba Individu ---
      const { data: user, error: userError } = await supabaseAdmin
        .from("users")
        .select("education_level")
        .eq("id", registration.user_id)
        .single();
        
      if (userError || !user || !user.education_level) {
        return NextResponse.json({ error: "User education level not found" }, { status: 404 });
      }
      determinedEducationLevel = user.education_level;
      displayCategory = EDUCATION_LEVEL_MAP[determinedEducationLevel] || "Individu";
    }

    // 3. Ambil harga yang sesuai dari competition_pricing
    const { data: pricing, error: priceError } = await supabaseAdmin
      .from("competition_pricing")
      .select("price")
      .eq("competition_id", registration.competition_id)
      .eq("batch_id", registration.batch_number)
      .eq("education_level", determinedEducationLevel)
      .single();

    if (priceError || !pricing) {
      console.error("Pricing Error:", { priceError, details: {
          competition_id: registration.competition_id,
          batch_id: registration.batch_number,
          education_level: determinedEducationLevel
      }});
      return NextResponse.json({ error: `Price not found for this category (${displayCategory}) and batch. Please contact admin.` }, { status: 404 });
    }

    // 4. Ambil detail tambahan (nama kompetisi, dll)
    const { data: competitionDetails } = await supabaseAdmin
        .from("competitions")
        .select("title")
        .eq("id", registration.competition_id)
        .single();


    // 5. Kembalikan semua data dalam satu paket
    const responsePayload = {
      registration,
      competitionTitle: competitionDetails?.title || "Nama Lomba Tidak Ditemukan",
      price: pricing.price,
      displayCategory: displayCategory,
      isTeamRegistration: registration.is_team_registration,
      teamMembers: teamMembersData,
      // Tambahkan data lain yang mungkin dibutuhkan frontend
    };

    return NextResponse.json(responsePayload);

  } catch (error) {
    console.error("API /payment-details error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}