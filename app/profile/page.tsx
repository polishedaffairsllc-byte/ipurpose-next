"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import IPHeading from "@/app/components/IPHeading";
import IPSection from "@/app/components/IPSection";
import IPCard from "@/app/components/IPCard";
import IPButton from "@/app/components/IPButton";
import LogoutButton from "@/app/components/LogoutButton";
import ModuleGuide from "@/app/components/ModuleGuide";

interface ProfileData {
  displayName: string;
  photoURL: string | null;
  email: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch('/api/profile/get');
        if (res.ok) {
          const data = await res.json();
          if (data.ok && data.profile) {
            setProfile(data.profile);
          }
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="container max-w-2xl mx-auto px-6 py-10">
          <p className="text-warmCharcoal/60">Loading profile...</p>
        </div>
      </ProtectedRoute>
    );
  }

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
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <IPHeading size="sm">Identity & Info</IPHeading>
                {profile?.photoURL && (
                  <div className="mt-3 w-16 h-16 rounded-full overflow-hidden border-2 border-lavenderViolet/20 bg-lavenderViolet/5">
                    <img
                      src={profile.photoURL}
                      alt={profile.displayName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="mt-3 space-y-2">
                  <p className="text-sm text-ip-text">
                    <span className="font-medium">Name:</span> {profile?.displayName || 'Not set'}
                  </p>
                  <p className="text-sm text-ip-text">
                    <span className="font-medium">Email:</span> {profile?.email || 'Loading...'}
                  </p>
                </div>
              </div>
            </div>
            <Link href="/profile/edit">
              <IPButton className="mt-4">Edit Profile Info</IPButton>
            </Link>
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

          {/* Logout */}
          <div className="mt-12 pt-8 border-t border-warmCharcoal/10">
            <LogoutButton />
          </div>

        </main>
      </div>
      <ModuleGuide moduleId="settings" />
    </ProtectedRoute>
  );
}
