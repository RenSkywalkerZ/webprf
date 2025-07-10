// FOR ANALYSIS/app/api/auth/register/route.ts

import { type NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, phone } = await request.json();

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Semua kolom wajib diisi.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Format email tidak valid.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal harus 6 karakter.' },
        { status: 400 }
      );
    }

    if (fullName.length < 3) {
      return NextResponse.json(
        { error: 'Nama lengkap minimal harus 3 karakter.' },
        { status: 400 }
      );
    }

    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email ini sudah terdaftar.' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        full_name: fullName,
        phone,
      })
      .select('id, email, full_name, phone, role')
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Gagal membuat pengguna baru.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Pengguna berhasil dibuat.',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal pada server.' },
      { status: 500 }
    );
  }
}