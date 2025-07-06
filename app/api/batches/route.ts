import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    const { data: batches, error } = await supabaseAdmin
      .from("batches")
      .select("*")
      .eq("is_active", true)
      .order("id", { ascending: true })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch batches" }, { status: 500 })
    }

    return NextResponse.json({ batches })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
