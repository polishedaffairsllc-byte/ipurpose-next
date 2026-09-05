import Link from 'next/link';
import FooterAuthCta from './FooterAuthCta';

export default function Footer() {
  return (
    <>
      <FooterAuthCta />

      <footer className="relative border-t border-white/10" style={{ zIndex: 10, backgroundColor: '#4b4e6d' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        {/* Footer Grid - Horizontal Layout */}
        <div className="flex flex-col items-center gap-8 mb-8">
          
          {/* Brand Anchor */}
          <div className="text-center">
            <Link 
              href="/" 
              className="inline-block hover:opacity-80 transition-colors"
            >
              <img 
                src="/images/my-logo.png" 
                alt="iPurpose Logo" 
                style={{ height: '160px', width: 'auto', margin: '0 auto', display: 'block' }}
              />
              <h3 className="font-semibold tracking-wide" style={{ fontSize: '40px', fontFamily: 'Italiana', color: '#FFFFFF', marginBottom: '0', marginTop: '0' }}>
                iPurpose<span style={{ fontSize: '0.5em', verticalAlign: 'super' }}>™</span>
              </h3>
            </Link>
            <p className="leading-relaxed" style={{ fontSize: '28px', fontFamily: 'Marcellus', color: 'rgba(255, 255, 255, 0.9)', marginTop: '0' }}>
              Where inner alignment becomes coherent action.
            </p>
          </div>

          {/* Navigation Links - Horizontal */}
          <nav className="flex flex-wrap justify-center items-center" style={{ gap: '1.5rem' }} aria-label="Footer navigation">
            <Link
              href="/"
              className="hover:opacity-80 transition-colors"
              style={{ fontSize: '28px', color: '#FFFFFF' }}
            >
              Home
            </Link>
            <span style={{ fontSize: '28px', color: 'rgba(255, 255, 255, 0.4)', margin: '0 0.5rem' }}>|</span>
            <Link
              href="/discover"
              className="hover:opacity-80 transition-colors"
              style={{ fontSize: '28px', color: '#FFFFFF' }}
            >
              Discover
            </Link>
            <span style={{ fontSize: '28px', color: 'rgba(255, 255, 255, 0.4)', margin: '0 0.5rem' }}>|</span>
            <Link
              href="/about"
              className="hover:opacity-80 transition-colors"
              style={{ fontSize: '28px', color: '#FFFFFF' }}
            >
              About
            </Link>
            <span style={{ fontSize: '28px', color: 'rgba(255, 255, 255, 0.4)', margin: '0 0.5rem' }}>|</span>
            <Link
              href="/clarity-check"
              className="hover:opacity-80 transition-colors"
              style={{ fontSize: '28px', color: '#FFFFFF' }}
            >
              Clarity Check
            </Link>
            <span style={{ fontSize: '28px', color: 'rgba(255, 255, 255, 0.4)', margin: '0 0.5rem' }}>|</span>
            <Link
              href="/program"
              className="hover:opacity-80 transition-colors"
              style={{ fontSize: '28px', color: '#FFFFFF' }}
            >
              Accelerator
            </Link>
            
            <span style={{ fontSize: '28px', color: 'rgba(255, 255, 255, 0.4)', margin: '0 0.5rem' }}>|</span>
            
            <Link
              href="/privacy"
              className="hover:opacity-80 transition-colors"
              style={{ fontSize: '28px', color: '#FFFFFF' }}
            >
              Privacy Policy
            </Link>
            <span style={{ fontSize: '28px', color: 'rgba(255, 255, 255, 0.4)', margin: '0 0.5rem' }}>|</span>
            <Link
              href="/delete-account"
              className="hover:opacity-80 transition-colors"
              style={{ fontSize: '28px', color: '#FFFFFF' }}
            >
              Delete Account
            </Link>
            <span style={{ fontSize: '28px', color: 'rgba(255, 255, 255, 0.4)', margin: '0 0.5rem' }}>|</span>
            <Link
              href="/terms"
              className="hover:opacity-80 transition-colors"
              style={{ fontSize: '28px', color: '#FFFFFF' }}
            >
              Terms of Use
            </Link>
            <span style={{ fontSize: '28px', color: 'rgba(255, 255, 255, 0.4)', margin: '0 0.5rem' }}>|</span>
            <Link
              href="/disclaimer"
              className="hover:opacity-80 transition-colors"
              style={{ fontSize: '28px', color: '#FFFFFF' }}
            >
              Disclaimer
            </Link>
            
            <span style={{ fontSize: '28px', color: 'rgba(255, 255, 255, 0.4)', margin: '0 0.5rem' }}>|</span>
            
            <Link
              href="/support"
              className="hover:opacity-80 transition-colors"
              style={{ fontSize: '28px', color: '#FFFFFF' }}
            >
              Help Center
            </Link>
            <span style={{ fontSize: '28px', color: 'rgba(255, 255, 255, 0.4)', margin: '0 0.5rem' }}>|</span>
            <a
              href="/contact"
              className="hover:opacity-80 transition-colors"
              style={{ fontSize: '28px', color: '#FFFFFF' }}
            >
              Contact Us
            </a>
          </nav>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-8">
          {/* Footer Bottom - All Horizontal */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-6 text-center">
            <p style={{ fontSize: '28px', color: 'rgba(255, 255, 255, 0.9)' }}>
              © 2026 iPurpose. All rights reserved.
            </p>
            
            <span className="hidden md:inline" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>•</span>
            
            <p className="italic" style={{ fontSize: '26px', color: 'rgba(255, 255, 255, 0.9)' }}>
              This platform is designed to support—not replace—professional care.
            </p>
            
            <span className="hidden md:inline" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>•</span>
            
            <p style={{ fontSize: '24px', color: 'rgba(255, 255, 255, 0.8)' }}>
              Privacy-first by design
            </p>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
}
