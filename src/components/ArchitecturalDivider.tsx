import React from 'react';

interface ArchitecturalDividerProps {
  label?: string;
  variant?: 'jaali' | 'minimal' | 'arch' | 'rosette';
  className?: string;
}

export default function ArchitecturalDivider({
  label,
  variant = 'rosette',
  className = '',
}: ArchitecturalDividerProps) {
  return (
    <div
      className={`relative flex items-center justify-center py-12 md:py-16 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* Left fine etched line with gradient fade */}
      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#443c34] to-[#bba172]/40" />

      {/* Central Ornamental Emblem */}
      <div className="mx-6 flex items-center space-x-3 text-[#bba172]">
        {variant === 'rosette' && (
          <div className="flex items-center space-x-2">
            <span className="h-1 w-1 rounded-full bg-[#bba172]/60" />
            <svg
              className="w-5 h-5 text-[#d4b584]/80 transform rotate-45"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
            >
              <rect x="5" y="5" width="14" height="14" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span className="h-1 w-1 rounded-full bg-[#bba172]/60" />
          </div>
        )}

        {variant === 'arch' && (
          <svg
            className="w-8 h-5 text-[#d4b584]/80"
            viewBox="0 0 40 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          >
            <path d="M2 19 C 2 9, 10 2, 20 2 C 30 2, 38 9, 38 19" />
            <circle cx="20" cy="8" r="1.5" fill="currentColor" />
          </svg>
        )}

        {variant === 'jaali' && (
          <div className="flex space-x-1.5 opacity-70">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 rotate-45 border border-[#bba172]/70 bg-[#1c1a18]"
              />
            ))}
          </div>
        )}

        {label && (
          <span className="text-[10px] uppercase font-sans tracking-[0.3em] text-[#c2a37f]/90 px-2 font-medium">
            {label}
          </span>
        )}
      </div>

      {/* Right fine etched line with gradient fade */}
      <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#443c34] to-[#bba172]/40" />
    </div>
  );
}
