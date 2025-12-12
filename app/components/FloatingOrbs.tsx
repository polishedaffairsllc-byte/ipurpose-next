'use client';

import { useEffect, useRef } from 'react';

interface Orb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
}

export default function FloatingOrbs() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const orbsRef = useRef<Orb[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize orbs
    const colors = [
      'rgba(156, 136, 255, 0.15)', // lavender
      'rgba(252, 196, 183, 0.15)', // salmon
      'rgba(245, 232, 199, 0.15)', // gold
      'rgba(156, 136, 255, 0.08)',
      'rgba(252, 196, 183, 0.08)',
    ];

    orbsRef.current = Array.from({ length: 8 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 150 + 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random() * 0.3 + 0.1,
    }));

    // Track mouse
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      orbsRef.current.forEach((orb) => {
        // Move away from cursor
        const dx = orb.x - mouseRef.current.x;
        const dy = orb.y - mouseRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 200) {
          const force = (200 - distance) / 200;
          orb.vx += (dx / distance) * force * 0.2;
          orb.vy += (dy / distance) * force * 0.2;
        }

        // Apply velocity
        orb.x += orb.vx;
        orb.y += orb.vy;

        // Damping
        orb.vx *= 0.98;
        orb.vy *= 0.98;

        // Add gentle drift
        orb.vx += (Math.random() - 0.5) * 0.05;
        orb.vy += (Math.random() - 0.5) * 0.05;

        // Boundary bounce
        if (orb.x < -orb.size) orb.x = canvas.width + orb.size;
        if (orb.x > canvas.width + orb.size) orb.x = -orb.size;
        if (orb.y < -orb.size) orb.y = canvas.height + orb.size;
        if (orb.y > canvas.height + orb.size) orb.y = -orb.size;

        // Draw orb with gradient
        const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.size);
        gradient.addColorStop(0, orb.color);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
