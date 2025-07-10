// Lokasi: FOR ANALYSIS/app/api/auth/forgot-password/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";
import crypto from "crypto";

// Inisialisasi Resend dengan API Key dari environment variable
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email wajib diisi." }, { status: 400 });
    }

    const { data: user } = await supabaseAdmin
      .from("users")
      .select("id, email, full_name")
      .eq("email", email)
      .single();

    // Penting: Selalu kembalikan pesan sukses yang sama, bahkan jika email tidak ditemukan.
    // Ini untuk mencegah orang lain menebak-nebak email yang terdaftar.
    if (!user) {
      return NextResponse.json({
        message: "Jika email Anda terdaftar, Anda akan menerima link reset password.",
      });
    }

    // 1. Buat token yang aman dan waktu kedaluwarsa
    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 3600000); // Token berlaku 1 jam

    // 2. Simpan token dan waktu kedaluwarsa ke database pengguna
    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({
        reset_token: resetToken,
        reset_token_expiry: tokenExpiry.toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Database Error:", updateError);
      return NextResponse.json(
        { error: "Gagal membuat token reset. Coba lagi nanti." },
        { status: 500 }
      );
    }

    // 3. Buat link reset password
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`;

    // 4. Kirim email menggunakan Resend
    await resend.emails.send({
      from: 'PRF XIII <noreply@prfxiii.com>', // Ganti dengan email dan domain terverifikasi Anda
      to: user.email,
      subject: 'Reset Password untuk Akun PRF XIII Anda',
      html: `
        <!DOCTYPE html>
        <html lang="id">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              background-color: #f4f4f7;
              color: #333;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              border: 1px solid #e2e2e2;
            }
            .header {
              text-align: center;
              padding: 40px 20px 20px 20px;
            }
            .header img {
              width: 60px;
              height: 60px;
            }
            .header h1 {
              font-size: 24px;
              color: #1a202c;
              margin-top: 10px;
            }
            .content {
              padding: 20px 40px;
              line-height: 1.6;
              color: #4a5568;
            }
            .button {
              display: block;
              width: fit-content;
              margin: 30px auto;
              padding: 15px 25px;
              background-color: #4a90e2;
              color: #ffffff;
              text-decoration: none;
              font-weight: bold;
              border-radius: 8px;
            }
            .footer {
              text-align: center;
              padding: 30px 20px;
              font-size: 12px;
              color: #888;
            }
            .footer-logo {
              width: 30px;
              margin-bottom: 10px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://www.prfxiii.com/images/logo.png" alt="PRF XIII Logo">
              <h1>Reset Password Anda</h1>
            </div>
            <div class="content">
              <p>Halo ${user.full_name},</p>
              <p>Anda menerima email ini karena ada permintaan untuk mereset password akun Anda. Jika Anda merasa tidak melakukan permintaan ini, silakan abaikan email ini.</p>
              <p>Klik tombol di bawah untuk melanjutkan:</p>
              <a href="${resetLink}" class="button">Reset Password</a>
              <p>Terima kasih,<br>Panitia PRF XIII</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Panitia PRF XIII. Semua hak dilindungi.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    // 5. Kembalikan pesan sukses ke pengguna
    return NextResponse.json({
      message: "Jika email Anda terdaftar, Anda akan menerima link reset password.",
    });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal pada server." }, { status: 500 });
  }
}