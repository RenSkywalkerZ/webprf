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

    // Transform data to the nested object format
    const pricing: any = {};
    pricingData?.forEach((item) => {
      if (!pricing[item.batch_id]) {
        pricing[item.batch_id] = {};
      }
      pricing[item.batch_id][item.competition_id] = item.price;
    });

    return NextResponse.json({ pricing });
  } catch (error) {
    console.error("Pricing fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}