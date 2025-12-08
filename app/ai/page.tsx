"use client";

import ProtectedRoute from "@/app/components/ProtectedRoute";
import IPHeading from "@/app/components/IPHeading";
import IPSection from "@/app/components/IPSection";
import IPCard from "@/app/components/IPCard";
import IPButton from "@/app/components/IPButton";
import LogoutButton from "@/app/components/LogoutButton";

export default function AIPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen w-full bg-white text-ip-heading flex flex-col">

        {/* Header */}
        <header className="w-full border-b border-ip-border px-6 py-4 flex justify-between items-center">
          <IPHeading size="lg">AI</IPHeading>
          <LogoutButton />
        </header>

        {/* Main */}
        <main className="flex-1 px-6 py-10 space-y-12">

          {/* Intro Section */}
          <IPSection>
            <IPHeading size="md">Your Soul-Aligned AI Strategy</IPHeading>
            <p className="mt-4 text-lg text-ip-text leading-relaxed">
              AI expands your capacity, supports your workflows, and amplifies your purpose.  
              Here, you’ll access tools that help you think smarter, move faster, and stay aligned  
              while integrating automation in a grounded, intentional way.
            </p>
          </IPSection>

          {/* AI Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Card 1 */}
            <IPCard>
              <IPHeading size="sm">Prompt Builder</IPHeading>
              <p className="mt-2 text-ip-text">
                Design powerful prompts that deliver clarity, creativity, and aligned strategy.
              </p>
              <IPButton className="mt-4">Open Prompt Builder</IPButton>
            </IPCard>

            {/* Card 2 */}
            <IPCard>
              <IPHeading size="sm">Automation Studio</IPHeading>
              <p className="mt-2 text-ip-text">
                Build lightweight automations that simplify your recurring tasks and systems.
              </p>
              <IPButton className="mt-4" variant="secondary">
                Launch Automation Studio
              </IPButton>
            </IPCard>

            {/* Card 3 */}
            <IPCard>
              <IPHeading size="sm">AI Blueprint</IPHeading>
              <p className="mt-2 text-ip-text">
                Create your personalized AI adoption plan to scale with ease and intention.
              </p>
              <IPButton className="mt-4" variant="champagne">
                Build Your Blueprint
              </IPButton>
            </IPCard>

            {/* Card 4 */}
            <IPCard>
              <IPHeading size="sm">AI Training Lab</IPHeading>
              <p className="mt-2 text-ip-text">
                Learn how to work with AI tools, models, and systems in a grounded, aligned way.
              </p>
              <IPButton className="mt-4" variant="ghost">
                Enter Training Lab
              </IPButton>
            </IPCard>

          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
