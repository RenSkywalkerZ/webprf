'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { LoginForm } from './login-form';
import { RegisterForm } from './register-form';
import { ForgotPassword } from './forgot-password';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

interface AuthPageProps {
  // onAuthenticated is no longer passed from the parent Server Component
}

export function AuthPage({}: AuthPageProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [currentView, setCurrentView] = useState<
    'login' | 'register' | 'forgot-password'
  >('login');

  const handleLogin = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Provide a generic error message for security and user-friendliness
        return {
          success: false,
          message: 'Email or password is incorrect.',
        };
      }

      // Show toast and delay redirect to allow toast to display
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000); // Delay redirect by 2 seconds to show toast
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'An unexpected error occurred.',
      };
    }
  };

  const handleRegister = async (
    userData: any
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          fullName: userData.fullName,
          phone: userData.phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.error || 'Registration failed.',
        };
      }

      toast({
        title: 'Registrasi berhasil!',
        description: 'Silakan login.',
        variant: 'default',
      });
      setCurrentView('login');
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'An unexpected error occurred during registration.',
      };
    }
  };

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
          <img
            src="/images/logo.png"
            alt="PRF XIII Logo"
            className="w-10 h-10 rounded-full"
          />
          <span className="text-xl font-bold text-white">
            PRF XIII
          </span>
        </div>
      </div>

      {/* Auth Form Container */}
      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        <div className="bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          {currentView === 'login' && (
            <LoginForm
              onLogin={handleLogin}
              onSwitchToRegister={() => setCurrentView('register')}
              onForgotPassword={() =>
                setCurrentView('forgot-password')
              }
            />
          )}
          {currentView === 'register' && (
            <RegisterForm
              onRegister={handleRegister}
              onSwitchToLogin={() => setCurrentView('login')}
            />
          )}
          {currentView === 'forgot-password' && (
            <ForgotPassword
              onBackToLogin={() => setCurrentView('login')}
            />
          )}
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-8 right-8 opacity-30">
        <img
          src="/images/mascot.png"
          alt="Mascot"
          className="w-16 h-16 object-contain"
        />
      </div>
    </div>
  );
}
