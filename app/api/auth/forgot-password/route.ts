import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if user exists
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("id, email, full_name")
      .eq("email", email)
      .single()

    if (userError || !user) {
      // Don't reveal if email exists or not for security
      return NextResponse.json({ message: "If the email exists, a reset link has been sent" })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

    // Store reset token in database (you might want to create a separate table for this)
    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({
        reset_token: resetToken,
        reset_token_expiry: resetTokenExpiry.toISOString(),
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("Database error:", updateError)
      return NextResponse.json({ error: "Failed to generate reset token" }, { status: 500 })
    }

    // Here you would normally send an email with the reset link
    // For now, we'll just log it (in production, use a proper email service)
    const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`
    console.log(`Reset link for ${email}: ${resetLink}`)

    // In production, send email here
    // await sendResetPasswordEmail(user.email, user.full_name, resetLink)

    return NextResponse.json({
      message: "If the email exists, a reset link has been sent",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
