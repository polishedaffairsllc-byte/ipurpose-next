'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/app/components/Button';
import Card from '@/app/components/Card';

interface AccountSettingsClientProps {
  userEmail?: string;
}

export default function AccountSettingsClient({ userEmail = 'user@example.com' }: AccountSettingsClientProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'billing'>('profile');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          setDisplayName(data.displayName || '');
          setPhotoURL(data.photoURL || null);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header with Profile Info */}
      <div className="mb-8">
        <div className="flex items-start gap-4">
          {photoURL && (
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-lavenderViolet/20 bg-lavenderViolet/5 flex-shrink-0">
              <img
                src={photoURL}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <h1 className="font-semibold text-warmCharcoal mb-2" style={{ fontSize: '40px' }}>
              {loadingProfile ? 'Account Settings' : `Account Settings, ${displayName || 'Friend'}`}
            </h1>
            <p className="text-warmCharcoal/70" style={{ fontSize: '40px' }}>Manage your account, security, and preferences.</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-warmCharcoal/10">
        {(['profile', 'security', 'notifications', 'billing'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-medium transition ${
              activeTab === tab
                ? 'text-indigoDeep border-b-2 border-indigoDeep'
                : 'text-warmCharcoal/60 hover:text-warmCharcoal'
            }`}
            style={{ fontSize: '40px' }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <Card accent="lavender" className="p-6">
              <h2 className="font-semibold text-warmCharcoal mb-4" style={{ fontSize: '40px' }}>Profile</h2>
              <p className="text-warmCharcoal/70 mb-4" style={{ fontSize: '40px' }}>
                Manage your display name and profile photo.
              </p>
              <Link href="/profile/edit">
                <Button variant="secondary" className="text-sm">
                  Edit Profile
                </Button>
              </Link>
            </Card>

            <Card accent="lavender" className="p-6">
              <h2 className="font-semibold text-warmCharcoal mb-4" style={{ fontSize: '40px' }}>Email Address</h2>
              <div className="space-y-3">
                <div>
                  <label className="font-medium text-warmCharcoal/70" style={{ fontSize: '40px' }}>Current Email</label>
                  <p className="mt-2 text-warmCharcoal" style={{ fontSize: '40px' }}>{userEmail}</p>
                </div>
                <Button variant="secondary" className="text-sm">
                  Change Email
                </Button>
              </div>
            </Card>

            <Card accent="lavender" className="p-6">
              <h2 className="font-semibold text-warmCharcoal mb-4" style={{ fontSize: '40px' }}>Profile Information</h2>
              <p className="text-warmCharcoal/70 mb-4" style={{ fontSize: '40px' }}>
                Update your name, photo, and other profile details.
              </p>
              <Link href="/profile/edit">
                <Button variant="secondary" className="text-sm">
                  Edit Profile
                </Button>
              </Link>
            </Card>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <Card accent="lavender" className="p-6">
              <h2 className="font-semibold text-warmCharcoal mb-4" style={{ fontSize: '40px' }}>Password</h2>
              <p className="text-warmCharcoal/70 mb-4" style={{ fontSize: '40px' }}>
                Update your password to keep your account secure.
              </p>
              <Button
                variant="secondary"
                className="text-sm"
                onClick={() => setIsChangingPassword(!isChangingPassword)}
              >
                {isChangingPassword ? 'Cancel' : 'Change Password'}
              </Button>
              
              {isChangingPassword && (
                <div className="mt-4 space-y-3 border-t border-warmCharcoal/10 pt-4">
                  <div>
                    <label className="text-sm font-medium text-warmCharcoal/70">Current Password</label>
                    <input
                      type="password"
                      className="mt-1 w-full px-3 py-2 border border-warmCharcoal/20 rounded-lg text-sm"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-warmCharcoal/70">New Password</label>
                    <input
                      type="password"
                      className="mt-1 w-full px-3 py-2 border border-warmCharcoal/20 rounded-lg text-sm"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-warmCharcoal/70">Confirm Password</label>
                    <input
                      type="password"
                      className="mt-1 w-full px-3 py-2 border border-warmCharcoal/20 rounded-lg text-sm"
                      placeholder="Confirm new password"
                    />
                  </div>
                  <Button className="mt-4 w-full text-sm">Save Password</Button>
                </div>
              )}
            </Card>

            <Card accent="lavender" className="p-6">
              <h2 className="font-semibold text-warmCharcoal mb-4" style={{ fontSize: '40px' }}>Active Sessions</h2>
              <p className="text-warmCharcoal/70 mb-4" style={{ fontSize: '40px' }}>
                Manage your login sessions and sign out from other devices.
              </p>
              <Button variant="secondary" className="text-sm">
                Sign Out All Other Sessions
              </Button>
            </Card>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <Card accent="lavender" className="p-6">
              <h2 className="font-semibold text-warmCharcoal mb-4" style={{ fontSize: '40px' }}>Email Notifications</h2>
              <div className="space-y-4">
                {[
                  { label: 'Daily digest', description: 'Get a daily summary of your activity' },
                  { label: 'Session reminders', description: 'Reminders for your scheduled sessions' },
                  { label: 'Weekly insights', description: 'Weekly progress and insights' },
                  { label: 'Account updates', description: 'Important account and security updates' },
                ].map((notif) => (
                  <label key={notif.label} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    <div>
                      <p className="font-medium text-warmCharcoal" style={{ fontSize: '40px' }}>{notif.label}</p>
                      <p className="text-warmCharcoal/60" style={{ fontSize: '40px' }}>{notif.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            <Card accent="gold" className="p-6">
              <h2 className="font-semibold text-warmCharcoal mb-4" style={{ fontSize: '40px' }}>Subscription</h2>
              <div className="space-y-3">
                <div>
                  <label className="font-medium text-warmCharcoal/70" style={{ fontSize: '40px' }}>Current Plan</label>
                  <p className="mt-2 text-warmCharcoal" style={{ fontSize: '40px' }}>Accelerator • $1,497/year</p>
                </div>
                <div>
                  <label className="font-medium text-warmCharcoal/70" style={{ fontSize: '40px' }}>Renewal Date</label>
                  <p className="mt-2 text-warmCharcoal" style={{ fontSize: '40px' }}>February 3, 2027</p>
                </div>
              </div>
            </Card>

            <Card accent="gold" className="p-6">
              <h2 className="font-semibold text-warmCharcoal mb-4" style={{ fontSize: '40px' }}>Billing & Payment</h2>
              <p className="text-warmCharcoal/70 mb-4" style={{ fontSize: '40px' }}>
                Manage your billing information and payment methods.
              </p>
              <Button variant="secondary" className="text-sm">
                Go to Billing Portal
              </Button>
            </Card>

            <Card accent="salmon" className="p-6">
              <h2 className="font-semibold text-warmCharcoal mb-4" style={{ fontSize: '40px' }}>Danger Zone</h2>
              <p className="text-warmCharcoal/70 mb-4" style={{ fontSize: '40px' }}>
                Delete your account and all associated data. This action cannot be undone.
              </p>
              <Button variant="secondary" className="text-sm bg-red-50 text-red-700 hover:bg-red-100">
                Delete Account
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
