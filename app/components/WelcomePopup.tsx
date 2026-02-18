
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
              top: '2rem',
              right: '2rem',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              background: 'rgba(255, 255, 255, 0.1)',
              cursor: 'pointer',
              fontSize: '2rem',
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
          <div className="w-full flex flex-col items-center text-center">
            <p className="font-italiana mb-4" style={{ color: '#ffffff', fontSize: '128px', fontFamily: 'Italiana, serif' }}>
              Who am I really…
            </p>
            <p className="font-italiana mb-2" style={{ color: '#ffffff', fontSize: '160px', fontFamily: 'Italiana, serif' }}>
              Welcome to iPurpose<sup style={{ fontSize: '0.4em' }}>™</sup>
            </p>
            <p className="mb-6 leading-relaxed font-italiana" style={{ color: '#ffffff', fontSize: '72px', fontFamily: 'Italiana, serif' }}>
              We're going to help you understand who you are and how you're meant to move.
              <br />
              There's no wrong place to start. Most people begin with our free Clarity Check, or you can explore Discover first.
            </p>
            {/* Buttons */}
            <div className="w-full max-w-4xl flex flex-col items-center">
              <Link
                href="/clarity-check"
                onClick={() => setIsOpen(false)}
                className="inline-block px-8 py-4 rounded-full font-italiana font-bold text-center hover:opacity-90 transition-opacity"
                style={{ background: '#9c88ff', color: '#000000', fontSize: '72px', fontFamily: 'Italiana, serif' }}
                aria-label="Take the Clarity Check assessment"
              >
                Take the Clarity Check
              </Link>
              <br />
              <Link
                href="/discover"
                onClick={() => setIsOpen(false)}
                className="inline-block px-8 py-4 rounded-full font-italiana font-bold text-center hover:opacity-90 transition-opacity"
                style={{ background: '#fcc4b7', color: '#000000', fontSize: '72px', fontFamily: 'Italiana, serif' }}
                aria-label="Explore Discover section"
              >
                Explore Discover
              </Link>
              <br />
              <button
                onClick={() => setIsOpen(false)}
                className="inline-block px-8 py-4 rounded-full font-italiana font-bold text-center hover:opacity-90 transition-opacity"
                style={{ background: '#e6c87c', color: '#000000', fontSize: '72px', fontFamily: 'Italiana, serif' }}
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

