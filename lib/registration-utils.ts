import { supabaseAdmin } from "@/lib/supabase"

export interface Registration {
  id: string
  user_id: string
  competition_id: string
  batch_id: number
  status: "pending" | "approved" | "rejected"
  created_at: string
  updated_at: string
  expires_at?: string
  payment_proof_url?: string
  payment_submitted_at?: string
}

export async function createRegistration(
  userId: string,
  competitionId: string,
  batchId: number,
  expirationMinutes = 30,
): Promise<{ registration: Registration; expiresAt: string } | { error: string }> {
  try {
    // Check if user already has a registration for this competition
    const { data: existingRegistration } = await supabaseAdmin
      .from("registrations")
      .select("*")
      .eq("user_id", userId)
      .eq("competition_id", competitionId)
      .in("status", ["pending", "approved"])
      .single()

    if (existingRegistration) {
      return { error: "You are already registered for this competition" }
    }

    // Calculate expiration time
    const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000).toISOString()

    // Create new registration
    const { data: registration, error } = await supabaseAdmin
      .from("registrations")
      .insert({
        user_id: userId,
        competition_id: competitionId,
        batch_id: batchId,
        status: "pending",
        expires_at: expiresAt,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating registration:", error)
      return { error: "Failed to create registration" }
    }

    return { registration, expiresAt }
  } catch (error) {
    console.error("Registration creation error:", error)
    return { error: "Internal server error" }
  }
}

export async function getUserRegistrations(userId: string): Promise<Registration[]> {
  try {
    const { data: registrations, error } = await supabaseAdmin
      .from("registrations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching user registrations:", error)
      return []
    }

    return registrations || []
  } catch (error) {
    console.error("Error fetching user registrations:", error)
    return []
  }
}

export async function updateRegistrationPaymentProof(
  registrationId: string,
  paymentProofUrl: string,
): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from("registrations")
      .update({
        payment_proof_url: paymentProofUrl,
        payment_submitted_at: new Date().toISOString(),
      })
      .eq("id", registrationId)

    if (error) {
      console.error("Error updating payment proof:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error updating payment proof:", error)
    return false
  }
}

export async function cleanupExpiredRegistrations(): Promise<number> {
  try {
    const { data, error } = await supabaseAdmin
      .from("registrations")
      .delete()
      .eq("status", "pending")
      .is("payment_proof_url", null)
      .lt("expires_at", new Date().toISOString())

    if (error) {
      console.error("Error cleaning up expired registrations:", error)
      return 0
    }

    return data?.length || 0
  } catch (error) {
    console.error("Error cleaning up expired registrations:", error)
    return 0
  }
}

export function isRegistrationExpired(registration: Registration): boolean {
  if (!registration.expires_at || registration.payment_proof_url) {
    return false
  }

  return new Date(registration.expires_at) <= new Date()
}

export function getRegistrationTimeLeft(registration: Registration): {
  minutes: number
  seconds: number
  isExpired: boolean
} {
  if (!registration.expires_at || registration.payment_proof_url) {
    return { minutes: 0, seconds: 0, isExpired: false }
  }

  const now = new Date().getTime()
  const expiration = new Date(registration.expires_at).getTime()
  const difference = expiration - now

  if (difference <= 0) {
    return { minutes: 0, seconds: 0, isExpired: true }
  }

  const minutes = Math.floor(difference / (1000 * 60))
  const seconds = Math.floor((difference % (1000 * 60)) / 1000)

  return { minutes, seconds, isExpired: false }
}
