// FOR ANALYSIS/components/auth/login-form.tsx

'use client';
import { useState } from 'react';
import type React from 'react';
import { useToast } from '@/hooks/use-toast'; // Pastikan menggunakan hook yang benar
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';

interface LoginFormProps {
  onLogin: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
}

export function LoginForm({
  onLogin,
  onSwitchToRegister,
  onForgotPassword,
}: LoginFormProps) {
  const [email, setEmail] = useState('');
  const { toast } = useToast();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setLoginError(null);

    try {
      const result = await onLogin(email, password);

      if (!result.success) {
        setLoginError(result.message || 'Terjadi kesalahan tidak terduga.');
        toast({
          title: 'Login Gagal',
          description: result.message || 'Silakan periksa kembali data Anda.',
          variant: 'destructive',
        });
        setIsLoading(false); // Hentikan loading jika gagal
      } else {
        // Biarkan loading sampai redirect, agar tombol tidak bisa diklik lagi
        toast({
          title: 'Login Berhasil!',
          description: 'Anda akan segera diarahkan ke dashboard.',
          variant: 'default',
        });
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500); // Jeda untuk menampilkan toast
      }
    } catch (error) {
      setLoginError('Terjadi kesalahan tidak terduga.');
      toast({
        title: 'Login Gagal',
        description: 'Terjadi kesalahan pada sistem. Silakan coba lagi.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

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
              disabled={isLoading}
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
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20"
              placeholder="Masukkan password"
              disabled={isLoading}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {loginError && (
            <p className="text-red-500 text-sm mt-2">{loginError}</p>
          )}
        </div>

        <div className="text-right">
          <button
            type="button"
            onClick={onForgotPassword}
            disabled={isLoading}
            className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Lupa password?
          </button>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Memproses...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span>Masuk</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-slate-400">
          Belum punya akun?{' '}
          <button
            onClick={onSwitchToRegister}
            disabled={isLoading}
            className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Daftar sekarang
          </button>
        </p>
      </div>
    </div>
  );
}