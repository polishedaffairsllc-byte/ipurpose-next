/**
 * Context Visualization Component
 * Shows user their active context and preferences across domains
 */

'use client';

import { useState, useEffect } from 'react';
import { preferencesClient } from '@/lib/preferencesClient';
import type { UserPreferencesData } from '@/lib/preferencesClient';

export default function ContextPanel() {
  const [preferences, setPreferences] = useState<UserPreferencesData | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function loadPreferences() {
      const prefs = await preferencesClient.getPreferences();
      setPreferences(prefs);
    }
    loadPreferences();
  }, []);

  if (!preferences) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
        title="View your context"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {/* Context Panel */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
          <div className="bg-indigo-600 text-white px-6 py-4">
            <h3 className="text-lg font-semibold">Your Active Context</h3>
            <p className="text-sm text-indigo-100 mt-1">
              AI uses this to personalize responses
            </p>
          </div>

          <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
            {/* Soul Context */}
            {preferences.soul.primaryArchetype && (
              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold text-gray-900">Soul</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Archetype: {preferences.soul.primaryArchetype}
                </p>
                {preferences.soul.exploredArchetypes.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Explored: {preferences.soul.exploredArchetypes.slice(0, 3).join(', ')}
                  </p>
                )}
              </div>
            )}

            {/* Systems Context */}
            {preferences.systems.activeSystems.length > 0 && (
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-gray-900">Systems</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Active: {preferences.systems.activeSystems.join(', ')}
                </p>
                {preferences.systems.workflowPreferences.workStyle && (
                  <p className="text-xs text-gray-500 mt-1">
                    Style: {preferences.systems.workflowPreferences.workStyle}
                  </p>
                )}
              </div>
            )}

            {/* AI Tools Context */}
            {preferences.aiTools.writingStyle && (
              <div className="border-l-4 border-violet-500 pl-4">
                <h4 className="font-semibold text-gray-900">AI Tools</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Writing: {preferences.aiTools.writingStyle}
                </p>
                {preferences.aiTools.tonePreference && (
                  <p className="text-xs text-gray-500 mt-1">
                    Tone: {preferences.aiTools.tonePreference}
                  </p>
                )}
              </div>
            )}

            {/* Memory Settings */}
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Context Memory</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  preferences.general.enableMemory
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {preferences.general.enableMemory ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600">Cross-Domain Context</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  preferences.general.enableCrossContext
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {preferences.general.enableCrossContext ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-3 border-t">
            <button
              onClick={() => setIsOpen(false)}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
