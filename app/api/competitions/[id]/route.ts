import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const { data: competition, error } = await supabaseAdmin
      .from("competitions")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch competition" }, { status: 500 })
    }

    return NextResponse.json({ competition })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
