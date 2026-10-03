'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[RUH STONE Client Error Boundary]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#23201D] flex flex-col items-center justify-center px-6 text-center">
      <span className="text-[10px] uppercase tracking-[0.3em] text-[#7A746C] font-medium block mb-3">
        RUH STONE ATELIER
      </span>
      <h1 className="font-serif text-3xl sm:text-4xl text-[#23201D] font-light mb-4">
        A Gentle Pause
      </h1>
      <p className="text-xs sm:text-sm text-[#7A746C] max-w-md font-light leading-relaxed mb-8">
        We encountered a brief interruption while displaying this handcrafted object. Please reload or return to our curated catalogue.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={() => reset()}
          className="w-full sm:w-auto bg-[#23201D] hover:bg-[#3A3027] text-[#FAF7F2] px-8 py-3.5 text-[11px] font-sans tracking-[0.24em] uppercase transition-colors"
        >
          RETRY VIEWING
        </button>
        <Link
          href="/"
          className="w-full sm:w-auto border border-[#23201D] text-[#23201D] hover:bg-[#23201D] hover:text-[#FAF7F2] px-8 py-3.5 text-[11px] font-sans tracking-[0.24em] uppercase transition-colors"
        >
          RETURN TO HOME
        </Link>
      </div>
    </div>
  );
}
