
import React from "react";
import ErrorBoundary from "@/app/components/ErrorBoundary";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <div className="flex flex-col h-screen bg-dashboard overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-8 md:py-10">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
