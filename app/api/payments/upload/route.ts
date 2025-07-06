import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { type NextRequest, NextResponse } from "next/server"

import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const paymentProof = formData.get("paymentProof") as File
    const registrationId = formData.get("registrationId") as string
    const competitionId = formData.get("competitionId") as string
    const batchId = formData.get("batchId") as string

    if (!paymentProof || !registrationId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate file
    if (paymentProof.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 })
    }

    if (!["image/jpeg", "image/png", "image/jpg"].includes(paymentProof.type)) {
      return NextResponse.json({ error: "File must be JPG or PNG" }, { status: 400 })
    }

    // Verify the registration belongs to the user and is still valid
    const { data: registration, error: registrationError } = await supabaseAdmin
      .from("registrations")
      .select("*")
      .eq("id", registrationId)
      .eq("user_id", session.user.id)
      .single()

    if (registrationError || !registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 })
    }

    // Check if registration is still valid (not expired or already has payment proof)
    if (registration.status !== "pending") {
      return NextResponse.json({ error: "Registration is not in pending status" }, { status: 400 })
    }

    const fileName = `payment-proof-${registrationId}-${Date.now()}.${paymentProof.name.split(".").pop()}`

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("bukti-pembayaran")
      .upload(fileName, paymentProof, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      console.error("Error uploading payment proof:", uploadError)
      return NextResponse.json({ error: "Failed to upload payment proof" }, { status: 500 })
    }

    // Get public URL of the uploaded file
    const { data: publicUrlData } = supabaseAdmin.storage
      .from("bukti-pembayaran")
      .getPublicUrl(fileName)

    const paymentProofUrl = publicUrlData.publicUrl

    // Update registration with payment proof URL
    const { error: updateError } = await supabaseAdmin
      .from("registrations")
      .update({
        payment_proof_url: paymentProofUrl,
        payment_submitted_at: new Date().toISOString(),
      })
      .eq("id", registrationId)

    if (updateError) {
      console.error("Error updating registration:", updateError)
      return NextResponse.json({ error: "Failed to update registration" }, { status: 500 })
    }

    // Log the payment submission
    console.log(`Payment proof uploaded for registration ${registrationId} by user ${session.user.id}`)

    return NextResponse.json({
      message: "Payment proof uploaded successfully",
      paymentProofUrl: uploadData.path,
      registrationId: registrationId,
    })
  } catch (error) {
    console.error("Payment upload error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
