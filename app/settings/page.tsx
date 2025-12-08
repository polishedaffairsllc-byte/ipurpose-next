"use client";

import ProtectedRoute from "@/app/components/ProtectedRoute";
import IPHeading from "@/app/components/IPHeading";
import IPSection from "@/app/components/IPSection";
import IPCard from "@/app/components/IPCard";
import IPButton from "@/app/components/IPButton";
import LogoutButton from "@/app/components/LogoutButton";

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen w-full bg-white text-ip-heading flex flex-col">

        {/* Header */}
        <header className="w-full border-b border-ip-border px-6 py-4 flex justify-between items-center">
          <IPHeading size="lg">Settings</IPHeading>
          <LogoutButton />
        </header>

        {/* MAIN */}
        <main className="flex-1 px-6 py-10 space-y-12">

          {/* ACCOUNT SETTINGS */}
          <IPSection>
            <IPHeading size="md">Account Preferences</IPHeading>
            <p className="mt-4 text-lg text-ip-text">
              Update your personal settings, preferences, and account details.
            </p>
          </IPSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Card 1 */}
            <IPCard>
              <IPHeading size="sm">Profile Info</IPHeading>
              <p className="mt-2 text-ip-text">
                Update your name, photo, and identity settings.
              </p>
              <IPButton className="mt-4">Edit Profile</IPButton>
            </IPCard>

            {/* Card 2 */}
            <IPCard>
              <IPHeading size="sm">Security</IPHeading>
              <p className="mt-2 text-ip-text">
                Manage your password, login methods, and session access.
              </p>
              <IPButton className="mt-4" variant="secondary">
                Update Security
              </IPButton>
            </IPCard>

            {/* Card 3 */}
            <IPCard>
              <IPHeading size="sm">Notifications</IPHeading>
              <p className="mt-2 text-ip-text">
                Set preferences for email and in-app communication.
              </p>
              <IPButton className="mt-4" variant="champagne">
                Notification Settings
              </IPButton>
            </IPCard>

            {/* Card 4 */}
            <IPCard>
              <IPHeading size="sm">Billing</IPHeading>
              <p className="mt-2 text-ip-text">
                View invoices, payment methods, and subscription options.
              </p>
              <IPButton className="mt-4" variant="ghost">
                View Billing
              </IPButton>
            </IPCard>

          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
