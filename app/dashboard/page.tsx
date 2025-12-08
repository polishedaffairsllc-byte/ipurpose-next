"use client";

import ProtectedRoute from "@/app/components/ProtectedRoute";
import IPHeading from "@/app/components/IPHeading";
import IPSection from "@/app/components/IPSection";
import IPCard from "@/app/components/IPCard";
import IPButton from "@/app/components/IPButton";
import LogoutButton from "@/app/components/LogoutButton";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen w-full bg-white text-ip-heading flex flex-col">

        {/* HEADER */}
        <header className="w-full border-b border-ip-border px-6 py-4 flex justify-between items-center">
          <IPHeading size="lg">Dashboard</IPHeading>
          <LogoutButton />
        </header>

        {/* MAIN */}
        <main className="flex-1 px-6 py-10 space-y-12">

          {/* Intro */}
          <IPSection>
            <IPHeading size="md">Your iPurpose Home Base</IPHeading>
            <p className="mt-4 text-lg text-ip-text">
              Track your progress, navigate your program, and see your next aligned steps.
            </p>
          </IPSection>

          {/* Modules */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Soul */}
            <IPCard>
              <IPHeading size="sm">Soul Alignment</IPHeading>
              <p className="mt-2 text-ip-text">
                Your foundational soulwork, clarity prompts, and reflection practices.
              </p>
              <IPButton className="mt-4">Go to Soul</IPButton>
            </IPCard>

            {/* Systems */}
            <IPCard>
              <IPHeading size="sm">Systems</IPHeading>
              <p className="mt-2 text-ip-text">
                Structure your workflows, offers, and priority systems.
              </p>
              <IPButton className="mt-4" variant="secondary">
                Go to Systems
              </IPButton>
            </IPCard>

            {/* AI */}
            <IPCard>
              <IPHeading size="sm">AI Tools</IPHeading>
              <p className="mt-2 text-ip-text">
                Automate aligned tasks, build prompts, and expand your capacity.
              </p>
              <IPButton className="mt-4" variant="champagne">
                Go to AI
              </IPButton>
            </IPCard>

          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
