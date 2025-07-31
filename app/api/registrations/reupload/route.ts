// File: src/app/api/registrations/reupload/route.ts

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const registrationId = formData.get("registrationId") as string

    if (!file || !registrationId) {
      return NextResponse.json({ message: "File atau ID Pendaftaran tidak ditemukan." }, { status: 400 })
    }

    // --- Validasi Pendaftaran ---
    const { data: registration, error: registrationError } = await supabaseAdmin
      .from("registrations")
      .select("status, payment_proof_url")
      .eq("id", registrationId)
      .eq("user_id", session.user.id)
      .single()

    if (registrationError || !registration) {
      return NextResponse.json({ message: "Pendaftaran tidak ditemukan." }, { status: 404 })
    }

    if (registration.status !== "rejected") {
      return NextResponse.json({ message: "Hanya pendaftaran yang ditolak yang bisa diunggah ulang." }, { status: 403 })
    }
    
    // --- Hapus File Lama (Opsional tapi direkomendasikan) ---
    if (registration.payment_proof_url) {
        const oldFileName = registration.payment_proof_url.split('/').pop()
        if(oldFileName){
            await supabaseAdmin.storage.from('bukti-pembayaran').remove([oldFileName])
        }
    }

    // --- Upload File Baru ---
    const newFileName = `reupload-${registrationId}-${Date.now()}.${file.name.split(".").pop()}`
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("bukti-pembayaran")
      .upload(newFileName, file)

    if (uploadError) {
      console.error("Re-upload error:", uploadError)
      return NextResponse.json({ message: "Gagal mengunggah file baru." }, { status: 500 })
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from("bukti-pembayaran")
      .getPublicUrl(newFileName)
    
    // --- Update Database ---
    const { error: updateError } = await supabaseAdmin
      .from("registrations")
      .update({
        payment_proof_url: publicUrlData.publicUrl,
        payment_submitted_at: new Date().toISOString(),
        status: "pending", // <-- Kunci utama: Mengubah status kembali ke 'pending'
        admin_notes: null, // Menghapus catatan admin sebelumnya
      })
      .eq("id", registrationId)

    if (updateError) {
      console.error("Registration update error after re-upload:", updateError)
      return NextResponse.json({ message: "Gagal memperbarui status pendaftaran." }, { status: 500 })
    }

    return NextResponse.json({ message: "File berhasil diunggah ulang." })

  } catch (error) {
    console.error("Server error on re-upload:", error)
    return NextResponse.json({ message: "Terjadi kesalahan pada server." }, { status: 500 })
  }
}