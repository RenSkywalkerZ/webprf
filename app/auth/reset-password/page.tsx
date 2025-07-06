import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { Suspense } from "react"

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage: `url('/images/hero-bg.png')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/90 to-black/80" />
      </div>

      {/* Floating Background Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl animate-pulse delay-300"></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-pink-500/10 rounded-full blur-xl animate-bounce"></div>

      {/* Logo */}
      <div className="absolute top-8 left-8">
        <div className="flex items-center space-x-3">
          <img src="/images/logo.png" alt="PRF XIII Logo" className="w-10 h-10 rounded-full" />
          <span className="text-xl font-bold text-white">PRF XIII</span>
        </div>
      </div>

      {/* Auth Form Container */}
      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        <div className="bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-8 right-8 opacity-30">
        <img src="/images/mascot.png" alt="Mascot" className="w-16 h-16 object-contain" />
      </div>
    </div>
  )
}