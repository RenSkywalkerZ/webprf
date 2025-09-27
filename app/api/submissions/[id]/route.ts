import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import cloudinary from "@/lib/cloudinary"

// DELETE /api/submissions/[id]
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const submissionId = id

    // Ambil submission dari DB
    const { data: submission, error: fetchError } = await supabaseAdmin
      .from("submissions")
      .select("id, file_public_id, original_filename, mime_type, file_url")
      .eq("id", submissionId)
      .eq("user_id", session.user.id)
      .single()

    if (fetchError || !submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    }

    // Hapus file dari Cloudinary
    let cloudinarySuccess = false
    
    try {
      console.log("=== CLOUDINARY DELETE ATTEMPT ===")
      console.log("Submission ID:", submissionId)
      console.log("File public_id:", submission.file_public_id)
      console.log("Original filename:", submission.original_filename)
      console.log("Mime type:", submission.mime_type)
      console.log("File URL:", submission.file_url)
      
      // Function untuk mencoba delete dengan berbagai resource_type
      const tryDelete = async (publicId: string, resourceType: string) => {
        try {
          console.log(`Trying to delete with resource_type: ${resourceType}`)
          const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
          })
          console.log(`Result for ${resourceType}:`, result)
          return result
        } catch (error) {
          console.log(`Error with ${resourceType}:`, error)
          return { result: 'error', error }
        }
      }

      // Coba berbagai resource_type secara berurutan
      const resourceTypes = ['raw', 'image', 'video']
      
      for (const resourceType of resourceTypes) {
        const result = await tryDelete(submission.file_public_id, resourceType)
        
        if (result.result === 'ok') {
          console.log(`✅ Successfully deleted with resource_type: ${resourceType}`)
          cloudinarySuccess = true
          break
        } else if (result.result === 'not found') {
          console.log(`❌ File not found with resource_type: ${resourceType}`)
          continue
        } else {
          console.log(`⚠️  Other result for ${resourceType}:`, result)
        }
      }

      // Jika masih gagal, coba dengan public_id yang dimodifikasi
      if (!cloudinarySuccess) {
        console.log("🔄 Trying alternative public_id formats...")
        
        // Coba tanpa extension
        const publicIdWithoutExt = submission.file_public_id.replace(/\.[^/.]+$/, "")
        console.log("Trying without extension:", publicIdWithoutExt)
        
        for (const resourceType of resourceTypes) {
          const result = await tryDelete(publicIdWithoutExt, resourceType)
          if (result.result === 'ok') {
            console.log(`✅ Success with modified public_id and ${resourceType}`)
            cloudinarySuccess = true
            break
          }
        }
      }

      if (!cloudinarySuccess) {
        console.log("❌ Failed to delete file from Cloudinary with all attempts")
        // Log untuk manual cleanup
        console.log("MANUAL CLEANUP NEEDED:")
        console.log("Public ID:", submission.file_public_id)
        console.log("File URL:", submission.file_url)
      }
      
    } catch (err) {
      console.error("🚨 Cloudinary delete error:", err)
    }

    // Hapus dari database (tetap lanjut meskipun Cloudinary gagal)
    const { error: deleteError } = await supabaseAdmin
      .from("submissions")
      .delete()
      .eq("id", submissionId)
      .eq("user_id", session.user.id)

    if (deleteError) {
      console.error("Database delete error:", deleteError)
      return NextResponse.json({ error: "Failed to delete submission from database" }, { status: 500 })
    }

    const responseMessage = cloudinarySuccess 
      ? "Submission deleted successfully"
      : "Submission deleted from database, but file may still exist in storage"

    console.log("✅ Database deletion successful")
    
    return NextResponse.json({ 
      message: responseMessage,
      cloudinary_success: cloudinarySuccess 
    })
    
  } catch (error) {
    console.error("Delete submission error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}