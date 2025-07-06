'use client';
import { useState } from 'react';
import type React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
} from 'lucide-react';

interface RegisterFormProps {
  onRegister: (
    userData: any
  ) => Promise<{ success: boolean; message?: string }>;
  onSwitchToLogin: () => void;
}

export function RegisterForm({
  onRegister,
  onSwitchToLogin,
}: RegisterFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | null>>(
    {
      fullName: null,
      email: null,
      phone: null,
      password: null,
      confirmPassword: null,
      general: null,
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({
      // Clear all previous errors
      fullName: null,
      email: null,
      phone: null,
      password: null,
      confirmPassword: null,
      general: null,
    });

    // Client-side validation
    let hasError = false;
    if (formData.password !== formData.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: 'Password tidak cocok!',
      }));
      hasError = true;
    }
    if (formData.password.length < 6) {
      setErrors((prev) => ({
        ...prev,
        password: 'Password minimal 6 karakter.',
      }));
      hasError = true;
    }
    // Basic email format validation (can be more robust)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrors((prev) => ({
        ...prev,
        email: 'Format email tidak valid.',
      }));
      hasError = true;
    }
    if (formData.fullName.length < 3) {
      setErrors((prev) => ({
        ...prev,
        fullName: 'Nama lengkap minimal 3 karakter.',
      }));
      hasError = true;
    }

    if (hasError) {
      return;
    }

    setIsLoading(true);

    const result = await onRegister(formData);
    setIsLoading(false);

    if (!result.success) {
      // Map API errors to specific fields or a general error
      if (result.message && typeof result.message === 'string') {
        if (result.message.includes('email already exists')) {
          setErrors((prev) => ({
            ...prev,
            email: 'Email ini sudah terdaftar.',
          }));
        } else if (result.message.includes('password')) {
          setErrors((prev) => ({
            ...prev,
            password: result.message as string | null,
          }));
        } else if (result.message.includes('full name')) {
          setErrors((prev) => ({
            ...prev,
            fullName: result.message as string | null,
          }));
        } else {
          setErrors((prev) => ({
            ...prev,
            general:
              result.message || 'Terjadi kesalahan saat registrasi.',
          }));
        }
      } else {
        setErrors((prev) => ({
          ...prev,
          general: 'Terjadi kesalahan saat registrasi.',
        }));
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-transparent bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text mb-2">
          Daftar
        </h1>
        <p className="text-slate-400">Buat akun PRF XIII baru</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label
            htmlFor="fullName"
            className="text-white font-medium">
            Nama Lengkap
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) =>
                handleInputChange('fullName', e.target.value)
              }
              className="pl-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20"
              placeholder="Nama lengkap Anda"
              required
            />
          </div>
          {errors.fullName && (
            <p className="text-red-500 text-sm mt-2">
              {errors.fullName}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-white font-medium">
            Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                handleInputChange('email', e.target.value)
              }
              className="pl-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20"
              placeholder="nama@email.com"
              required
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-sm mt-2">
              {errors.email}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-white font-medium">
            Nomor Telepon
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                handleInputChange(
                  'phone',
                  e.target.value.replace(/\D/g, '')
                )
              }
              className="pl-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20"
              placeholder="08xxxxxxxxxx"
              required
            />
          </div>
          {errors.phone && (
            <p className="text-red-500 text-sm mt-2">
              {errors.phone}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-white font-medium">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) =>
                handleInputChange('password', e.target.value)
              }
              className="pl-10 pr-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20"
              placeholder="Minimal 8 karakter"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mt-2">
              {errors.password}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="confirmPassword"
            className="text-white font-medium">
            Konfirmasi Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) =>
                handleInputChange('confirmPassword', e.target.value)
              }
              className="pl-10 pr-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20"
              placeholder="Ulangi password"
              required
            />
            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-2">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all duration-300 transform hover:scale-105">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Memproses...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              Daftar
              <ArrowRight className="w-4 h-4" />
            </div>
          )}
        </Button>
        {errors.general && (
          <p className="text-red-500 text-sm mt-2 text-center">
            {errors.general}
          </p>
        )}
      </form>

      <div className="mt-6 text-center">
        <p className="text-slate-400">
          Sudah punya akun?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
            Masuk sekarang
          </button>
        </p>
      </div>
    </div>
  );
}
