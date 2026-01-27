
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
          <div className="w-full flex flex-col items-center mt-16">
            <h2 className="text-2xl font-marcellus mb-4" style={{ color: '#ffffff' }}>
              Welcome to iPurpose
            </h2>
            <p className="mb-6 leading-relaxed" style={{ color: '#ffffff' }}>
              There's no wrong place to start. Most people begin with our free Clarity Check, or you can explore Discover first.
            </p>
            {/* Buttons */}
            <div className="space-y-3 w-full max-w-md">
              <Link
                href="/clarity-check"
                onClick={() => setIsOpen(false)}
                className="block w-full bg-lavenderViolet font-marcellus py-3 px-4 rounded hover:opacity-90 transition text-center"
                style={{ color: '#ffffff' }}
                aria-label="Take the Clarity Check assessment"
              >
                Take the Clarity Check
              </Link>
              <Link
                href="/discover"
                onClick={() => setIsOpen(false)}
                className="block w-full border-2 border-lavenderViolet font-marcellus py-3 px-4 rounded hover:bg-lavenderViolet/5 transition text-center"
                style={{ color: '#ffffff' }}
                aria-label="Explore Discover section"
              >
                Explore Discover
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="block w-full text-warmCharcoal/70 font-marcellus py-3 px-4 rounded hover:bg-warmCharcoal/5 transition text-center"
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

