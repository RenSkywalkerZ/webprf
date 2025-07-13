// FOR ANALYSIS/components/auth/reset-password-form.tsx

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Lock, CheckCircle, Check, AlertTriangle } from 'lucide-react';

// --- Komponen Baru untuk Daftar Persyaratan ---
const PasswordRequirement = ({ isValid, text }: { isValid: boolean; text: string }) => (
  <div
    className={`flex items-center gap-3 text-sm transition-all duration-300 ${
      isValid ? 'text-green-400' : 'text-slate-400'
    }`}
  >
    <div
      className={`w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full transition-all duration-300 ${
        isValid ? 'bg-green-500/20' : 'bg-slate-700/50'
      }`}
    >
      {isValid && <Check className="w-3.5 h-3.5" />}
    </div>
    <span>{text}</span>
  </div>
);

// --- PERBAIKAN 1: Tentukan tipe data untuk state validasi ---
// Ini memberitahu TypeScript bahwa objek akan memiliki kunci string dan nilai boolean.
interface ValidationStatus {
  [key: string]: boolean;
}

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

  const requirements = useMemo(() => [
    { id: 'minLength', text: 'Minimal 8 karakter', a: (p: string) => p.length >= 8 },
    { id: 'hasUppercase', text: 'Mengandung huruf kapital (A-Z)', a: (p: string) => /[A-Z]/.test(p) },
    { id: 'hasLowercase', text: 'Mengandung huruf kecil (a-z)', a: (p: string) => /[a-z]/.test(p) },
    { id: 'hasNumber', text: 'Mengandung angka (0-9)', a: (p: string) => /[0-9]/.test(p) },
    { id: 'hasSpecialChar', text: 'Mengandung karakter spesial (!@#$...)', a: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
  ], []);

  // --- PERBAIKAN 2: Terapkan tipe data pada hook useState ---
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>(
    requirements.reduce((acc, req) => ({ ...acc, [req.id]: false }), {})
  );

  useEffect(() => {
    const newStatus = requirements.reduce((acc, req) => ({
      ...acc,
      [req.id]: req.a(password),
    }), {});
    setValidationStatus(newStatus);
  }, [password, requirements]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!token) {
      setError('Token reset tidak valid atau tidak ditemukan.');
      setIsLoading(false);
      return;
    }

    const allRequirementsMet = Object.values(validationStatus).every(Boolean);
    if (!allRequirementsMet) {
      setError('Pastikan semua persyaratan password terpenuhi.');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        setTimeout(() => router.push('/auth'), 3000);
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
      <div className="w-full max-w-md mx-auto text-center p-4">
        <div className="animate-fade-in-up">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-once">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-transparent bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text mb-2">
            Password Berhasil Diubah
          </h1>
          <p className="text-slate-400">
            Anda akan diarahkan kembali ke halaman login dalam 3 detik.
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
        <p className="text-slate-400">Buat password baru yang kuat dan aman.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Input Password Baru */}
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
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Daftar Persyaratan Real-time */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-4 space-y-3">
          <p className="text-sm font-medium text-white mb-2">Password harus memenuhi:</p>
          {requirements.map(req => (
            <PasswordRequirement
              key={req.id}
              isValid={validationStatus[req.id]} // Baris ini sekarang aman dari error
              text={req.text}
            />
          ))}
        </div>

        {/* Input Konfirmasi Password */}
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
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Tampilan Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:opacity-60"
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