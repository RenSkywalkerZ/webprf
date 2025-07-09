// app/api/pricing/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    // Fetch pricing from the database - NO ADMIN CHECK
    const { data: pricingData, error } = await supabaseAdmin
      .from("competition_pricing")
      .select("*")
      .order("batch_id", { ascending: true });

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: "Failed to fetch pricing" }, { status: 500 });
    }

    // Transform data to the new 3-level nested object format
    const pricing: any = {};
    pricingData?.forEach((item) => {
      const { batch_id, competition_id, education_level, price } = item;

      // Buat lapis batch jika belum ada
      if (!pricing[batch_id]) {
        pricing[batch_id] = {};
      }
      // Buat lapis kompetisi jika belum ada
      if (!pricing[batch_id][competition_id]) {
        pricing[batch_id][competition_id] = {};
      }
      
      // Set harga pada lapis education_level
      pricing[batch_id][competition_id][education_level] = price;
    });

    return NextResponse.json({ pricing });
  } catch (error) {
    console.error("Pricing fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}