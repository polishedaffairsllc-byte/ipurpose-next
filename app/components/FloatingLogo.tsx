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
        className="fixed left-6 z-50 block"
        aria-label="Back to home"
        style={{ top: '20px', maxWidth: '240px', cursor: 'pointer' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={{ textAlign: 'center' }}>
          <img 
            src="/images/my-logo.png" 
            alt="iPurpose Logo"
            className={isHovered ? 'spinning-logo' : ''}
            style={{ height: '120px', width: 'auto', display: 'block', margin: '0 auto' }}
            loading="eager"
          />
          <div 
            style={{ 
              background: 'linear-gradient(to right, #9C88FF, rgba(156, 136, 255, 0))', 
              padding: '6px 16px',
              borderRadius: '20px',
              marginTop: '-8px',
              display: 'inline-block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#FFFFFF'
            }}
          >
            Home
          </div>
        </div>
      </Link>
    </>
  );
}
