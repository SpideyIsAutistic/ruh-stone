'use client';

import React, { useEffect, useState, useRef } from 'react';

export default function CustomCursor() {
  const [mounted, setMounted] = useState(false);
  const [cursorType, setCursorType] = useState<'default' | 'pointer' | 'view-object'>('default');
  const [isVisible, setIsVisible] = useState(false);

  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const pos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!hasFinePointer) return;

    setMounted(true);

    const onMouseMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const viewObjectEl = target.closest('[data-cursor="view-object"]');
      if (viewObjectEl) {
        setCursorType('view-object');
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

    let animId: number;
    const loop = () => {
      const factor = 0.2;
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
        className={`pointer-events-none fixed top-0 left-0 z-50 rounded-full transition-opacity duration-200 ${
          cursorType === 'view-object'
            ? 'opacity-0'
            : 'h-1.5 w-1.5 bg-[#6E3027]'
        }`}
      />

      {/* Outer Floating Ring / Architectural Badge */}
      <div
        ref={ringRef}
        className={`pointer-events-none fixed top-0 left-0 z-50 flex items-center justify-center transition-all duration-300 ease-out ${
          cursorType === 'view-object'
            ? 'h-20 w-20 rounded-full border border-[#9B5540] bg-[#F2EBDD]/95 text-[#241A14] shadow-[0_8px_24px_rgba(36,26,20,0.18)] backdrop-blur-sm'
            : cursorType === 'pointer'
            ? 'h-9 w-9 rounded-full border border-[#9B5540] bg-[#B98B62]/10 scale-110'
            : 'h-6 w-6 rounded-full border border-[#B98B62]/50'
        }`}
      >
        {cursorType === 'view-object' && (
          <span className="text-[9px] font-sans font-semibold tracking-[0.2em] text-[#241A14] uppercase text-center px-1 leading-tight">
            VIEW<br />OBJECT
          </span>
        )}
      </div>
    </>
  );
}
