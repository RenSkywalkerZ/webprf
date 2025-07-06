"use client"
import { useState } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, ArrowLeft, CheckCircle } from "lucide-react"

interface ForgotPasswordProps {
  onBackToLogin: () => void
}

export function ForgotPassword({ onBackToLogin }: ForgotPasswordProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsEmailSent(true)
      } else {
        alert("Gagal mengirim email reset: " + data.error)
      }
    } catch (error) {
      console.error("Forgot password error:", error)
      alert("Terjadi kesalahan saat mengirim email reset")
    } finally {
      setIsLoading(false)
    }
  }

  if (isEmailSent) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-transparent bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text mb-2">
            Email Terkirim
          </h1>
          <p className="text-slate-400">
            Kami telah mengirim link reset password ke email <span className="text-cyan-400">{email}</span>
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-left">
            <h3 className="text-white font-medium mb-2">Langkah selanjutnya:</h3>
            <ul className="text-slate-300 text-sm space-y-1">
              <li>1. Cek email Anda (termasuk folder spam)</li>
              <li>2. Klik link reset password dalam email</li>
              <li>3. Buat password baru yang aman</li>
              <li>4. Login dengan password baru</li>
            </ul>
          </div>

          <Button
            onClick={onBackToLogin}
            variant="outline"
            className="w-full border-slate-600 text-slate-300 hover:bg-slate-800 bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-transparent bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text mb-2">
          Lupa Password
        </h1>
        <p className="text-slate-400">Masukkan email Anda untuk reset password</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white font-medium">
            Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20"
              placeholder="nama@email.com"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Mengirim Email...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Kirim Link Reset
            </div>
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={onBackToLogin}
          className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors flex items-center gap-2 mx-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Login
        </button>
      </div>
    </div>
  )
}
