'use client';

import { useEffect, useRef, useState } from 'react';

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
  const [isClient, setIsClient] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
    
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

  if (!isClient) {
    return <div className={`relative overflow-hidden ${className} bg-gradient-to-br from-lavenderViolet/20 to-salmonPeach/20`} />;
  }

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ minHeight: '100vh' }}
    >
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          transform: `translateY(${offset}px)`,
          transition: 'transform 0.1s linear',
        }}
      />

      {overlay && (
        <div 
          className="absolute inset-0 z-10"
          style={{
            background: 'linear-gradient(to bottom, rgba(250, 245, 255, 0.3) 0%, rgba(250, 245, 255, 0.7) 100%)'
          }}
        />
      )}
    </div>
  );
}
