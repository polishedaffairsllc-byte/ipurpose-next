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
    <aside className="w-64 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-lavenderViolet/5 to-salmonPeach/5 backdrop-blur-xl"></div>
      <div className="relative h-full border-r border-lavenderViolet/10 flex flex-col" style={{
        boxShadow: '4px 0 20px rgba(156, 136, 255, 0.05)'
      }}>
        {/* Logo Section */}
        <div className="px-6 py-8 border-b border-lavenderViolet/10">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-14 h-14 bg-gradient-to-br from-lavenderViolet via-indigoDeep to-salmonPeach rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200" style={{
              boxShadow: '0 8px 24px rgba(156, 136, 255, 0.25), 0 0 20px rgba(252, 196, 183, 0.15)'
            }}>
              <span className="text-2xl font-italiana text-white">iP</span>
            </div>
            <div>
              <h1 className="text-xl font-italiana bg-gradient-to-r from-lavenderViolet to-indigoDeep bg-clip-text text-transparent">iPurpose</h1>
              <p className="text-xs text-warmCharcoal/60 font-montserrat">Your Portal</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl font-montserrat text-sm font-medium
                  transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-lavenderViolet/30
                  ${
                    isActive
                      ? 'bg-gradient-to-r from-lavenderViolet/15 to-salmonPeach/10 text-indigoDeep border border-lavenderViolet/20'
                      : 'text-warmCharcoal/70 hover:bg-gradient-to-r hover:from-lavenderViolet/5 hover:to-salmonPeach/5 hover:text-indigoDeep'
                  }
                `}
                style={isActive ? { boxShadow: '0 4px 12px rgba(156, 136, 255, 0.1)' } : {}}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-lavenderViolet/10">
          <Link
            href="/api/auth/logout"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-warmCharcoal/70 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
          >
            <span className="text-xl">🚪</span>
            <span>Logout</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
