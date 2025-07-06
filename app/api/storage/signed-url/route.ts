import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { type NextRequest, NextResponse } from "next/server"

import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the user is an admin (assuming 'role' column in 'users' table)
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (userError || user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Not an admin" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get("filePath");

    if (!filePath) {
      return NextResponse.json({ error: "File path is required" }, { status: 400 });
    }

    // Generate a signed URL for the private file
    const { data, error } = await supabaseAdmin.storage
      .from("bukti-pembayaran")
      .createSignedUrl(filePath, 60 * 5); // URL valid for 5 minutes

    if (error) {
      console.error("Error generating signed URL:", error);
      return NextResponse.json({ error: "Failed to generate signed URL" }, { status: 500 });
    }

    return NextResponse.json({ signedUrl: data.signedUrl });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
