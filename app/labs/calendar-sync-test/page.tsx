"use client";

import CalendarOperationalClient from "@/app/systems/components/CalendarOperationalClient";
import Card from "@/app/components/Card";
import SectionHeading from "@/app/components/SectionHeading";

export default function CalendarSyncTestPage() {
  return (
    <main className="min-h-screen bg-neutral-50 py-12">
      <div className="container mx-auto max-w-6xl px-6 space-y-8">
        <div className="space-y-2 text-center">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase text-warmCharcoal/60">Labs / QA Harness</p>
          <h1 className="text-3xl font-marcellus text-warmCharcoal">Calendar Sync Test Harness</h1>
          <p className="text-base text-warmCharcoal/70">
            This page renders the exact Calendar Sync v1 operational client without auth gating so we can run automated diagnostics.
          </p>
        </div>

        <Card className="p-6">
          <SectionHeading level="h2">Embedded CalendarOperationalClient</SectionHeading>
          <p className="text-sm text-warmCharcoal/70 mb-6">
            All instrumentation from the systems page (yellow debug box, console logs, blue mount markers) is preserved here for verification.
          </p>
          <CalendarOperationalClient />
        </Card>
      </div>
    </main>
  );
}
