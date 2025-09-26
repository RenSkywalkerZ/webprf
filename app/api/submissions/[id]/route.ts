import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import cloudinary from "@/lib/cloudinary"

// DELETE /api/submissions/[id]
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const submissionId = params.id

    // Ambil submission dari DB
    const { data: submission, error: fetchError } = await supabaseAdmin
      .from("submissions")
      .select("id, file_public_id")
      .eq("id", submissionId)
      .eq("user_id", session.user.id)
      .single()

    if (fetchError || !submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    }

    // Hapus file dari Cloudinary pakai public_id
    try {
      await cloudinary.uploader.destroy(submission.file_public_id)
    } catch (err) {
      console.error("Cloudinary delete error:", err)
    }

    // Hapus dari database
    const { error: deleteError } = await supabaseAdmin
      .from("submissions")
      .delete()
      .eq("id", submissionId)
      .eq("user_id", session.user.id)

    if (deleteError) {
      console.error("Database delete error:", deleteError)
      return NextResponse.json({ error: "Failed to delete submission" }, { status: 500 })
    }

    return NextResponse.json({ message: "Submission deleted successfully" })
  } catch (error) {
    console.error("Delete submission error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
