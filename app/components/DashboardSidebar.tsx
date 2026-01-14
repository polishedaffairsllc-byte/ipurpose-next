'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: '📊' },
  { href: '/soul', label: 'Soul', icon: '✨' },
  { href: '/systems', label: 'Systems', icon: '⚙️' },
  { href: '/ai', label: 'AI Coach', icon: '🤖' },
  { href: '/insights', label: 'Insights', icon: '💡' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // Hide on public pages
  const isPublicPage = pathname === '/' || pathname === '/login' || pathname === '/signup' || pathname === '/about' || pathname === '/contact' || pathname === '/privacy' || pathname === '/terms';
  
  if (isPublicPage) return null;

  return (
    <nav className="w-full relative border-b border-lavenderViolet/10">
      <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-lavenderViolet/5 to-salmonPeach/5 backdrop-blur-xl"></div>
      <div className="relative h-full px-6 py-4 flex items-center justify-between" style={{
        boxShadow: '0 4px 20px rgba(156, 136, 255, 0.05)'
      }}>
        {/* Logo Section */}
        <Link href="/dashboard" className="flex items-center gap-2 group shrink-0">
          <img 
            src="/images/my-logo.png" 
            alt="iPurpose Logo" 
            className="group-hover:scale-105 transition-transform duration-200"
            style={{ height: '60px' }}
          />
          <div>
            <h1 className="text-lg font-italiana bg-gradient-to-r from-lavenderViolet to-indigoDeep bg-clip-text text-transparent">iPurpose</h1>
          </div>
        </Link>
        {/* Navigation Items */}
        <div className="flex items-center gap-3 flex-1 justify-around">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`
                  flex items-center gap-2 px-5 py-2.5 rounded-xl font-italiana text-sm font-semibold
                  transition-all duration-150 focus:outline-none cursor-pointer
                  ${isActive ? 'ipurpose-button-gold' : 'ipurpose-button-gold opacity-60 hover:opacity-100'}
                `}
              >
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Logout */}
        <div className="shrink-0">
          <Link
            href="/api/auth/logout"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-base font-medium text-warmCharcoal/70 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
          >
            <span>Logout</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
