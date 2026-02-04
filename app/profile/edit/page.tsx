'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import Button from '@/app/components/Button';
import Card from '@/app/components/Card';
import Link from 'next/link';

interface ProfileData {
  displayName: string;
  photoURL: string | null;
}

export default function EditProfilePage() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Load profile data on mount
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.uid) return;

      setLoading(true);
      try {
        const res = await fetch('/api/profile/get');
        if (res.ok) {
          const data = await res.json();
          if (data.ok && data.profile) {
            setDisplayName(data.profile.displayName || '');
            if (data.profile.photoURL) {
              setPhotoPreview(data.profile.photoURL);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user?.uid]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append('displayName', displayName);
      if (photoFile) {
        formData.append('photo', photoFile);
      }

      const res = await fetch('/api/profile/update', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save profile');
      }

      // Show confirmation
      setShowConfirmation(true);
      setTimeout(() => {
        setShowConfirmation(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-2xl mx-auto px-6 py-10">
        <p className="text-warmCharcoal/60">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto px-6 md:px-10 py-8 md:py-12">
      <div className="mb-8">
        <Link href="/profile" className="text-sm text-lavenderViolet hover:text-indigoDeep mb-4 inline-block">
          ← Back to Profile
        </Link>
        <h1 className="text-4xl font-semibold text-warmCharcoal mb-2">Edit Profile</h1>
        <p className="text-sm text-warmCharcoal/70">Update your name and profile photo.</p>
      </div>

      {/* Confirmation Banner */}
      {showConfirmation && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          ✓ Profile saved successfully.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Display Name */}
        <Card accent="lavender" className="p-6">
          <h2 className="text-lg font-semibold text-warmCharcoal mb-4">Display Name</h2>
          <div>
            <label className="text-sm font-medium text-warmCharcoal/70">Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name"
              className="mt-2 w-full px-4 py-3 border border-warmCharcoal/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lavenderViolet/50"
            />
          </div>
        </Card>

        {/* Photo Upload */}
        <Card accent="lavender" className="p-6">
          <h2 className="text-lg font-semibold text-warmCharcoal mb-4">Profile Photo</h2>
          
          {/* Photo Preview */}
          {photoPreview && (
            <div className="mb-4">
              <p className="text-sm font-medium text-warmCharcoal/70 mb-2">Preview</p>
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-lavenderViolet/20 bg-lavenderViolet/5">
                <img
                  src={photoPreview}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* File Input */}
          <div>
            <label className="text-sm font-medium text-warmCharcoal/70">Upload Photo (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="mt-2 w-full px-4 py-3 border border-warmCharcoal/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lavenderViolet/50"
            />
            <p className="text-xs text-warmCharcoal/60 mt-2">Max 5MB. JPG, PNG, GIF accepted.</p>
          </div>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Save Button */}
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={saving}
            className="flex-1"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
          <Link href="/profile" className="flex-1">
            <Button type="button" variant="secondary" className="w-full">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
