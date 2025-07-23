import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params before accessing its properties
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Competition ID is required" }, { status: 400 });
    }

    // Ambil semua baris harga untuk kompetisi ini
    const { data, error } = await supabaseAdmin
      .from("competition_pricing")
      .select("education_level")
      .eq("competition_id", id);

    if (error) {
      console.error("Error fetching competition levels:", error);
      return NextResponse.json({ error: "Failed to fetch competition levels" }, { status: 500 });
    }

    // Gunakan Set untuk mendapatkan daftar jenjang yang unik (misal: ['smp', 'sma'])
    const uniqueLevels = [...new Set(data.map(item => item.education_level))];

    return NextResponse.json({ levels: uniqueLevels });

  } catch (error) {
    console.error("API /levels error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}