'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Lock, ArrowRight, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/account';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();
  const configured = isSupabaseConfigured();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configured) {
      setErrorMessage('Supabase authentication requires configuration.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        router.push(redirect);
        router.refresh();
      }, 2000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update password.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-[#FFFFFF] border border-[#E8E0D2] p-8 sm:p-10 shadow-xs">
      <div className="text-center mb-8">
        <span className="text-[10px] uppercase font-sans tracking-[0.28em] text-[#AA9B87] block mb-2 font-medium">
          PATRON CREDENTIAL UPDATE
        </span>
        <h1 className="font-serif text-3xl text-[#23201D] font-light tracking-wide">
          Set New Password
        </h1>
        <p className="text-xs text-[#7A746C] mt-2 font-light leading-relaxed">
          Establish a new secret password for your atelier patron account.
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
            Password Established
          </h2>
          <p className="text-xs text-[#7A746C] leading-relaxed mb-4">
            Your password has been updated securely. Redirecting to your patron dashboard...
          </p>
          <div className="flex justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-[#AA9B87]" />
          </div>
        </div>
      ) : (
        <form onSubmit={handleUpdatePassword} className="space-y-5">
          <div>
            <label className="block text-[11px] font-sans uppercase tracking-[0.2em] text-[#7A746C] mb-1.5 font-medium">
              New Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-[#FAF7F2] border border-[#D1C2AC] px-3.5 py-2.5 text-xs text-[#23201D] placeholder-[#AA9B87] focus:outline-none focus:border-[#23201D] transition-colors"
              />
              <Lock className="w-3.5 h-3.5 text-[#AA9B87] absolute right-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-sans uppercase tracking-[0.2em] text-[#7A746C] mb-1.5 font-medium">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full bg-[#FAF7F2] border border-[#D1C2AC] px-3.5 py-2.5 text-xs text-[#23201D] placeholder-[#AA9B87] focus:outline-none focus:border-[#23201D] transition-colors"
              />
              <Lock className="w-3.5 h-3.5 text-[#AA9B87] absolute right-3.5 top-3" />
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
                <span>Save New Password</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
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
          <ResetPasswordForm />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
