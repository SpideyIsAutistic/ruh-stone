'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, ArrowRight, AlertCircle, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';

function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/account';

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();
  const configured = isSupabaseConfigured();

  const handleResetRequest = async (e: React.FormEvent) => {
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
        redirectTo: `${origin}/reset-password?redirect=${encodeURIComponent(redirect)}`,
      });

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to dispatch password recovery email.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-[#FFFFFF] border border-[#E8E0D2] p-8 sm:p-10 shadow-xs">
      <div className="text-center mb-8">
        <span className="text-[10px] uppercase font-sans tracking-[0.28em] text-[#AA9B87] block mb-2 font-medium">
          PATRON SECURITY & RECOVERY
        </span>
        <h1 className="font-serif text-3xl text-[#23201D] font-light tracking-wide">
          Forgot Password
        </h1>
        <p className="text-xs text-[#7A746C] mt-2 font-light leading-relaxed">
          Enter your registered patron email to receive a confidential, single-use password reset link.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-3.5 bg-[#FFF5F5] border border-[#F5C2C2] text-[#B91C1C] text-xs flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-snug">{errorMessage}</span>
        </div>
      )}

      {success ? (
        <div className="text-center py-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#F2F8F4] text-[#2A6638] flex items-center justify-center mb-4">
            <CheckCircle2 className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h2 className="font-serif text-lg text-[#23201D] mb-2 font-normal">
            Recovery Link Dispatched
          </h2>
          <p className="text-xs text-[#7A746C] leading-relaxed mb-6">
            We have sent a secure password reset link to <strong className="text-[#23201D]">{email}</strong>. Please check your inbox and spam folder.
          </p>
          <Link
            href={`/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
            className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.2em] text-[#23201D] hover:text-[#AA9B87] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Sign In</span>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleResetRequest} className="space-y-5">
          <div>
            <label className="block text-[11px] font-sans uppercase tracking-[0.2em] text-[#7A746C] mb-1.5 font-medium">
              Registered Email Address
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
                <span>Send Reset Link</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>

          <div className="text-center pt-3">
            <Link
              href={`/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
              className="text-xs text-[#7A746C] hover:text-[#23201D] transition-colors"
            >
              ← Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#23201D] flex flex-col selection:bg-[#D1C2AC]/50">
      <Navbar cartCount={0} onOpenCart={() => {}} onOpenContact={() => {}} />

      <main className="flex-1 flex items-center justify-center px-6 py-16 md:py-24">
        <Suspense
          fallback={
            <div className="max-w-md w-full mx-auto p-12 text-center bg-[#FFFFFF] border border-[#E8E0D2]">
              <Loader2 className="w-6 h-6 animate-spin text-[#AA9B87] mx-auto mb-3" />
              <span className="text-xs font-sans tracking-widest uppercase text-[#7A746C]">
                Loading Security...
              </span>
            </div>
          }
        >
          <ForgotPasswordForm />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
