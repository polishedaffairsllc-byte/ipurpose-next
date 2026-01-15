"use client";

import ProtectedRoute from "@/app/components/ProtectedRoute";
import IPHeading from "@/app/components/IPHeading";
import IPSection from "@/app/components/IPSection";
import IPCard from "@/app/components/IPCard";
import IPButton from "@/app/components/IPButton";
import LogoutButton from "@/app/components/LogoutButton";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen w-full bg-white text-ip-heading flex flex-col">

        {/* MAIN */}
        <main className="flex-1 px-6 py-10 space-y-12">

          <IPSection>
            <IPHeading size="md">Your Personal Details</IPHeading>
            <p className="mt-4 text-lg text-ip-text">
              Review and update your personal profile information.
            </p>
          </IPSection>

          {/* Card 1 — Identity + Info */}
          <IPCard>
            <IPHeading size="sm">Identity & Info</IPHeading>
            <p className="mt-2 text-ip-text">
              Update your name, email address, and personal details.
            </p>
            <IPButton className="mt-4">Edit Profile Info</IPButton>
          </IPCard>

          {/* Card 2 — Preferences */}
          <div className="mt-6">
            <IPCard>
              <IPHeading size="sm">Preferences</IPHeading>
              <p className="mt-2 text-ip-text">
                Customize your experience within the iPurpose platform.
              </p>
              <IPButton className="mt-4" variant="secondary">
                Edit Preferences
              </IPButton>
            </IPCard>
          </div>

        </main>
      </div>
    </ProtectedRoute>
  );
}
