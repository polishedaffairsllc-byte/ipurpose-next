'use client';

import React from 'react';
import DashboardHeader from './DashboardHeader';
import DashboardSidebar from './DashboardSidebar';

interface LayoutShellProps {
  children: React.ReactNode;
}

export default function LayoutShell({ children }: LayoutShellProps) {
  return (
    <div className="min-h-screen bg-offWhite">
      <DashboardHeader />
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto py-8 px-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
