// FOR ANALYSIS/components/auth/reset-password-form.tsx

'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast'; // Pastikan menggunakan hook yang benar
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Lock, CheckCircle } from 'lucide-react';

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { toast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!token) {
      setError('Token reset tidak valid atau tidak ditemukan.');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok.');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password minimal harus 8 karakter.');
      setIsLoading(false);
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError('Password harus mengandung setidaknya satu huruf kapital.');
      setIsLoading(false);
      return;
    }
    if (!/[a-z]/.test(password)) {
      setError('Password harus mengandung setidaknya satu huruf kecil.');
      setIsLoading(false);
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError('Password harus mengandung setidaknya satu angka.');
      setIsLoading(false);
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setError('Password harus mengandung setidaknya satu karakter spesial (!, @, $, %, ^, &, *, +, #).');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        toast({
          title: 'Password Berhasil Diubah',
          description: 'Anda sekarang bisa login dengan password baru Anda.',
          variant: 'default',
        });
        setTimeout(() => {
          router.push('/auth');
        }, 3000);
      } else {
        setError(data.error || 'Gagal mengubah password.');
        toast({
          title: 'Gagal Mengubah Password',
          description: data.error || 'Terjadi kesalahan tidak terduga.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError('Terjadi kesalahan tidak terduga. Silakan coba lagi.');
      toast({
        title: 'Gagal Mengubah Password',
        description: 'Terjadi kesalahan pada sistem. Silakan coba lagi.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-transparent bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text mb-2">
            Password Berhasil Diubah
          </h1>
          <p className="text-slate-400">
            Anda akan diarahkan kembali ke halaman login dalam beberapa saat.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-transparent bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text mb-2">
          Reset Password
        </h1>
        <p className="text-slate-400">Masukkan password baru Anda</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="password" className="text-white font-medium">
            Password Baru
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20"
              placeholder="Masukkan password baru"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password" className="text-white font-medium">
            Konfirmasi Password Baru
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              id="confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 pr-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20"
              placeholder="Konfirmasi password baru"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Menyimpan...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Lock className="w-4 h-4" />
              <span>Reset Password</span>
            </div>
          )}
        </Button>
      </form>
    </div>
  );
}