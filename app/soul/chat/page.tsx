'use client';

/**
 * Soul GPT Interface
 * Interactive chat for soul alignment and archetype exploration
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GPTChat from '../../components/GPTChat';
import { preferencesClient } from '@/lib/preferencesClient';

export default function SoulGPTPage() {
  const router = useRouter();
  const [selectedArchetype, setSelectedArchetype] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [loadingPreferences, setLoadingPreferences] = useState(true);

  const archetypes = [
    {
      name: 'Visionary',
      description: 'You see possibilities others miss',
      icon: '✨',
      color: 'bg-purple-100 border-purple-300 hover:bg-purple-200',
    },
    {
      name: 'Healer',
      description: 'You bring restoration and wholeness',
      icon: '🌿',
      color: 'bg-green-100 border-green-300 hover:bg-green-200',
    },
    {
      name: 'Creator',
      description: 'You manifest new realities',
      icon: '🎨',
      color: 'bg-orange-100 border-orange-300 hover:bg-orange-200',
    },
    {
      name: 'Guide',
      description: 'You show others the way forward',
      icon: '🧭',
      color: 'bg-blue-100 border-blue-300 hover:bg-blue-200',
    },
  ];

  // Load user preferences on mount
  useEffect(() => {
    async function loadPreferences() {
      const prefs = await preferencesClient.getPreferences();
      if (prefs?.soul.primaryArchetype) {
        setSelectedArchetype(prefs.soul.primaryArchetype);
      }
      setLoadingPreferences(false);
    }
    loadPreferences();
  }, []);

  const handleArchetypeSelect = async (archetype: string) => {
    setSelectedArchetype(archetype);
    setShowChat(true);
    
    // Save archetype preference
    await preferencesClient.setArchetype(archetype);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {!showChat ? (
          <div className="space-y-12">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Soul Alignment AI
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Discover and align with your core archetype. Get personalized guidance
                on your purpose and path forward.
              </p>
            </div>

            {/* Archetypes Grid */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Choose Your Archetype
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {archetypes.map((archetype) => (
                  <button
                    key={archetype.name}
                    onClick={() => handleArchetypeSelect(archetype.name)}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${archetype.color} ${
                      selectedArchetype === archetype.name
                        ? 'ring-4 ring-purple-500 shadow-xl scale-105'
                        : 'shadow-md hover:scale-102'
                    }`}
                  >
                    <div className="text-5xl mb-4">{archetype.icon}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {archetype.name}
                    </h3>
                    <p className="text-gray-700 text-sm">{archetype.description}</p>
                    <div className="mt-4 text-sm text-purple-600 font-semibold">
                      Explore →
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Start Option */}
            <div className="text-center">
              <p className="text-gray-600 mb-4">Not sure which archetype fits you?</p>
              <button
                onClick={() => setShowChat(true)}
                className="px-8 py-4 bg-white/10 border-2 border-white/20 text-gray-700 rounded-lg font-semibold text-lg hover:bg-white/20 transition-colors shadow-lg backdrop-blur-sm"
              >
                Start Open Conversation
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowChat(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-colors"
              >
                ← Back to Archetypes
              </button>
              {selectedArchetype && (
                <div className="px-6 py-2 bg-purple-100 text-purple-800 rounded-lg font-semibold">
                  {selectedArchetype}
                </div>
              )}
            </div>

            {/* Chat Interface */}
            <div className="h-[calc(100vh-200px)]">
              <GPTChat
                domain="soul"
                title="Soul Guidance"
                placeholder={
                  selectedArchetype
                    ? `Ask about your ${selectedArchetype} archetype...`
                    : 'Share what you want to explore about your purpose...'
                }
                systemContext={
                  selectedArchetype
                    ? `Exploring the ${selectedArchetype} archetype`
                    : 'Discovering core purpose and soul alignment'
                }
                temperature={0.7}
                className="h-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
