"use client";

import ProtectedRoute from "@/app/components/ProtectedRoute";
import IPHeading from "@/app/components/IPHeading";
import IPSection from "@/app/components/IPSection";
import IPCard from "@/app/components/IPCard";
import IPButton from "@/app/components/IPButton";
import LogoutButton from "@/app/components/LogoutButton";

export default function SystemsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen w-full bg-white text-ip-heading flex flex-col">

        {/* Header */}
        <header className="w-full border-b border-ip-border px-6 py-4 flex justify-between items-center">
          <IPHeading size="lg">Systems</IPHeading>
          <LogoutButton />
        </header>

        {/* Main */}
        <main className="flex-1 px-6 py-10 space-y-12">

          {/* Intro Section */}
          <IPSection>
            <IPHeading size="md">Build the Structures That Carry Your Purpose</IPHeading>
            <p className="mt-4 text-lg text-ip-text leading-relaxed">
              Systems turn your purpose into momentum.  
              These tools help you organize, automate, and streamline every part of your flow  
              so your energy stays aligned, efficient, and powerful.
            </p>
          </IPSection>

          {/* Systems Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Card 1 */}
            <IPCard>
              <IPHeading size="sm">Workflow Builder</IPHeading>
              <p className="mt-2 text-ip-text">
                Create simple, repeatable workflows that keep your operations smooth and confident.
              </p>
              <IPButton className="mt-4">Open Workflow Builder</IPButton>
            </IPCard>

            {/* Card 2 */}
            <IPCard>
              <IPHeading size="sm">Content Engine</IPHeading>
              <p className="mt-2 text-ip-text">
                Plan, organize, and document your content ideas with aligned strategy.
              </p>
              <IPButton className="mt-4" variant="secondary">
                Launch Content Engine
              </IPButton>
            </IPCard>

            {/* Card 3 */}
            <IPCard>
              <IPHeading size="sm">Offer Architecture</IPHeading>
              <p className="mt-2 text-ip-text">
                Structure your offers, pricing, and delivery so everything feels clean and scalable.
              </p>
              <IPButton className="mt-4" variant="champagne">
                Build Your Offers
              </IPButton>
            </IPCard>

            {/* Card 4 */}
            <IPCard>
              <IPHeading size="sm">Task Orchestration</IPHeading>
              <p className="mt-2 text-ip-text">
                Organize priorities, commitments, and daily tasks with clarity and ease.
              </p>
              <IPButton className="mt-4" variant="ghost">
                Start Organizing
              </IPButton>
            </IPCard>

          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
