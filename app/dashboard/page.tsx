import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { redirect } from "next/navigation"
import { Dashboard } from "@/components/dashboard/dashboard"
import { Toaster } from "@/components/ui/toaster"
import { supabaseAdmin } from "@/lib/supabase"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/auth")
  }

  // Fetch user data directly instead of calling the API route
  const { data: userData, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("id", session.user.id)
    .single()

  if (error) {
    console.error("Error fetching user data:", error)
    // Redirect or show an error page
    redirect("/auth?error=FetchError")
  }

  return (
    <>
      <Dashboard userData={userData} />
      <Toaster />
    </>
  )
}
