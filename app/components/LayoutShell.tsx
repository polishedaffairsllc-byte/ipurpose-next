'use client';

import React from 'react';
import DashboardHeader from './DashboardHeader';

interface LayoutShellProps {
  children: React.ReactNode;
}

export default function LayoutShell({ children }: LayoutShellProps) {
  return (
    <div className="min-h-screen bg-offWhite">
      <DashboardHeader />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto py-8 px-6">
          {children}
        </div>
      </main>
    </div>
  );
}
