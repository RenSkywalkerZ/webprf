// app/api/debug/cloudinary/route.ts
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { debugCloudinaryFile, listCloudinaryFiles } from "@/lib/cloudinary-debug"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action')
    const publicId = searchParams.get('public_id')
    const folder = searchParams.get('folder')

    if (action === 'check_file' && publicId) {
      const result = await debugCloudinaryFile(publicId)
      return NextResponse.json(result)
    }

    if (action === 'list_files' && folder) {
      const files = await listCloudinaryFiles(folder)
      return NextResponse.json({ files })
    }

    if (action === 'list_user_submissions') {
      // List semua submissions user untuk debug
      const { data: submissions } = await supabaseAdmin
        .from("submissions")
        .select("id, file_public_id, original_filename, file_url, created_at")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })

      return NextResponse.json({ submissions })
    }

    return NextResponse.json({ 
      message: "Debug endpoint", 
      availableActions: [
        "check_file?public_id=YOUR_PUBLIC_ID",
        "list_files?folder=YOUR_FOLDER", 
        "list_user_submissions"
      ]
    })

  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json({ error: "Debug error" }, { status: 500 })
  }
}