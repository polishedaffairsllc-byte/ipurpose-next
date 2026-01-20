'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function FloatingLogo() {
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <style>{`
        @keyframes spinAxis {
          from {
            transform: rotateY(0deg);
          }
          to {
            transform: rotateY(360deg);
          }
        }
        .spinning-logo {
          animation: spinAxis 1s linear infinite;
        }
      `}</style>
      <Link 
        href="/" 
        className="fixed left-4 sm:left-6 top-4 sm:top-6 z-40 pointer-events-auto"
        aria-label="Return home"
      >
        <div className="flex flex-col items-center gap-0.5">
          <img 
            src="/images/my-logo.png" 
            alt="iPurpose Logo"
            className={`h-12 sm:h-16 w-auto display-block ${isHovered ? 'spinning-logo' : ''}`}
            loading="eager"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          />
          <div 
            className="text-xs font-semibold text-white rounded-full px-2 py-0.5 whitespace-nowrap"
            style={{ 
              background: 'linear-gradient(to right, #9C88FF, rgba(156, 136, 255, 0.3))'
            }}
          >
            Home
          </div>
        </div>
      </Link>
    </>
  );
}
