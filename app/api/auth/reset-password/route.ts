import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json()

    if (!token || !newPassword) {
      return NextResponse.json({ error: "Token and new password are required" }, { status: 400 })
    }

    // Find user by reset token and check expiry
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("id, reset_token_expiry")
      .eq("reset_token", token)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "Invalid or expired token." }, { status: 400 })
    }

    if (new Date(user.reset_token_expiry) < new Date()) {
      return NextResponse.json({ error: "Token has expired." }, { status: 400 })
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update user's password and clear reset token fields
    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({
        password_hash: hashedPassword,
        reset_token: null,
        reset_token_expiry: null,
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("Database error:", updateError)
      return NextResponse.json({ error: "Failed to reset password." }, { status: 500 })
    }

    return NextResponse.json({ message: "Password reset successfully." })
  } catch (error) {
    console.error("Reset password API error:", error)
    return NextResponse.json({ error: "Internal server error." }, { status: 500 })
  }
}
