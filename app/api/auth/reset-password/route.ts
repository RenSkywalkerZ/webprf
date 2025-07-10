// FOR ANALYSIS/app/api/auth/reset-password/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: "Token dan password baru wajib diisi." }, { status: 400 });
    }

    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("id, reset_token_expiry")
      .eq("reset_token", token)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "Token tidak valid atau sudah digunakan." }, { status: 400 });
    }

    if (new Date(user.reset_token_expiry) < new Date()) {
      return NextResponse.json({ error: "Token sudah kedaluwarsa." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({
        password_hash: hashedPassword,
        reset_token: null,
        reset_token_expiry: null,
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Database error:", updateError);
      return NextResponse.json({ error: "Gagal mengubah password." }, { status: 500 });
    }

    return NextResponse.json({ message: "Password berhasil diubah." });
  } catch (error) {
    console.error("Reset password API error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal pada server." }, { status: 500 });
  }
}