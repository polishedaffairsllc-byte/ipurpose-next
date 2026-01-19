'use client';

/**
 * Systems GPT Interface
 * Interactive chat for building workflows, offers, and business systems
 */

import { useState } from 'react';
import GPTChat from '../../components/GPTChat';

export default function SystemsGPTPage() {
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);

  const systems = [
    {
      name: 'Workflows',
      description: 'Optimize your daily operations and routines',
      icon: '⚙️',
      color: 'bg-blue-100 border-blue-300 hover:bg-blue-200',
    },
    {
      name: 'Offers',
      description: 'Structure your service offerings and packages',
      icon: '💼',
      color: 'bg-teal-100 border-teal-300 hover:bg-teal-200',
    },
    {
      name: 'Boundaries',
      description: 'Protect your time, energy, and capacity',
      icon: '🛡️',
      color: 'bg-rose-100 border-rose-300 hover:bg-rose-200',
    },
    {
      name: 'Processes',
      description: 'Streamline and automate repetitive tasks',
      icon: '📋',
      color: 'bg-amber-100 border-amber-300 hover:bg-amber-200',
    },
  ];

  const handleSystemSelect = (system: string) => {
    setSelectedSystem(system);
    setShowChat(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {!showChat ? (
          <div className="space-y-12">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-italiana text-warmCharcoal mb-4">
                Systems Guide
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Build sustainable structures that support your purpose. Create workflows,
                offers, boundaries, and processes that scale.
              </p>
            </div>

            {/* Systems Grid */}
            <div>
              <h2 className="text-2xl font-italiana text-warmCharcoal mb-6 text-center">
                Choose a System to Build
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {systems.map((system) => (
                  <button
                    key={system.name}
                    onClick={() => handleSystemSelect(system.name)}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${system.color} ${
                      selectedSystem === system.name
                        ? 'ring-4 ring-blue-500 shadow-xl scale-105'
                        : 'shadow-md hover:scale-102'
                    }`}
                  >
                    <div className="text-5xl mb-4">{system.icon}</div>
                    <h3 className="text-xl font-marcellus text-warmCharcoal mb-2">
                      {system.name}
                    </h3>
                    <p className="text-gray-700 text-sm">{system.description}</p>
                    <div className="mt-4 text-sm text-blue-600 font-marcellus">
                      Build →
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Start Option */}
            <div className="text-center">
              <p className="text-gray-600 mb-4">Need help with multiple systems?</p>
              <button
                onClick={() => setShowChat(true)}
                className="px-8 py-4 bg-blue-600 text-white rounded-lg font-marcellus text-lg hover:bg-blue-700 transition-colors shadow-lg"
              >
                Start General Systems Chat
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
                ← Back to Systems
              </button>
              {selectedSystem && (
                <div className="px-6 py-2 bg-blue-100 text-blue-800 rounded-lg font-marcellus">
                  Building: {selectedSystem}
                </div>
              )}
            </div>

            {/* Chat Interface */}
            <div className="h-[calc(100vh-200px)]">
              <GPTChat
                domain="systems"
                title="Systems Builder"
                placeholder={
                  selectedSystem
                    ? `How can I help you build your ${selectedSystem} system?`
                    : 'What system would you like to create or improve?'
                }
                systemContext={
                  selectedSystem
                    ? `Building a ${selectedSystem} system`
                    : 'Creating sustainable business systems'
                }
                temperature={0.5}
                className="h-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
