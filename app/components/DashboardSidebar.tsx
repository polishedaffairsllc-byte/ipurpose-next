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
    <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-lavenderViolet/10 flex flex-col shadow-lg">
      {/* Logo Section */}
      <div className="px-6 py-8 border-b border-lavenderViolet/10">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-12 h-12 bg-sidebar-gradient rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
            <span className="text-2xl font-italiana text-white">iP</span>
          </div>
          <div>
            <h1 className="text-xl font-italiana text-warmCharcoal">iPurpose</h1>
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
                transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigoDeep/40
                ${
                  isActive
                    ? 'bg-nav-active text-indigoDeep shadow-sm border border-lavenderViolet/20'
                    : 'text-warmCharcoal/70 hover:bg-lavenderViolet/5 hover:text-indigoDeep'
                }
              `}
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
    </aside>
  );
}
