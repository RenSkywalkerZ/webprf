import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import cloudinary from "@/lib/cloudinary"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

// Allowed file types per competition
const ALLOWED_TYPES: Record<string, string[]> = {
  "3d4e5cca-cf3d-45d7-8849-2a614b82f4d4": ["application/pdf"], // Scientific Writing
  "43ec1f50-2102-4a4b-995b-e33e61505b22": ["application/pdf"], // Science Project
  "331aeb0c-8851-4638-aa34-6502952f098b": ["image/jpeg", "image/jpg", "image/png"], // Depict Physics
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabaseAdmin
      .from("submissions")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ submissions: data || [] })
  } catch (err) {
    console.error("Error fetching submissions:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const competitionId = formData.get("competition_id") as string
    const description = formData.get("description") as string
    const declarationChecked = formData.get("declaration_checked") as string

    // Validate fields
    if (!file || !competitionId || declarationChecked !== "true") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size must be < 10MB" }, { status: 400 })
    }

    const validTypes = ALLOWED_TYPES[competitionId]
    if (!validTypes || !validTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }

    // Pastikan user sudah approved di lomba tsb
    const { data: reg, error: regError } = await supabaseAdmin
      .from("registrations")
      .select("id")
      .eq("user_id", session.user.id)
      .eq("competition_id", competitionId)
      .eq("status", "approved")
      .single()

    if (regError || !reg) {
      return NextResponse.json({ error: "No approved registration" }, { status: 403 })
    }

    // Ambil nama lomba
    const { data: comp } = await supabaseAdmin
      .from("competitions")
      .select("title")
      .eq("id", competitionId)
      .single()

    // Ambil nama user
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("full_name")
      .eq("id", session.user.id)
      .single()

    const competitionName = comp?.title?.replace(/\s+/g, "-").toLowerCase() || competitionId
    const userName = user?.full_name?.replace(/\s+/g, "-").toLowerCase() || session.user.id

    // Convert file ke buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Buat struktur folder Cloudinary
    const folder = `${process.env.CLOUDINARY_UPLOAD_FOLDER}/${competitionName}/${userName}`
    const publicId = file.name.replace(/\s+/g, "_")

    // Upload ke Cloudinary
    const uploadResult: any = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "auto",
          public_id: publicId,
          overwrite: true, // biar bisa replace kalau nama sama
        },
        (err, res) => {
          if (err) reject(err)
          else resolve(res)
        }
      )
      stream.end(buffer)
    })

    // Simpan metadata ke DB (tanpa status)
    const { data: submission, error: dbError } = await supabaseAdmin
      .from("submissions")
      .insert({
        user_id: session.user.id,
        competition_id: competitionId,
        registration_id: reg.id,
        file_url: uploadResult.secure_url,
        file_public_id: uploadResult.public_id,
        original_filename: file.name,
        mime_type: file.type,
        size_bytes: file.size,
        title: description || null,
        declaration_accepted: true,
      })
      .select()
      .single()

    if (dbError) {
      // Cleanup kalau gagal save DB
      await cloudinary.uploader.destroy(uploadResult.public_id)
      throw dbError
    }

    return NextResponse.json({
      message: "Submission uploaded successfully",
      submission,
    })
  } catch (err) {
    console.error("Submission upload error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
