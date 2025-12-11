'use client';

export default function DashboardHeader() {
  return (
    <header className="bg-white/60 backdrop-blur-xl border-b border-lavenderViolet/10 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 lg:px-10">
        {/* Page Title / Breadcrumb Area */}
        <div className="flex items-center gap-4">
          <h2 className="font-marcellus text-xl text-warmCharcoal">Dashboard</h2>
        </div>

        {/* Right side: Profile + Actions */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="w-10 h-10 rounded-full bg-lavenderViolet/10 hover:bg-lavenderViolet/20 flex items-center justify-center transition-colors">
            <span className="text-lg">🔔</span>
          </button>
          
          {/* Profile Avatar */}
          <div className="w-10 h-10 bg-gradient-to-br from-salmonPeach to-lavenderViolet rounded-full flex items-center justify-center text-warmCharcoal font-semibold cursor-pointer hover:ring-2 hover:ring-lavenderViolet/40 transition-all shadow-md">
            U
          </div>
        </div>
      </div>
    </header>
  );
}