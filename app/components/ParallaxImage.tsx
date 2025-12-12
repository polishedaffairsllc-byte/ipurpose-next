'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

interface ParallaxImageProps {
  src: string;
  alt: string;
  speed?: number; // 0.1 to 1.0, lower = slower parallax
  className?: string;
  overlay?: boolean;
}

export default function ParallaxImage({ 
  src, 
  alt, 
  speed = 0.5,
  className = '',
  overlay = true
}: ParallaxImageProps) {
  const [offset, setOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const scrollPosition = window.scrollY + window.innerHeight;
      const elementPosition = rect.top + window.scrollY;
      
      // Calculate parallax offset
      if (scrollPosition > elementPosition && rect.top < window.innerHeight) {
        const offset = (window.scrollY - elementPosition) * speed;
        setOffset(offset);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial calculation

    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
    >
      <div
        style={{
          transform: `translateY(${offset}px)`,
          transition: 'transform 0.1s linear',
        }}
        className="relative w-full h-full scale-110" // Scale up to prevent gaps
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
      </div>

      {overlay && (
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(250, 245, 255, 0.3) 0%, rgba(250, 245, 255, 0.7) 100%)'
          }}
        />
      )}
    </div>
  );
}
