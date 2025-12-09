"use client";

import ProtectedRoute from "@/app/components/ProtectedRoute";
import IPHeading from "@/app/components/IPHeading";
import IPSection from "@/app/components/IPSection";
import IPCard from "@/app/components/IPCard";
import IPButton from "@/app/components/IPButton";
import LogoutButton from "@/app/components/LogoutButton";

export default function SoulPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen w-full bg-white text-ip-heading flex flex-col">

        {/* Header */}
        <header className="w-full border-b border-ip-border px-6 py-4 flex justify-between items-center">
          <IPHeading size="lg">Soul Alignment</IPHeading>
          <LogoutButton />
        </header>

        {/* Main */}
        <main className="flex-1 px-6 py-10 space-y-12">

          {/* Intro Section */}
          <IPSection>
            <IPHeading size="md">Your Soul → Systems → AI™ Foundation</IPHeading>
            <p className="mt-4 text-lg text-ip-text leading-relaxed">
              This is where your clarity begins.
              Explore the inner work that aligns your purpose with your systems,
              your business flow, and your AI-supported expansion.
            </p>
          </IPSection>

          {/* Soulwork Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Card 1 */}
            <IPCard>
              <IPHeading size="sm">Soulwork Reflection</IPHeading>
              <p className="mt-2 text-ip-text">
                Explore the deeper motivations, values, and patterns shaping your purpose.
              </p>
              <IPButton className="mt-4">Begin Reflection</IPButton>
            </IPCard>

            {/* Card 2 */}
            <IPCard>
              <IPHeading size="sm">Archetype Explorer</IPHeading>
              <p className="mt-2 text-ip-text">
                Discover your iPurpose Archetype and unlock aligned growth strategy.
              </p>
              <IPButton className="mt-4" variant="secondary">View Archetypes</IPButton>
            </IPCard>

            {/* Card 3 */}
            <IPCard>
              <IPHeading size="sm">Purpose Mapping</IPHeading>
              <p className="mt-2 text-ip-text">
                Document your Purpose Pathway and create your inner compass.
              </p>
              <IPButton className="mt-4" variant="champagne">Start Mapping</IPButton>
            </IPCard>

            {/* Card 4 */}
            <IPCard>
              <IPHeading size="sm">Next Step Guidance</IPHeading>
              <p className="mt-2 text-ip-text">
                Receive intuitive and strategic prompts for immediate clarity.
              </p>
              <IPButton className="mt-4" variant="ghost">Get Guidance</IPButton>
            </IPCard>

          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
