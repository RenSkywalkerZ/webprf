import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
})

// For server-side operations
export const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Database types
export interface User {
  id: string
  email: string
  full_name: string
  nickname?: string
  phone?: string
  address?: any // JSONB type
  date_of_birth?: string
  school?: string
  grade?: string
  education_level?: string
  gender?: string
  student_id?: string
  role: "user" | "admin"
  created_at: string
  updated_at: string
}

export interface Competition {
  id: string
  title: string
  description: string
  category: string
  base_fee: number
  max_participants?: number
  participants_count: number
  color: string
  icon: string
  form_url: string
  created_at: string
  updated_at: string
}

export interface Registration {
  id: string
  user_id: string
  competition_id: string
  batch_number: number
  status: "pending" | "approved" | "rejected"
  registration_date: string
  payment_proof?: string
  notes?: string
  created_at: string
  updated_at: string
  users?: User
  competitions?: Competition
}

export interface Batch {
  id: number
  name: string
  start_date: string
  end_date: string
  price_multiplier: number
  is_active: boolean
  created_at: string
}

// Helper function to handle database errors
export function handleDatabaseError(error: any) {
  console.error("Database error:", error)

  if (error.code === "PGRST116") {
    return "No data found"
  }

  if (error.code === "23505") {
    return "Data already exists"
  }

  if (error.code === "23503") {
    return "Referenced data not found"
  }

  if (error.code === "42501") {
    return "Permission denied"
  }

  return error.message || "Database operation failed"
}
