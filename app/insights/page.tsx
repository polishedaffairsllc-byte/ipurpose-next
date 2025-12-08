"use client";

import ProtectedRoute from "@/app/components/ProtectedRoute";
import IPHeading from "@/app/components/IPHeading";
import IPSection from "@/app/components/IPSection";
import IPCard from "@/app/components/IPCard";
import IPButton from "@/app/components/IPButton";
import LogoutButton from "@/app/components/LogoutButton";

export default function InsightsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen w-full bg-white text-ip-heading flex flex-col">

        {/* HEADER */}
        <header className="w-full border-b border-ip-border px-6 py-4 flex justify-between items-center">
          <IPHeading size="lg">Insights</IPHeading>
          <LogoutButton />
        </header>

        {/* MAIN */}
        <main className="flex-1 px-6 py-10 space-y-12">

          <IPSection>
            <IPHeading size="md">Your Aligned Insights</IPHeading>
            <p className="mt-4 text-lg text-ip-text">
              Explore reflective insights, trends, and clarity reports that support your growth.
            </p>
          </IPSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            <IPCard>
              <IPHeading size="sm">Daily Reflection</IPHeading>
              <p className="mt-2 text-ip-text">Track your emotional and energetic patterns.</p>
              <IPButton className="mt-4">Open Reflection</IPButton>
            </IPCard>

            <IPCard>
              <IPHeading size="sm">Clarity Trends</IPHeading>
              <p className="mt-2 text-ip-text">See the patterns emerging in your priorities.</p>
              <IPButton className="mt-4" variant="secondary">View Trends</IPButton>
            </IPCard>

            <IPCard>
              <IPHeading size="sm">Progress Summary</IPHeading>
              <p className="mt-2 text-ip-text">Review your progress across Soul, Systems, and AI.</p>
              <IPButton className="mt-4" variant="champagne">View Summary</IPButton>
            </IPCard>

            <IPCard>
              <IPHeading size="sm">Alignment Report</IPHeading>
              <p className="mt-2 text-ip-text">Receive personalized guidance based on your activity.</p>
              <IPButton className="mt-4" variant="ghost">View Report</IPButton>
            </IPCard>

          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
