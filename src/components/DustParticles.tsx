'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  vx: number;
  vy: number;
  alpha: number;
  baseAlpha: number;
  alphaSpeed: number;
  amberHue: number;
}

export default function DustParticles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates and disturbance
    const mouse = {
      x: -1000,
      y: -1000,
      radius: 120,
      prevX: -1000,
      prevY: -1000,
      speed: 0,
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - mouse.x;
      const dy = e.clientY - mouse.y;
      mouse.speed = Math.min(Math.sqrt(dx * dx + dy * dy), 25);
      mouse.prevX = mouse.x;
      mouse.prevY = mouse.y;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
      mouse.speed = 0;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Initialize ambient stone dust particles
    const particleCount = Math.min(Math.floor((width * height) / 14000), 95);
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const size = Math.random() * 1.8 + 0.6;
      const baseAlpha = Math.random() * 0.35 + 0.12;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        baseX: Math.random() * width,
        baseY: Math.random() * height,
        size,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -Math.random() * 0.35 - 0.08, // gentle upward thermal drift
        alpha: baseAlpha,
        baseAlpha,
        alphaSpeed: (Math.random() * 0.01 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
        amberHue: Math.floor(Math.random() * 20) + 35, // warm golden amber 35-55
      });
    }

    let isVisible = true;
    const handleVisibility = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Render each subtle grain of dust
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Natural thermal drift
        p.x += p.vx;
        p.y += p.vy;

        // Subtle alpha breathing (catching light)
        p.alpha += p.alphaSpeed;
        if (p.alpha > p.baseAlpha + 0.18 || p.alpha < p.baseAlpha - 0.08) {
          p.alphaSpeed = -p.alphaSpeed;
        }

        // Mouse disturbance - gentle fluid displacement
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius) {
          const force = (1 - dist / mouse.radius) * 1.5;
          const angle = Math.atan2(dy, dx);
          // Gently push particle away along the disturbance vector
          p.x += Math.cos(angle) * force * (1 + mouse.speed * 0.1);
          p.y += Math.sin(angle) * force * (1 + mouse.speed * 0.1);
          // Highlight dust speck catching sudden movement
          p.alpha = Math.min(p.alpha + 0.15, 0.7);
        }

        // Wrap around boundaries seamlessly
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.y > height + 10) p.y = -10;

        // Render warm golden speck
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        // Warm sandstone / gold dust tone
        ctx.fillStyle = `hsla(${p.amberHue}, 55%, 72%, ${Math.max(0, p.alpha)})`;
        ctx.fill();

        // Very faint halo for larger specks catching bright sun
        if (p.size > 1.4) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.amberHue}, 60%, 80%, ${Math.max(0, p.alpha * 0.18)})`;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-20 h-full w-full opacity-70"
    />
  );
}
