'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Loader2,
  KeyRound,
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/account';

  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const supabase = createClient();
  const configured = isSupabaseConfigured();

  // 1. Google Sign-In
  const handleGoogleSignIn = async () => {
    if (!configured) {
      setErrorMessage(
        'Supabase authentication is awaiting API configuration. Please configure NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.'
      );
      return;
    }
    setGoogleLoading(true);
    setErrorMessage(null);

    try {
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setGoogleLoading(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to initialize Google Sign In');
      setGoogleLoading(false);
    }
  };

  // 2. Email + Password Sign-In
  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configured) {
      setErrorMessage(
        'Supabase authentication is awaiting API configuration. Please configure NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.'
      );
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrorMessage('Incorrect email or password. Please verify your details.');
        } else {
          setErrorMessage(error.message);
        }
        setLoading(false);
        return;
      }

      router.push(redirect);
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error. Please try again.');
      setLoading(false);
    }
  };

  // 3. Passwordless OTP / Magic Link Request
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configured) {
      setErrorMessage('Supabase authentication requires configuration.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      setOtpSent(true);
      setSuccessMessage('A secure 6-digit access code has been dispatched to your email address.');
      setLoading(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to dispatch magic code.');
      setLoading(false);
    }
  };

  // 4. Verify OTP Code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpToken) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otpToken.trim(),
        type: 'email',
      });

      if (error) {
        setErrorMessage(error.message.includes('expired') ? 'Verification code has expired. Please request a new code.' : 'Invalid code. Please check your email.');
        setLoading(false);
        return;
      }

      router.push(redirect);
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-[#FFFFFF] border border-[#E8E0D2] p-8 sm:p-10 shadow-xs">
      {/* Atelier Heading */}
      <div className="text-center mb-8">
        <span className="text-[10px] uppercase font-sans tracking-[0.28em] text-[#AA9B87] block mb-2 font-medium">
          ATELIER PATRON ACCESS
        </span>
        <h1 className="font-serif text-3xl text-[#23201D] font-light tracking-wide">
          Sign In
        </h1>
        <p className="text-xs text-[#7A746C] mt-2 font-light leading-relaxed">
          Access your curated acquisitions, white-glove consignment tracking, and artisan provenance.
        </p>
      </div>

      {/* Unconfigured Alert Notice if applicable */}
      {!configured && (
        <div className="mb-6 p-4 bg-[#F5EFE6] border border-[#E8E0D2] text-[11px] text-[#7A746C] leading-relaxed">
          <strong className="text-[#23201D] block mb-1">Configuration Note:</strong>
          Supabase authentication client key is being connected. Add your <code className="bg-[#FAF7F2] px-1 py-0.5 border border-[#E8E0D2]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to enable live authentication.
        </div>
      )}

      {/* Error / Success Feedback */}
      {errorMessage && (
        <div className="mb-6 p-3.5 bg-[#FFF5F5] border border-[#F5C2C2] text-[#B91C1C] text-xs flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-snug">{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-3.5 bg-[#F2F8F4] border border-[#CDE5D4] text-[#2A6638] text-xs flex items-start space-x-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-snug">{successMessage}</span>
        </div>
      )}

      {/* Google OAuth Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={googleLoading}
        className="w-full flex items-center justify-center space-x-3 py-3 px-4 border border-[#D1C2AC] bg-[#FAF7F2] hover:bg-[#F2ECE1] text-[#23201D] text-xs font-sans tracking-[0.16em] uppercase transition-colors disabled:opacity-50 cursor-pointer mb-6"
      >
        {googleLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-[#23201D]" />
        ) : (
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}
        <span>Continue with Google</span>
      </button>

      {/* Divider */}
      <div className="relative flex py-2 items-center mb-6">
        <div className="grow border-t border-[#E8E0D2]"></div>
        <span className="shrink mx-4 text-[10px] uppercase tracking-[0.24em] text-[#AA9B87]">
          Or with email
        </span>
        <div className="grow border-t border-[#E8E0D2]"></div>
      </div>

      {/* Authentication Mode Switcher */}
      <div className="flex border-b border-[#E8E0D2] mb-6">
        <button
          type="button"
          onClick={() => {
            setAuthMode('password');
            setErrorMessage(null);
            setSuccessMessage(null);
          }}
          className={`flex-1 pb-2.5 text-[11px] font-sans tracking-[0.16em] uppercase text-center transition-colors cursor-pointer ${
            authMode === 'password'
              ? 'border-b-2 border-[#23201D] text-[#23201D] font-medium'
              : 'text-[#7A746C] hover:text-[#23201D]'
          }`}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => {
            setAuthMode('otp');
            setErrorMessage(null);
            setSuccessMessage(null);
          }}
          className={`flex-1 pb-2.5 text-[11px] font-sans tracking-[0.16em] uppercase text-center transition-colors cursor-pointer ${
            authMode === 'otp'
              ? 'border-b-2 border-[#23201D] text-[#23201D] font-medium'
              : 'text-[#7A746C] hover:text-[#23201D]'
          }`}
        >
          Email OTP / Magic Code
        </button>
      </div>

      {/* Password Form */}
      {authMode === 'password' && (
        <form onSubmit={handlePasswordSignIn} className="space-y-5">
          <div>
            <label className="block text-[11px] font-sans uppercase tracking-[0.2em] text-[#7A746C] mb-1.5 font-medium">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="patron@example.com"
                className="w-full bg-[#FAF7F2] border border-[#D1C2AC] px-3.5 py-2.5 text-xs text-[#23201D] placeholder-[#AA9B87] focus:outline-none focus:border-[#23201D] transition-colors"
              />
              <Mail className="w-3.5 h-3.5 text-[#AA9B87] absolute right-3.5 top-3" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[11px] font-sans uppercase tracking-[0.2em] text-[#7A746C] font-medium">
                Password
              </label>
              <Link
                href={`/forgot-password${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
                className="text-[10px] text-[#7A746C] hover:text-[#23201D] tracking-wider uppercase transition-colors"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#FAF7F2] border border-[#D1C2AC] px-3.5 py-2.5 text-xs text-[#23201D] placeholder-[#AA9B87] focus:outline-none focus:border-[#23201D] transition-colors"
              />
              <Lock className="w-3.5 h-3.5 text-[#AA9B87] absolute right-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#23201D] hover:bg-[#3D352E] text-[#FAF7F2] py-3 text-xs uppercase tracking-[0.22em] font-medium transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#FAF7F2]" />
            ) : (
              <>
                <span>Sign In to Atelier</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      )}

      {/* Passwordless OTP Form */}
      {authMode === 'otp' && (
        <div>
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-[11px] font-sans uppercase tracking-[0.2em] text-[#7A746C] mb-1.5 font-medium">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="patron@example.com"
                    className="w-full bg-[#FAF7F2] border border-[#D1C2AC] px-3.5 py-2.5 text-xs text-[#23201D] placeholder-[#AA9B87] focus:outline-none focus:border-[#23201D] transition-colors"
                  />
                  <Mail className="w-3.5 h-3.5 text-[#AA9B87] absolute right-3.5 top-3" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#23201D] hover:bg-[#3D352E] text-[#FAF7F2] py-3 text-xs uppercase tracking-[0.22em] font-medium transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#FAF7F2]" />
                ) : (
                  <>
                    <span>Dispatch Access Code</span>
                    <KeyRound className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="block text-[11px] font-sans uppercase tracking-[0.2em] text-[#7A746C] mb-1.5 font-medium">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={8}
                  value={otpToken}
                  onChange={(e) => setOtpToken(e.target.value)}
                  placeholder="123456"
                  className="w-full bg-[#FAF7F2] border border-[#D1C2AC] px-3.5 py-2.5 text-center text-sm font-mono tracking-widest text-[#23201D] focus:outline-none focus:border-[#23201D] transition-colors"
                />
                <p className="text-[10px] text-[#7A746C] mt-2">
                  Sent to <strong className="text-[#23201D]">{email}</strong>.{' '}
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="text-[#23201D] underline ml-1 hover:text-[#AA9B87]"
                  >
                    Change email
                  </button>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#23201D] hover:bg-[#3D352E] text-[#FAF7F2] py-3 text-xs uppercase tracking-[0.22em] font-medium transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#FAF7F2]" />
                ) : (
                  <>
                    <span>Verify Code & Enter</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Footer Switch */}
      <div className="mt-8 pt-6 border-t border-[#F2ECE1] text-center">
        <span className="text-xs text-[#7A746C]">New to RUH STONE? </span>
        <Link
          href={`/signup${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
          className="text-xs text-[#23201D] font-medium hover:text-[#AA9B87] transition-colors underline underline-offset-4"
        >
          Create Patron Account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#23201D] flex flex-col selection:bg-[#D1C2AC]/50">
      <Navbar cartCount={0} onOpenCart={() => {}} onOpenContact={() => {}} />

      <main className="flex-1 flex items-center justify-center px-6 py-16 md:py-24">
        <Suspense
          fallback={
            <div className="max-w-md w-full mx-auto p-12 text-center bg-[#FFFFFF] border border-[#E8E0D2]">
              <Loader2 className="w-6 h-6 animate-spin text-[#AA9B87] mx-auto mb-3" />
              <span className="text-xs font-sans tracking-widest uppercase text-[#7A746C]">
                Loading Atelier...
              </span>
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
