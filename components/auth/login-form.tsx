"use client"
import { useState } from "react"
import type React from "react"
import { useToast } from "@/components/ui/use-toast"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react"

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  onSwitchToRegister: () => void
  onForgotPassword: () => void
}

export function LoginForm({ onLogin, onSwitchToRegister, onForgotPassword }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const { toast } = useToast()
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const result = await onLogin(email, password)
    setIsLoading(false)

    if (!result.success) {
      toast({
        title: "Login Failed",
        description: result.message || "An unexpected error occurred.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-transparent bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text mb-2">
          Masuk
        </h1>
        <p className="text-slate-400">Masuk ke akun PRF XIII Anda</p>
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

        <div className="space-y-2">
          <Label htmlFor="password" className="text-white font-medium">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20"
              placeholder="Masukkan password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="text-right">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
          >
            Lupa password?
          </button>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Memproses...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              Masuk
              <ArrowRight className="w-4 h-4" />
            </div>
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-slate-400">
          Belum punya akun?{" "}
          <button
            onClick={onSwitchToRegister}
            className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
          >
            Daftar sekarang
          </button>
        </p>
      </div>
    </div>
  )
}
