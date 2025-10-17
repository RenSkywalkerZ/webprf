import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import cloudinary from "@/lib/cloudinary"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const MAX_DESCRIPTION_LENGTH = 100 // characters
const MAX_DECLARATION_DESC_LENGTH = 100 // characters

// Science Project ID constant
const SCIENCE_PROJECT_ID = "43ec1f50-2102-4a4b-995b-e33e61505b22"
const DEPICT_PHYSICS_ID = "331aeb0c-8851-4638-aa34-6502952f098b"

// Allowed file types per competition
const ALLOWED_TYPES: Record<string, string[]> = {
  "3d4e5cca-cf3d-45d7-8849-2a614b82f4d4": ["application/pdf"], // Scientific Writing
  "43ec1f50-2102-4a4b-995b-e33e61505b22": ["video/external"], // Science Project (Google Drive Link)
  "331aeb0c-8851-4638-aa34-6502952f098b": ["video/external"], // Depict Physics
}

// Competition deadlines
const COMPETITION_DEADLINES: Record<string, string> = {
  "3d4e5cca-cf3d-45d7-8849-2a614b82f4d4": "2025-10-10T23:59:59",
  "43ec1f50-2102-4a4b-995b-e33e61505b22": "2025-10-15T23:59:59",
  "331aeb0c-8851-4638-aa34-6502952f098b": "2025-10-25T23:59:59",
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
    const competitionId = formData.get("competition_id") as string
    const description = formData.get("description") as string
    const declarationChecked = formData.get("declaration_checked") as string
    const submissionType = formData.get("submission_type") as string || "karya" // Default to "karya"

    // Validate basic fields
    if (!competitionId || declarationChecked !== "true") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check deadline
    const deadline = COMPETITION_DEADLINES[competitionId]
    if (deadline && new Date() > new Date(deadline)) {
      return NextResponse.json({ error: "Deadline sudah terlewat" }, { status: 403 })
    }

    // Validate description length
    const maxDescLength = submissionType === "surat_pernyataan" 
      ? MAX_DECLARATION_DESC_LENGTH 
      : MAX_DESCRIPTION_LENGTH
    
    if (description && description.length > maxDescLength) {
      return NextResponse.json({ 
        error: `Judul terlalu panjang. Maks ${maxDescLength} karakter diperbolehkan.` 
      }, { status: 400 })
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

    // === CONDITIONAL FLOW: Science Project (Link) vs Others (File Upload) ===
    
    if ((competitionId === SCIENCE_PROJECT_ID || competitionId === DEPICT_PHYSICS_ID) && submissionType === "karya") {
      // ============================================
      // FLOW A: SCIENCE PROJECT - GOOGLE DRIVE LINK
      // ============================================
      
      const videoLink = formData.get("video_link") as string
      
      if (!videoLink) {
        return NextResponse.json({ 
          error: "Link video Google Drive diperlukan" 
        }, { status: 400 })
      }
      
      const gdriveLinkPattern = /^https:\/\/drive\.google\.com\/(file\/d\/[\w-]+|open\?id=[\w-]+|drive\/folders\/[\w-]+)/
      if (!gdriveLinkPattern.test(videoLink)) {
        return NextResponse.json({ 
          error: "Format link Google Drive tidak valid. Gunakan link berbagi dari Google Drive (file atau folder)." 
        }, { status: 400 })
      }
      
      // Simpan langsung ke database (skip Cloudinary)
      const { data: submission, error: dbError } = await supabaseAdmin
        .from("submissions")
        .insert({
          user_id: session.user.id,
          competition_id: competitionId,
          registration_id: reg.id,
          file_url: videoLink,
          file_public_id: null,
          original_filename: description || "Science Project Video",
          mime_type: "video/external",
          size_bytes: null,
          title: description || null,
          submission_type: submissionType,
          declaration_accepted: true,
        })
        .select()
        .single()

      if (dbError) {
        console.error("Database error:", dbError)
        throw dbError
      }

      return NextResponse.json({
        message: "Link video berhasil disimpan",
        submission,
      })
      
    } else {
      // ============================================
      // FLOW B: OTHER COMPETITIONS - FILE UPLOAD
      // ============================================
      
      const file = formData.get("file") as File | null
      
      if (!file) {
        return NextResponse.json({ error: "File diperlukan" }, { status: 400 })
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "Ukuran file harus < 10MB" }, { status: 400 })
      }

      // For surat_pernyataan, always allow PDF
      const validTypes = submissionType === "surat_pernyataan" 
        ? ["application/pdf"] 
        : ALLOWED_TYPES[competitionId]
        
      if (!validTypes || !validTypes.includes(file.type)) {
        return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
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

      // Buat struktur folder Cloudinary dengan subfolder berdasarkan submission type
      const subFolder = submissionType === "surat_pernyataan" ? "surat-pernyataan" : "karya"
      const folder = `${process.env.CLOUDINARY_UPLOAD_FOLDER}/${competitionName}/${userName}/${subFolder}`
      
      // Buat public_id yang unik dengan timestamp
      const timestamp = Date.now()
      const fileName = file.name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, "")
      const publicId = `${submissionType}_${timestamp}_${fileName}`

      // Upload ke Cloudinary
      const uploadResult: any = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: "auto",
            public_id: publicId,
            overwrite: true,
          },
          (err, res) => {
            if (err) reject(err)
            else resolve(res)
          }
        )
        stream.end(buffer)
      })

      // Simpan metadata ke DB
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
          submission_type: submissionType,
          declaration_accepted: true,
        })
        .select()
        .single()

      if (dbError) {
        // Cleanup kalau gagal save DB
        await cloudinary.uploader.destroy(uploadResult.public_id, { resource_type: "auto" })
        throw dbError
      }

      return NextResponse.json({
        message: "Submission uploaded successfully",
        submission,
      })
    }
    
  } catch (err) {
    console.error("Submission upload error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}