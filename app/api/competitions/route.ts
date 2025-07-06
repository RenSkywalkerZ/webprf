import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    const { data: competitions, error } = await supabaseAdmin
      .from("competitions")
      .select("*")
      .neq("title", "Lomba Robotik") // Exclude 'Lomba Robotik'
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch competitions" }, { status: 500 })
    }

    return NextResponse.json({ competitions })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
