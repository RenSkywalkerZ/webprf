// app/api/admin/pricing/route.ts

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

// [FIXED] GET function to correctly format pricing for the frontend
export async function GET(request: NextRequest) {
  try {
    const { data: pricingData, error } = await supabaseAdmin
      .from("competition_pricing")
      .select("batch_id, competition_id, education_level, price")

    if (error) {
      console.error("Database error on GET:", error)
      return NextResponse.json({ error: "Failed to fetch pricing" }, { status: 500 })
    }

    // Transform flat array from DB to the nested object the frontend needs
    const formattedPricing = pricingData.reduce((acc, item) => {
      const { batch_id, competition_id, education_level, price } = item;
      
      // Ensure batch_id level exists
      if (!acc[batch_id]) {
        acc[batch_id] = {};
      }
      // Ensure competition_id level exists
      if (!acc[batch_id][competition_id]) {
        acc[batch_id][competition_id] = {};
      }
      
      // Assign the price to the correct education level
      if (education_level) { // Check if education_level is not null
        acc[batch_id][competition_id][education_level] = price;
      }
      
      return acc;
    }, {} as any);

    return NextResponse.json({ pricing: formattedPricing })
  } catch (error) {
    console.error("Pricing fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// [FIXED] PUT function to correctly flatten pricing data for the database
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

    // Transform the nested pricing object from frontend into a flat array for DB
    const pricingToInsert: any[] = []
    for (const batchId in pricing) {
      for (const competitionId in pricing[batchId]) {
        for (const educationLevel in pricing[batchId][competitionId]) {
          const price = pricing[batchId][competitionId][educationLevel];
          // Only add entries that have a valid price
          if (typeof price === 'number') {
            pricingToInsert.push({
              batch_id: parseInt(batchId, 10),
              competition_id: competitionId,
              education_level: educationLevel,
              price: price,
            });
          }
        }
      }
    }
    
    // Perform an "upsert" operation. This will update existing rows
    // or insert new ones. It's safer than deleting all and re-inserting.
    const { error } = await supabaseAdmin
      .from("competition_pricing")
      .upsert(pricingToInsert, { 
        onConflict: 'batch_id, competition_id, education_level',
        ignoreDuplicates: false 
      });

    if (error) {
      console.error("Database error on PUT:", error)
      return NextResponse.json({ error: "Failed to update pricing", details: error.message }, { status: 500 })
    }

    return NextResponse.json({
      message: "Pricing updated successfully",
    })
  } catch (error) {
    console.error("Pricing update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}