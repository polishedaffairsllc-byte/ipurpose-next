"use client";

import { useRouter } from "next/navigation";
import IPHeading from "@/app/components/IPHeading";
import IPSection from "@/app/components/IPSection";
import IPCard from "@/app/components/IPCard";
import IPButton from "@/app/components/IPButton";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full bg-white text-ip-heading flex flex-col">
{/* 🔵 TAILWIND BRAND TEST */}
<div className="text-ip-accent text-4xl font-bold mt-10 text-center">
  TAILWIND TEST — SHOULD BE LAVENDER
</div>

      {/* HERO */}
      <section className="w-full px-6 py-20 text-center">
        <IPHeading size="xl">Welcome to iPurpose</IPHeading>
        <p className="mt-4 text-lg text-ip-text max-w-xl mx-auto">
          Align your Soul. Empower your Systems. Expand through AI.
        </p>

        <div className="mt-10">
          <IPButton onClick={() => router.push("/login")}>
            Log In
          </IPButton>

          <IPButton
            variant="ghost"
            className="ml-4"
            onClick={() => router.push("/signup")}
          >
            Create Account
          </IPButton>
        </div>
      </section>

      {/* MODULE GRID */}
      <IPSection>
        <IPHeading size="md" className="text-center">
          Explore the iPurpose Framework
        </IPHeading>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">

          {/* Soul */}
          <IPCard>
            <IPHeading size="sm">Soul Alignment</IPHeading>
            <p className="mt-2 text-ip-text">
              Begin your inner alignment journey and uncover your clarity.
            </p>
            <IPButton className="mt-4" onClick={() => router.push("/soul")}>
              Go to Soul
            </IPButton>
          </IPCard>

          {/* Systems */}
          <IPCard>
            <IPHeading size="sm">Systems</IPHeading>
            <p className="mt-2 text-ip-text">
              Structure your workflows, offers, and strategic foundation.
            </p>
            <IPButton
              className="mt-4"
              variant="secondary"
              onClick={() => router.push("/systems")}
            >
              Go to Systems
            </IPButton>
          </IPCard>

          {/* AI */}
          <IPCard>
            <IPHeading size="sm">AI Tools</IPHeading>
            <p className="mt-2 text-ip-text">
              Expand your capacity with aligned automation and powerful prompts.
            </p>
            <IPButton
              className="mt-4"
              variant="champagne"
              onClick={() => router.push("/ai")}
            >
              Go to AI
            </IPButton>
          </IPCard>
        </div>
      </IPSection>

      {/* SECOND ROW (Dashboard, Insights, Profile) */}
      <IPSection>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Dashboard */}
          <IPCard>
            <IPHeading size="sm">Dashboard</IPHeading>
            <p className="mt-2 text-ip-text">
              Access your home base and track your aligned progress.
            </p>
            <IPButton className="mt-4" onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </IPButton>
          </IPCard>

          {/* Insights */}
          <IPCard>
            <IPHeading size="sm">Insights</IPHeading>
            <p className="mt-2 text-ip-text">
              Review reflections, trends, and alignment reports.
            </p>
            <IPButton
              className="mt-4"
              variant="secondary"
              onClick={() => router.push("/insights")}
            >
              Go to Insights
            </IPButton>
          </IPCard>

          {/* Profile */}
          <IPCard>
            <IPHeading size="sm">Profile</IPHeading>
            <p className="mt-2 text-ip-text">
              Manage your personal preferences and account information.
            </p>
            <IPButton
              className="mt-4"
              variant="ghost"
              onClick={() => router.push("/profile")}
            >
              Go to Profile
            </IPButton>
          </IPCard>

        </div>
      </IPSection>
    </div>
  );
}
