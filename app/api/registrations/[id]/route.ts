// File: app/api/registrations/[id]/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const registrationId = params.id;

    // Ambil data registrasi untuk verifikasi kepemilikan
    const { data: registration, error: fetchError } = await supabaseAdmin
      .from("registrations")
      .select("id, user_id")
      .eq("id", registrationId)
      .single();

    if (fetchError || !registration) {
      return NextResponse.json({ error: "Pendaftaran tidak ditemukan." }, { status: 404 });
    }

    // PENTING: Pastikan pengguna hanya bisa menghapus pendaftarannya sendiri
    if (registration.user_id !== session.user.id) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    // Hapus pendaftaran dari database
    const { error: deleteError } = await supabaseAdmin
      .from("registrations")
      .delete()
      .eq("id", registrationId);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    return NextResponse.json({ message: "Pendaftaran berhasil dibatalkan." });

  } catch (error) {
    console.error("Error cancelling registration:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}