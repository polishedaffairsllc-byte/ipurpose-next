'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSyncExternalStore } from 'react';

const subscribe = () => () => undefined;

const publicRoutes = new Set([
  '/',
  '/about',
  '/discover',
  '/program',
  '/clarity-check',
  '/delete-account',
  '/signup',
  '/login',
  '/orientation',
  '/starter-pack',
  '/ai-blueprint',
  '/ipurpose-6-week',
  '/labs',
]);

export default function FooterAuthCta() {
  const pathname = usePathname();
  const isAuthenticated = useSyncExternalStore(
    subscribe,
    () => document.cookie.includes('ipurpose_logged_in'),
    () => false,
  );

  if (!isAuthenticated) return null;

  const isDeepenRoute = pathname === '/deepen' || pathname.startsWith('/deepen/');
  const isAcceleratorRoute = pathname === '/accelerator' || pathname.startsWith('/accelerator/');
  const isPremiumRoute = isDeepenRoute
    || isAcceleratorRoute
    || pathname === '/systems'
    || pathname.startsWith('/systems/')
    || pathname === '/insights'
    || pathname.startsWith('/insights/')
    || pathname === '/community'
    || pathname.startsWith('/community/');
  if (isAcceleratorRoute) {
    return <FooterCta href="/deepen" label="✦ Deepen Your Purpose" color="#9C88FF" />;
  }

  if (isPremiumRoute) {
    return <FooterCta href="/accelerator" label="✦ Ready to Accelerate" color="#E6C87C" />;
  }

  if (!publicRoutes.has(pathname)) {
    return <FooterCta href="/deepen" label="✦ Deepen Your Experience" color="#9C88FF" />;
  }

  return null;
}

function FooterCta({ href, label, color }: { href: string; label: string; color: string }) {
  return (
    <div className="w-full flex justify-center py-10" style={{ backgroundColor: '#4B4E6D' }}>
      <Link
        href={href}
        className="px-6 sm:px-8 py-3 sm:py-4 rounded-full font-marcellus text-white text-center hover:opacity-90 transition-opacity"
        style={{ background: `linear-gradient(to right, ${color}, transparent)`, fontSize: '35px', color: '#FFFFFF' }}
      >
        {label}
      </Link>
    </div>
  );
}
