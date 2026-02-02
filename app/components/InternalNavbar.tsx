'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Orientation' },
  { href: '/soul', label: 'Soul' },
  { href: '/systems', label: 'Systems' },
  { href: '/ai', label: 'Inner Compass' },
  { href: '/insights', label: 'Reflections' },
  { href: '/labs', label: 'Labs' },
  { href: '/community', label: 'Community' },
  { href: '/settings', label: 'Settings' },
];

export default function InternalNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  // Hide on public pages
  const isPublicPage = pathname === '/' || pathname === '/login' || pathname === '/signup' || pathname === '/about' || pathname === '/contact' || pathname === '/privacy' || pathname === '/terms' || pathname === '/discover' || pathname === '/clarity-check' || pathname === '/clarity-check-numeric' || pathname === '/program' || pathname === '/google-review' || pathname === '/info-session' || pathname === '/ipurpose-6-week' || pathname === '/starter-pack' || pathname === '/ai-blueprint';
  const isNavRoute = pathname === '/orientation' || pathname.startsWith('/orientation/') || pathname === '/learning-path' || pathname === '/ethics' || pathname === '/integration' || pathname === '/onboarding';
  
  if (isPublicPage || isNavRoute) return null;

  return (
    <>
      <header
        className="relative z-20 w-full flex items-center justify-between p-6 lg:p-12 border-b border-white/20 bg-black backdrop-blur-md"
        style={{ backgroundColor: "#000" }}
      >
      {/* Navigation Items */}
      <div className="flex items-center gap-3 flex-1 justify-center">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href;
          const gradients = [
            'linear-gradient(to right, #9C88FF, rgba(156, 136, 255, 0))',
            'linear-gradient(to right, #5B4BA6, rgba(91, 75, 166, 0))',
            'linear-gradient(to right, #E8967A, rgba(232, 150, 122, 0))',
            'linear-gradient(to right, #9C88FF, rgba(91, 75, 166, 0))',
            'linear-gradient(to right, #5B4BA6, rgba(91, 75, 166, 0))',
            'linear-gradient(to right, #E8967A, rgba(232, 150, 122, 0))',
          ];
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className="px-6 py-3 rounded-full font-italiana flex-1 text-center mx-2 hover:opacity-90 transition-opacity"
              style={{ 
                background: gradients[index % gradients.length], 
                fontSize: '24px', 
                color: '#FFFFFF',
                opacity: isActive ? 1 : 0.8
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Logout */}
      <form action="/api/auth/logout" method="post" className="mx-2">
        <button 
          type="submit" 
          className="px-6 py-3 rounded-full font-italiana hover:opacity-90 transition-opacity whitespace-nowrap"
          style={{ background: 'linear-gradient(to right, #E8967A, rgba(232, 150, 122, 0))', fontSize: '24px', color: '#FFFFFF' }}
        >
          Logout
        </button>
      </form>
    </header>
    </>
  );
}
