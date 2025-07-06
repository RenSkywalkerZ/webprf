import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { type NextRequest, NextResponse } from "next/server"

import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("Fetching profile for user:", session.user.id)

    const { data: user, error } = await supabaseAdmin.from("users").select("*").eq("id", session.user.id).single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
    }

    console.log("Raw user data from database:", user)

    // Parse address if it's a string or ensure it's an object
    let parsedAddress = user.address
    if (typeof user.address === "string") {
      try {
        parsedAddress = JSON.parse(user.address)
      } catch (e) {
        console.log("Failed to parse address string, using default structure")
        parsedAddress = {
          street: user.address || "",
          rtRw: "",
          village: "",
          district: "",
          city: "",
          province: "",
          postalCode: "",
        }
      }
    } else if (!user.address || typeof user.address !== "object") {
      parsedAddress = {
        street: "",
        rtRw: "",
        village: "",
        district: "",
        city: "",
        province: "",
        postalCode: "",
      }
    }

    const formattedUser = {
      ...user,
      address: parsedAddress,
    }

    console.log("Formatted user data with identity_type:", formattedUser.identity_type)

    return NextResponse.json({ user: formattedUser })
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const updates = await request.json()
    console.log("Profile update request for user:", session.user.id, updates)

    // Prepare update data with proper validation
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    // Handle full_name (required field)
    if (updates.fullName !== undefined) {
      updateData.full_name = updates.fullName?.trim() || null
    }

    // Handle optional fields - only update if provided
    if (updates.nickname !== undefined) {
      updateData.nickname = updates.nickname?.trim() || null
    }

    if (updates.phone !== undefined) {
      updateData.phone = updates.phone?.trim() || null
    }

    if (updates.dateOfBirth !== undefined) {
      updateData.date_of_birth = updates.dateOfBirth || null
    }

    if (updates.educationLevel !== undefined) {
      updateData.education_level = updates.educationLevel || null
    }

    if (updates.school !== undefined) {
      updateData.school = updates.school?.trim() || null
    }

    if (updates.grade !== undefined) {
      updateData.grade = updates.grade?.trim() || null
    }

    if (updates.gender !== undefined) {
      updateData.gender = updates.gender || null
    }

    if (updates.studentId !== undefined) {
      updateData.student_id = updates.studentId?.trim() || null
    }

    // CRITICAL FIX: Handle identity type field properly
    if (updates.identityType !== undefined) {
      updateData.identity_type = updates.identityType || null
      console.log("Setting identity_type to:", updateData.identity_type)
    }

    // Handle address as JSONB - ensure it's properly structured
    if (updates.address !== undefined) {
      if (typeof updates.address === "object" && updates.address !== null) {
        updateData.address = updates.address
      } else if (typeof updates.address === "string") {
        try {
          updateData.address = JSON.parse(updates.address)
        } catch (e) {
          updateData.address = {
            street: updates.address || "",
            rtRw: "",
            village: "",
            district: "",
            city: "",
            province: "",
            postalCode: "",
          }
        }
      } else {
        updateData.address = null
      }
    }

    console.log("Updating user with data:", updateData)

    // Perform the update with explicit column selection to ensure we get the updated data back
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .update(updateData)
      .eq("id", session.user.id)
      .select("*")
      .single()

    if (error) {
      console.error("Database update error:", error)
      return NextResponse.json(
        {
          error: "Failed to update profile",
          details: error.message,
        },
        { status: 500 },
      )
    }

    if (!user) {
      console.error("No user returned after update")
      return NextResponse.json(
        {
          error: "Update failed - no user data returned",
        },
        { status: 500 },
      )
    }

    console.log("Profile updated successfully with identity_type:", user.identity_type)

    // Parse address for response
    let parsedAddress = user.address
    if (typeof user.address === "string") {
      try {
        parsedAddress = JSON.parse(user.address)
      } catch (e) {
        parsedAddress = {
          street: user.address || "",
          rtRw: "",
          village: "",
          district: "",
          city: "",
          province: "",
          postalCode: "",
        }
      }
    } else if (!user.address || typeof user.address !== "object") {
      parsedAddress = {
        street: "",
        rtRw: "",
        village: "",
        district: "",
        city: "",
        province: "",
        postalCode: "",
      }
    }

    const formattedUser = {
      ...user,
      address: parsedAddress,
    }

    // Verify the identity_type was saved correctly
    console.log("Returning updated user with identity_type:", formattedUser.identity_type)

    return NextResponse.json({
      message: "Profile updated successfully",
      user: formattedUser,
    })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
