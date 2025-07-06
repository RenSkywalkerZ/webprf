import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    // Fetch pricing from database
    const { data: pricingData, error } = await supabaseAdmin
      .from("competition_pricing")
      .select("*")
      .order("batch_id", { ascending: true })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch pricing" }, { status: 500 })
    }

    // Transform data to nested object format
    const pricing: any = {}
    pricingData?.forEach((item) => {
      if (!pricing[item.batch_id]) {
        pricing[item.batch_id] = {}
      }
      pricing[item.batch_id][item.competition_id] = item.price
    })

    return NextResponse.json({ pricing })
  } catch (error) {
    console.error("Pricing fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { pricing } = await request.json()

    if (!pricing) {
      return NextResponse.json({ error: "Missing pricing data" }, { status: 400 })
    }

    // Transform nested object to array format for database
    const pricingArray: any[] = []
    Object.keys(pricing).forEach((batchId) => {
      Object.keys(pricing[batchId]).forEach((competitionId) => {
        pricingArray.push({
          batch_id: Number.parseInt(batchId),
          competition_id: competitionId,
          price: pricing[batchId][competitionId],
        })
      })
    })

    // Delete existing pricing
    await supabaseAdmin.from("competition_pricing").delete().neq("id", 0)

    // Insert new pricing
    const { error } = await supabaseAdmin.from("competition_pricing").insert(pricingArray)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to update pricing" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Pricing updated successfully",
    })
  } catch (error) {
    console.error("Pricing update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
