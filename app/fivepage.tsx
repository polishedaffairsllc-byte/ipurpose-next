"use client";

import { useRouter } from "next/navigation";
import IPHeading from "@/app/components/IPHeading";
import IPCard from "@/app/components/IPCard";
import IPButton from "@/app/components/IPButton";

export default function FiveDoorHome() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full bg-white text-ip-heading flex flex-col items-center px-6 py-20">

      {/* TOP HEADING */}
      <IPHeading size="xl" className="text-center">
        Welcome to MsHmltn
      </IPHeading>

      <p className="text-ip-text text-lg text-center mt-4 max-w-2xl">
        Choose your portal. Each door opens to a different part of your world.
      </p>

      {/* 5 DOORS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mt-20 w-full max-w-5xl">

        {/* Door 1 - iPurpose */}
        <IPCard>
          <IPHeading size="md">iPurpose</IPHeading>
          <p className="mt-2 text-ip-text">
            Soul-aligned clarity, systems, and AI for aligned leadership.
          </p>
          <IPButton className="mt-4" onClick={() => router.push("/dashboard")}>
            Enter iPurpose
          </IPButton>
        </IPCard>

        {/* Door 2 - Congress */}
        <IPCard>
          <IPHeading size="md">Ms. Hamilton for Congress</IPHeading>
          <p className="mt-2 text-ip-text">
            Platform, mission, policies, community commitments.
          </p>
          <IPButton
            className="mt-4"
            variant="secondary"
            onClick={() => router.push("/congress")}
          >
            Enter Campaign Portal
          </IPButton>
        </IPCard>

        {/* Door 3 - Philanthropy */}
        <IPCard>
          <IPHeading size="md">Philanthropy & Community</IPHeading>
          <p className="mt-2 text-ip-text">
            Food box initiatives, garden projects, service events, and giving.
          </p>
          <IPButton
            className="mt-4"
            variant="champagne"
            onClick={() => router.push("/philanthropy")}
          >
            Enter Community Hub
          </IPButton>
        </IPCard>

        {/* Door 4 - Personal Life */}
        <IPCard>
          <IPHeading size="md">Personal Life & Lifestyle</IPHeading>
          <p className="mt-2 text-ip-text">
            Hobbies, wellness, family, travel, creativity, and stories.
          </p>
          <IPButton className="mt-4" onClick={() => router.push("/lifestyle")}>
            Enter Lifestyle
          </IPButton>
        </IPCard>

        {/* Door 5 - The Garden */}
        <IPCard>
          <IPHeading size="md">The Garden</IPHeading>
          <p className="mt-2 text-ip-text">
            Local produce, CSA boxes, seasonal offerings, herbal blends.
          </p>
          <IPButton
            className="mt-4"
            variant="ghost"
            onClick={() => router.push("/garden")}
          >
            Enter The Garden
          </IPButton>
        </IPCard>

      </div>
    </div>
  );
}
