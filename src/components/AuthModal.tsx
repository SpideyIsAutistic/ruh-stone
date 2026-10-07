'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import {
  X,
  Mail,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  KeyRound,
  Sparkles,
} from 'lucide-react';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup' | 'forgot';
  redirectUrl?: string;
  onSuccess?: () => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  defaultMode = 'login',
  redirectUrl = '/account',
  onSuccess,
}: AuthModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(defaultMode);
  const [authMethod, setAuthMethod] = useState<'password' | 'otp'>('password');

  // Form inputs
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // States
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const supabase = createClient();
  const configured = isSupabaseConfigured();

  useEffect(() => {
    setMode(defaultMode);
    setErrorMessage(null);
    setSuccessMessage(null);
    setOtpSent(false);
  }, [defaultMode, isOpen]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFinishAuth = () => {
    if (onSuccess) {
      onSuccess();
    }
    onClose();
    router.refresh();
  };

  // Google OAuth Sign-In
  const handleGoogleSignIn = async () => {
    if (!configured) {
      setErrorMessage(
        'Supabase authentication requires NEXT_PUBLIC_SUPABASE_ANON_KEY to be configured in your environment variables.'
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
          redirectTo: `${origin}/auth/callback?redirect=${encodeURIComponent(redirectUrl)}`,
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

  // Email + Password Sign In
  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configured) {
      setErrorMessage(
        'Supabase authentication requires NEXT_PUBLIC_SUPABASE_ANON_KEY to be configured.'
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
          setErrorMessage('Incorrect email or password. Please verify your credentials.');
        } else {
          setErrorMessage(error.message);
        }
        setLoading(false);
        return;
      }

      setSuccessMessage('Welcome back to RUH STONE.');
      setTimeout(() => {
        handleFinishAuth();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error.');
      setLoading(false);
    }
  };

  // Sign Up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configured) {
      setErrorMessage(
        'Supabase authentication requires NEXT_PUBLIC_SUPABASE_ANON_KEY to be configured.'
      );
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const origin = window.location.origin;
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
          emailRedirectTo: `${origin}/auth/callback?redirect=${encodeURIComponent(redirectUrl)}`,
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        setSuccessMessage('Patron profile established. Welcome.');
        setTimeout(() => {
          handleFinishAuth();
        }, 700);
      } else {
        setSuccessMessage('A confirmation email has been dispatched. Please verify your inbox.');
        setLoading(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create patron account.');
      setLoading(false);
    }
  };

  // Dispatch OTP
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
          emailRedirectTo: `${origin}/auth/callback?redirect=${encodeURIComponent(redirectUrl)}`,
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      setOtpSent(true);
      setSuccessMessage('A 6-digit access token has been sent to your email.');
      setLoading(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to dispatch magic code.');
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpToken) {
      setErrorMessage('Please enter the 6-digit token.');
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
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      setSuccessMessage('Identity verified. Entering atelier...');
      setTimeout(() => {
        handleFinishAuth();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification error.');
      setLoading(false);
    }
  };

  // Reset Password Request
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configured) {
      setErrorMessage('Supabase authentication requires configuration.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const origin = window.location.origin;
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${origin}/reset-password`,
      });

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      setSuccessMessage('Password reset instructions dispatched to your inbox.');
      setLoading(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Password reset request failed.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#23201D]/65 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Modal Dialog */}
      <div className="min-h-full flex items-center justify-center p-4 sm:p-6 text-center">
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md bg-[#FAF7F2] border border-[#E8E0D2] shadow-2xl p-6 sm:p-8 text-left animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 text-[#7A746C] hover:text-[#23201D] transition-colors focus:outline-none"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#AA9B87] font-medium block">
              RUH STONE ATELIER
            </span>
            <h2 className="font-serif text-2xl text-[#23201D] font-light mt-1">
              {mode === 'login'
                ? 'Patron Sign In'
                : mode === 'signup'
                ? 'Create Patron Account'
                : 'Account Recovery'}
            </h2>
            <p className="text-xs text-[#7A746C] mt-1 max-w-xs mx-auto">
              {mode === 'login'
                ? 'Access your orders, saved delivery addresses, and provenance records.'
                : mode === 'signup'
                ? 'Join our circle of connoisseurs for tailored atelier services.'
                : 'Enter your email to receive a password reset link.'}
            </p>
          </div>

          {/* Alert Messages */}
          {errorMessage && (
            <div className="mb-5 p-3 bg-[#8B3A2B]/10 border border-[#8B3A2B]/30 text-[#8B3A2B] text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3 bg-[#2A6638]/10 border border-[#2A6638]/30 text-[#2A6638] text-xs flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Unconfigured Notice */}
          {!configured && (
            <div className="mb-5 p-3 bg-[#F4EFE6] border border-[#D1C2AC] text-[11px] text-[#7A746C] leading-relaxed">
              <strong className="text-[#23201D] block mb-0.5">Atelier Setup Notice</strong>
              Add <code className="text-[#23201D] font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your environment file to link your live Supabase authentication.
            </div>
          )}

          {/* Mode: LOGIN */}
          {mode === 'login' && (
            <div className="space-y-4">
              {/* Google Sign In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full bg-[#FFFFFF] border border-[#D1C2AC] hover:border-[#23201D] text-[#23201D] py-2.5 px-4 text-xs font-sans tracking-wider uppercase transition-colors flex items-center justify-center space-x-3 disabled:opacity-50"
              >
                {googleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#AA9B87]" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                <span>CONTINUE WITH GOOGLE</span>
              </button>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E8E0D2]" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest text-[#AA9B87]">
                  <span className="bg-[#FAF7F2] px-3 font-medium">OR VIA EMAIL</span>
                </div>
              </div>

              {/* Method Switcher */}
              <div className="flex border-b border-[#E8E0D2] mb-3 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('password');
                    setOtpSent(false);
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-2 text-[11px] font-sans tracking-wider uppercase transition-colors border-b-2 ${
                    authMethod === 'password'
                      ? 'border-[#23201D] text-[#23201D] font-semibold'
                      : 'border-transparent text-[#7A746C] hover:text-[#23201D]'
                  }`}
                >
                  Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('otp');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-2 text-[11px] font-sans tracking-wider uppercase transition-colors border-b-2 ${
                    authMethod === 'otp'
                      ? 'border-[#23201D] text-[#23201D] font-semibold'
                      : 'border-transparent text-[#7A746C] hover:text-[#23201D]'
                  }`}
                >
                  Passwordless OTP
                </button>
              </div>

              {/* Method A: Password */}
              {authMethod === 'password' && (
                <form onSubmit={handlePasswordSignIn} className="space-y-3.5">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-[#7A746C] block mb-1 font-medium">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="patron@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#FFFFFF] border border-[#D1C2AC] px-3.5 py-2 text-xs text-[#23201D] focus:border-[#23201D] focus:outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] uppercase tracking-widest text-[#7A746C] font-medium">
                        Password *
                      </label>
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-[10px] text-[#AA9B87] hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#FFFFFF] border border-[#D1C2AC] px-3.5 py-2 text-xs text-[#23201D] focus:border-[#23201D] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#23201D] hover:bg-[#3D3731] text-[#FAF7F2] py-3 text-[11px] font-sans tracking-[0.2em] uppercase transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#FAF7F2]" />
                    ) : (
                      <>
                        <span>ENTER ATELIER</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Method B: Email OTP */}
              {authMethod === 'otp' && (
                <div>
                  {!otpSent ? (
                    <form onSubmit={handleSendOtp} className="space-y-3.5">
                      <div>
                        <label className="text-[10px] uppercase tracking-widest text-[#7A746C] block mb-1 font-medium">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="patron@domain.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-[#FFFFFF] border border-[#D1C2AC] px-3.5 py-2 text-xs text-[#23201D] focus:border-[#23201D] focus:outline-none"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#23201D] hover:bg-[#3D3731] text-[#FAF7F2] py-3 text-[11px] font-sans tracking-[0.2em] uppercase transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-[#FAF7F2]" />
                        ) : (
                          <span>SEND 6-DIGIT CODE</span>
                        )}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                      <div>
                        <label className="text-[10px] uppercase tracking-widest text-[#7A746C] block mb-1 font-medium">
                          Enter 6-Digit Code *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="123456"
                          maxLength={6}
                          value={otpToken}
                          onChange={(e) => setOtpToken(e.target.value)}
                          className="w-full bg-[#FFFFFF] border border-[#D1C2AC] px-3.5 py-2 text-center text-sm font-mono tracking-widest text-[#23201D] focus:border-[#23201D] focus:outline-none"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#23201D] hover:bg-[#3D3731] text-[#FAF7F2] py-3 text-[11px] font-sans tracking-[0.2em] uppercase transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-[#FAF7F2]" />
                        ) : (
                          <span>VERIFY & ENTER</span>
                        )}
                      </button>
                      <div className="text-center pt-1">
                        <button
                          type="button"
                          onClick={() => setOtpSent(false)}
                          className="text-[10px] text-[#7A746C] hover:text-[#23201D] underline"
                        >
                          Send to a different email
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Bottom Toggle */}
              <div className="pt-3 border-t border-[#E8E0D2] text-center text-xs text-[#7A746C]">
                <span>New to RUH STONE? </span>
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="font-medium text-[#23201D] underline hover:text-[#AA9B87]"
                >
                  Create Patron Account
                </button>
              </div>
            </div>
          )}

          {/* Mode: SIGNUP */}
          {mode === 'signup' && (
            <div className="space-y-4">
              {/* Google Sign In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full bg-[#FFFFFF] border border-[#D1C2AC] hover:border-[#23201D] text-[#23201D] py-2.5 px-4 text-xs font-sans tracking-wider uppercase transition-colors flex items-center justify-center space-x-3 disabled:opacity-50"
              >
                {googleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#AA9B87]" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                <span>SIGN UP WITH GOOGLE</span>
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E8E0D2]" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest text-[#AA9B87]">
                  <span className="bg-[#FAF7F2] px-3 font-medium">OR WITH EMAIL</span>
                </div>
              </div>

              <form onSubmit={handleSignUp} className="space-y-3.5">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#7A746C] block mb-1 font-medium">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maharani Gayatri Devi"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#D1C2AC] px-3.5 py-2 text-xs text-[#23201D] focus:border-[#23201D] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#7A746C] block mb-1 font-medium">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="patron@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#D1C2AC] px-3.5 py-2 text-xs text-[#23201D] focus:border-[#23201D] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#7A746C] block mb-1 font-medium">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#D1C2AC] px-3.5 py-2 text-xs text-[#23201D] focus:border-[#23201D] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#23201D] hover:bg-[#3D3731] text-[#FAF7F2] py-3 text-[11px] font-sans tracking-[0.2em] uppercase transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#FAF7F2]" />
                  ) : (
                    <>
                      <span>CREATE PATRON ACCOUNT</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-3 border-t border-[#E8E0D2] text-center text-xs text-[#7A746C]">
                <span>Already registered? </span>
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-medium text-[#23201D] underline hover:text-[#AA9B87]"
                >
                  Sign In
                </button>
              </div>
            </div>
          )}

          {/* Mode: FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <div className="space-y-4">
              <form onSubmit={handleForgotPassword} className="space-y-3.5">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#7A746C] block mb-1 font-medium">
                    Registered Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="patron@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#D1C2AC] px-3.5 py-2 text-xs text-[#23201D] focus:border-[#23201D] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#23201D] hover:bg-[#3D3731] text-[#FAF7F2] py-3 text-[11px] font-sans tracking-[0.2em] uppercase transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#FAF7F2]" />
                  ) : (
                    <span>DISPATCH RESET INSTRUCTIONS</span>
                  )}
                </button>
              </form>

              <div className="pt-3 border-t border-[#E8E0D2] text-center text-xs text-[#7A746C]">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-medium text-[#23201D] underline hover:text-[#AA9B87]"
                >
                  ← Return to Sign In
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
