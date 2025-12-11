'use client';

import React from 'react';

export default function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 bg-indigoDeep text-offWhite shadow-lg">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side: Logo/Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-lavenderViolet rounded-full flex items-center justify-center font-italiana text-xl">
            iP
          </div>
          <h1 className="font-italiana text-2xl font-normal">iPurpose</h1>
        </div>

        {/* Right side: Profile circle */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-salmonPeach rounded-full flex items-center justify-center text-warmCharcoal font-semibold cursor-pointer hover:ring-2 hover:ring-lavenderViolet transition-all">
            U
          </div>
        </div>
      </div>
    </header>
  );
}