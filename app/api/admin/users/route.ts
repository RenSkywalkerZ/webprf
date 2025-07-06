import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { NextResponse } from "next/server"

import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: users, error } = await supabaseAdmin
      .from("users")
      .select("id, email, full_name, phone, role, created_at")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database error fetching users:", error.message)
      return NextResponse.json({ error: "Failed to fetch users", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Admin users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
