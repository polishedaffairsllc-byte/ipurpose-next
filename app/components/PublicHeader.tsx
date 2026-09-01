import Link from 'next/link';
import PublicHeaderAuthControls from './PublicHeaderAuthControls';

const publicLinks = [
  { href: '/discover', label: 'Discover', color: '#9C88FF' },
  { href: '/about', label: 'About', color: '#4B4E6D' },
  { href: '/clarity-check', label: 'Clarity Check', color: '#9C88FF' },
  { href: '/program', label: 'iPurpose Accelerator™', color: '#FCC4B7' },
];

export default function PublicHeader() {
  return (
    <header
      className="relative z-20 w-full border-b border-white/20 backdrop-blur-md"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
    >
      <div className="flex items-center justify-between gap-2 p-4 sm:p-6">
        <Link
          href="/"
          className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap"
          style={{
            background: 'linear-gradient(to right, #9C88FF, rgba(156, 136, 255, 0.3))',
            color: '#FFFFFF',
            fontSize: '40px',
          }}
          aria-label="Home"
        >
          Home
        </Link>

        <nav className="hidden lg:flex items-center justify-end gap-2" aria-label="Public navigation">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-italiana text-center hover:opacity-90 transition-opacity whitespace-nowrap"
              style={{
                background: `linear-gradient(to right, ${link.color}, transparent)`,
                color: '#FFFFFF',
                fontSize: '40px',
              }}
            >
              {link.label}
            </Link>
          ))}
          <PublicHeaderAuthControls />
        </nav>

        <details className="relative lg:hidden text-white">
          <summary
            className="cursor-pointer list-none p-2 hover:opacity-75 [&::-webkit-details-marker]:hidden"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </summary>
          <nav
            className="absolute right-0 top-full mt-2 min-w-56 border border-white/20 bg-black/95 p-4 shadow-xl"
            aria-label="Mobile public navigation"
          >
            <Link href="/" className="block px-4 py-2 text-sm hover:bg-white/10 rounded">
              Home
            </Link>
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-2 text-sm hover:bg-white/10 rounded"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-white/20 mt-2 pt-2">
              <PublicHeaderAuthControls mobile />
            </div>
          </nav>
        </details>
      </div>
    </header>
  );
}
