import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { redirect } from "next/navigation"
import { AuthPage } from "@/components/auth/auth-page"

export default async function AuthPageRoute() {
  const session = await getServerSession(authOptions)

  if (session?.user) {
    redirect("/dashboard")
  }

  return <AuthPage />
}
