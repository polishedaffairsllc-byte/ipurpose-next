
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

      {/* Popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center w-screen h-screen">
        <div
          className="bg-black shadow-xl w-full h-full pt-20 px-0 pb-0 backdrop-blur-md z-50 flex flex-col justify-center items-center relative"
          style={{
            background: 'rgba(0,0,0,0.92)',
            zIndex: 50,
            width: '100vw',
            height: '100vh',
            borderRadius: 0,
            paddingTop: '5rem',
            paddingLeft: 0,
            paddingRight: 0,
            paddingBottom: 0,
            opacity: 0.92,
          }}
        >
          {/* Modal Content Wrapper to avoid overlap */}
          <div className="w-full flex flex-col items-center mt-16 text-center">
            <p className="font-italiana mb-4" style={{ color: '#ffffff', fontSize: '32px' }}>
              Who am I really…
            </p>
            <p className="font-italiana mb-2" style={{ color: '#ffffff', fontSize: '40px' }}>
              Welcome to iPurpose<sup style={{ fontSize: '0.4em' }}>™</sup>
            </p>
            <p className="mb-6 leading-relaxed font-italiana" style={{ color: '#ffffff', fontSize: '18px' }}>
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
                style={{ background: '#9c88ff', color: '#000000', fontSize: '18px' }}
                aria-label="Take the Clarity Check assessment"
              >
                Take the Clarity Check
              </Link>
              <br />
              <Link
                href="/discover"
                onClick={() => setIsOpen(false)}
                className="inline-block px-8 py-4 rounded-full font-italiana font-bold text-center hover:opacity-90 transition-opacity"
                style={{ background: '#fcc4b7', color: '#000000', fontSize: '18px' }}
                aria-label="Explore Discover section"
              >
                Explore Discover
              </Link>
              <br />
              <button
                onClick={() => setIsOpen(false)}
                className="inline-block px-8 py-4 rounded-full font-italiana font-bold text-center hover:opacity-90 transition-opacity"
                style={{ background: '#e6c87c', color: '#000000', fontSize: '18px' }}
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

