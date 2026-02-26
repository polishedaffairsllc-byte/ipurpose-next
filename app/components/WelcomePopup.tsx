
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function WelcomePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setIsOpen(true), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted || !isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40"
        onClick={() => setIsOpen(false)}
      />

      {/* Popup - Full Screen Container */}
      <div 
        className="fixed inset-0 z-50 w-screen h-screen overflow-hidden" 
        onClick={() => setIsOpen(false)}
      >
        {/* Modal Inner - Scrollable Content */}
        <div
          className="w-full h-full backdrop-blur-md z-50 flex flex-col items-center py-24 px-4 relative overflow-y-auto overflow-x-hidden"
          style={{
            background: 'rgba(0,0,0,0.92)',
            zIndex: 50,
            borderRadius: 0,
            opacity: 0.92,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close welcome popup"
            style={{
              position: 'fixed',
              top: '1rem',
              right: '1rem',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              background: 'rgba(255, 255, 255, 0.1)',
              cursor: 'pointer',
              fontSize: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255, 255, 255, 0.8)',
              zIndex: 100,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            }}
          >
            ✕
          </button>

          {/* Modal Content */}
          <div className="w-full flex flex-col items-center text-center px-4">
            <p className="font-italiana mb-4 text-3xl sm:text-5xl lg:text-8xl" style={{ color: '#ffffff', fontFamily: 'Italiana, serif' }}>
              Who am I really…
            </p>
            <p className="font-italiana mb-2 text-4xl sm:text-6xl lg:text-9xl" style={{ color: '#ffffff', fontFamily: 'Italiana, serif' }}>
              Welcome to iPurpose<sup style={{ fontSize: '0.4em' }}>™</sup>
            </p>
            <p className="mb-6 leading-relaxed font-italiana text-base sm:text-xl lg:text-4xl" style={{ color: '#ffffff', fontFamily: 'Italiana, serif' }}>
              We're going to help you understand who you are and how you're meant to move.
              <br />
              There's no wrong place to start. Most people begin with our free Clarity Check, or you can explore Discover first.
            </p>
            {/* Buttons */}
            <div className="w-full max-w-4xl flex flex-col items-center gap-3 sm:gap-4">
              <Link
                href="/clarity-check"
                onClick={() => setIsOpen(false)}
                className="inline-block px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 rounded-full font-italiana font-bold text-center hover:opacity-90 transition-opacity text-sm sm:text-xl lg:text-4xl"
                style={{ background: '#9c88ff', color: '#000000', fontFamily: 'Italiana, serif' }}
                aria-label="Take the Clarity Check assessment"
              >
                Take the Clarity Check
              </Link>
              <Link
                href="/discover"
                onClick={() => setIsOpen(false)}
                className="inline-block px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 rounded-full font-italiana font-bold text-center hover:opacity-90 transition-opacity text-sm sm:text-xl lg:text-4xl"
                style={{ background: '#fcc4b7', color: '#000000', fontFamily: 'Italiana, serif' }}
                aria-label="Explore Discover section"
              >
                Explore Discover
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="inline-block px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 rounded-full font-italiana font-bold text-center hover:opacity-90 transition-opacity text-sm sm:text-xl lg:text-4xl"
                style={{ background: '#e6c87c', color: '#000000', fontFamily: 'Italiana, serif' }}
                aria-label="Dismiss welcome popup"
              >
                I'll explore on my own
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

