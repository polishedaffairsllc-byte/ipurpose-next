'use client';

import { useEffect, useRef } from 'react';

export default function DynamicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const drawGradientMesh = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Create gradient mesh effect
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      
      // Animate color positions
      const t = time * 0.001; // Slow movement
      
      gradient.addColorStop(0, `rgba(250, 245, 255, ${0.95 + Math.sin(t) * 0.05})`);
      gradient.addColorStop(0.3 + Math.sin(t * 0.5) * 0.1, `rgba(255, 249, 245, ${0.92 + Math.cos(t * 1.2) * 0.05})`);
      gradient.addColorStop(0.6 + Math.cos(t * 0.7) * 0.1, `rgba(255, 251, 240, ${0.90 + Math.sin(t * 0.8) * 0.05})`);
      gradient.addColorStop(1, `rgba(250, 245, 255, ${0.88 + Math.cos(t * 1.5) * 0.05})`);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Add radial overlays that pulse
      const createRadialOverlay = (x: number, y: number, color: string, phase: number) => {
        const radius = 300 + Math.sin(time * 0.001 * phase) * 100;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
        grad.addColorStop(0, color);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      };

      createRadialOverlay(width * 0.2, height * 0.3, `rgba(156, 136, 255, ${0.03 + Math.sin(t) * 0.02})`, 1);
      createRadialOverlay(width * 0.8, height * 0.7, `rgba(252, 196, 183, ${0.03 + Math.cos(t * 1.3) * 0.02})`, 1.5);
      createRadialOverlay(width * 0.5, height * 0.5, `rgba(245, 232, 199, ${0.02 + Math.sin(t * 0.8) * 0.01})`, 2);
    };

    const animate = () => {
      time++;
      drawGradientMesh();
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: -10 }}
    />
  );
}
