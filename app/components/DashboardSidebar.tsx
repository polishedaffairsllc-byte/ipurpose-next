'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

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

  return (
    <nav className="w-full relative border-b border-lavenderViolet/10">
      <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-lavenderViolet/5 to-salmonPeach/5 backdrop-blur-xl"></div>
      <div className="relative h-full px-6 py-4 flex items-center justify-between" style={{
        boxShadow: '0 4px 20px rgba(156, 136, 255, 0.05)'
      }}>
        {/* Logo Section */}
        <Link href="/dashboard" className="flex items-center gap-3 group shrink-0">
          <div className="w-10 h-10 bg-gradient-to-br from-lavenderViolet via-indigoDeep to-salmonPeach rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200" style={{
            boxShadow: '0 4px 12px rgba(156, 136, 255, 0.25)'
          }}>
            <span className="text-lg font-italiana text-white">iP</span>
          </div>
          <div>
            <h1 className="text-lg font-italiana bg-gradient-to-r from-lavenderViolet to-indigoDeep bg-clip-text text-transparent">iPurpose</h1>
          </div>
        </Link>

        {/* Navigation Items */}
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-montserrat text-sm font-medium
                  transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-lavenderViolet/30
                  ${
                    isActive
                      ? 'bg-gradient-to-r from-lavenderViolet/15 to-salmonPeach/10 text-indigoDeep border border-lavenderViolet/20'
                      : 'text-warmCharcoal/70 hover:bg-gradient-to-r hover:from-lavenderViolet/5 hover:to-salmonPeach/5 hover:text-indigoDeep'
                  }
                `}
                style={isActive ? { boxShadow: '0 2px 8px rgba(156, 136, 255, 0.1)' } : {}}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Logout */}
        <div className="shrink-0">
        {/* Logout */}
        <div className="shrink-0">
          <Link
            href="/api/auth/logout"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-warmCharcoal/70 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
          >
            <span>Logout</span>
          </Link>
        </div>
  );
}
