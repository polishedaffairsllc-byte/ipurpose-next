'use client';

export default function DashboardHeader() {
  return (
    <header className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-lavenderViolet/5 to-salmonPeach/5 backdrop-blur-xl"></div>
      <div className="relative border-b border-lavenderViolet/10" style={{
        boxShadow: '0 4px 20px rgba(156, 136, 255, 0.05)'
      }}>
        <div className="flex items-center justify-between px-4 sm:px-6 md:px-8 lg:px-10 py-4 sm:py-5">
          {/* Page Title / Breadcrumb Area */}
          <div className="flex items-center gap-3 sm:gap-4">
            <h2 className="font-marcellus text-lg sm:text-xl md:text-2xl text-warmCharcoal">Dashboard</h2>
          </div>

          {/* Right side: Profile + Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Notifications */}
            <button 
              className="w-9 sm:w-11 h-9 sm:h-11 rounded-2xl bg-gradient-to-br from-lavenderViolet/10 to-salmonPeach/10 hover:from-lavenderViolet/20 hover:to-salmonPeach/20 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-lavenderViolet/30"
              style={{ boxShadow: '0 4px 12px rgba(156, 136, 255, 0.1)' }}
              aria-label="Notifications"
            >
              <span className="text-lg sm:text-xl">🔔</span>
            </button>
            
            {/* Profile Avatar */}
            <button 
              className="w-9 sm:w-11 h-9 sm:h-11 bg-gradient-to-br from-salmonPeach via-lavenderViolet to-indigoDeep rounded-2xl flex items-center justify-center text-white font-semibold text-xs sm:text-base cursor-pointer hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-lavenderViolet/40"
              style={{ boxShadow: '0 6px 20px rgba(156, 136, 255, 0.25), 0 0 15px rgba(252, 196, 183, 0.15)' }}
              aria-label="User profile"
            >
              U
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}