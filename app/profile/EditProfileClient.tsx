'use client';

import { useState, useEffect } from 'react';
import Button from '@/app/components/Button';
import Card from '@/app/components/Card';

interface ProfileData {
  displayName?: string;
  photoURL?: string;
  email?: string;
}

export default function EditProfileClient() {
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Load profile data on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        if (!res.ok) throw new Error('Failed to load profile');
        const data: ProfileData = await res.json();
        setDisplayName(data.displayName || '');
        setPhotoURL(data.photoURL || '');
        setPhotoPreview(data.photoURL || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Photo must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setPhotoFile(file);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('displayName', displayName);
      if (photoFile) {
        formData.append('photo', photoFile);
      }

      const res = await fetch('/api/profile', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save profile');
      }

      const data = await res.json();
      setPhotoURL(data.photoURL);
      setPhotoFile(null);
      setShowConfirmation(true);

      setTimeout(() => {
        setShowConfirmation(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-warmCharcoal/60">Loading profile...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-semibold text-warmCharcoal mb-2">Edit Profile</h1>
        <p className="text-sm text-warmCharcoal/70">Update your name and profile photo.</p>
      </div>

      {/* Confirmation */}
      {showConfirmation && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          ✓ Profile updated successfully.
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Photo Upload */}
      <Card accent="lavender" className="p-6">
        <h2 className="text-lg font-semibold text-warmCharcoal mb-4">Profile Photo</h2>
        <div className="space-y-4">
          {/* Photo Preview */}
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-warmCharcoal/10 flex items-center justify-center overflow-hidden border-2 border-lavenderViolet/20">
              {photoPreview ? (
                <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl">📷</span>
              )}
            </div>
          </div>

          {/* File Input */}
          <div>
            <label className="text-sm font-medium text-warmCharcoal/70">Choose Photo (max 5MB)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="mt-2 w-full px-3 py-2 border border-warmCharcoal/20 rounded-lg text-sm cursor-pointer"
            />
          </div>

          {photoFile && (
            <p className="text-xs text-warmCharcoal/60">
              Selected: {photoFile.name}
            </p>
          )}
        </div>
      </Card>

      {/* Display Name */}
      <Card accent="lavender" className="p-6">
        <h2 className="text-lg font-semibold text-warmCharcoal mb-4">Display Name</h2>
        <div>
          <label className="text-sm font-medium text-warmCharcoal/70">Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-2 w-full px-3 py-2 border border-warmCharcoal/20 rounded-lg text-sm"
            placeholder="Your name"
          />
        </div>
      </Card>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={saving || !displayName.trim()}
        className="w-full"
      >
        {saving ? 'Saving...' : 'Save Profile'}
      </Button>
    </div>
  );
}
