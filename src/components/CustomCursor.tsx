'use client';

import React, { useEffect, useState, useRef } from 'react';

export default function CustomCursor() {
  const [mounted, setMounted] = useState(false);
  const [cursorType, setCursorType] = useState<'default' | 'pointer' | 'view-object' | 'spotlight'>('default');
  const [isVisible, setIsVisible] = useState(false);

  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const pos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });

  useEffect(() => {
    // Only enable custom cursor for precise pointing devices (mouse/trackpad), not touchscreen
    if (typeof window === 'undefined') return;
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!hasFinePointer) return;

    setMounted(true);

    const onMouseMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      // Check what is currently hovered
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const viewObjectEl = target.closest('[data-cursor="view-object"]');
      if (viewObjectEl) {
        setCursorType('view-object');
        return;
      }

      const spotlightEl = target.closest('[data-cursor="spotlight"]');
      if (spotlightEl) {
        setCursorType('spotlight');
        return;
      }

      const interactiveEl = target.closest('a, button, [role="button"], input, select, textarea, [data-cursor="pointer"]');
      if (interactiveEl) {
        setCursorType('pointer');
        return;
      }

      setCursorType('default');
    };

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    // Smooth lerp loop for the outer ring
    let animId: number;
    const loop = () => {
      // Lerp ring towards mouse position
      const factor = 0.18;
      ringPos.current.x += (pos.current.x - ringPos.current.x) * factor;
      ringPos.current.y += (pos.current.y - ringPos.current.y) * factor;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%)`;
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      cancelAnimationFrame(animId);
    };
  }, [isVisible]);

  if (!mounted || !isVisible) return null;

  return (
    <>
      {/* Central Precision Dot */}
      <div
        ref={dotRef}
        className={`pointer-events-none fixed top-0 left-0 z-50 rounded-full transition-opacity duration-300 ${
          cursorType === 'view-object'
            ? 'opacity-0'
            : 'h-1.5 w-1.5 bg-[#d4b584] shadow-[0_0_8px_rgba(212,181,132,0.8)]'
        }`}
      />

      {/* Outer Floating Ring / Interactive Badge */}
      <div
        ref={ringRef}
        className={`pointer-events-none fixed top-0 left-0 z-50 flex items-center justify-center transition-all duration-300 ease-out ${
          cursorType === 'view-object'
            ? 'h-22 w-22 rounded-full border border-[#d4b584]/60 bg-[#0e0d0c]/85 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-md'
            : cursorType === 'pointer'
            ? 'h-10 w-10 rounded-full border border-[#d4b584]/70 bg-[#bba172]/10 scale-110'
            : cursorType === 'spotlight'
            ? 'h-14 w-14 rounded-full border border-[#d4b584]/40 bg-radial from-[#d4b584]/15 to-transparent'
            : 'h-7 w-7 rounded-full border border-[#bba172]/40'
        }`}
      >
        {cursorType === 'view-object' && (
          <span className="text-[9px] font-sans font-medium tracking-[0.22em] text-[#f4ecdf] uppercase text-center px-1 leading-tight">
            VIEW<br />OBJECT
          </span>
        )}
      </div>
    </>
  );
}
