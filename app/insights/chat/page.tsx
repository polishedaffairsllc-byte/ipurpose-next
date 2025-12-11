'use client';

/**
 * Insights GPT Interface
 * Interactive chat for data analysis and strategic insights
 */

import { useState } from 'react';
import GPTChat from '../../components/GPTChat';

export default function InsightsGPTPage() {
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);

  const insights = [
    {
      name: 'Alignment Trends',
      description: 'Track your soul-systems alignment over time',
      icon: '📊',
      color: 'bg-indigo-100 border-indigo-300 hover:bg-indigo-200',
    },
    {
      name: 'Token Analytics',
      description: 'Monitor AI usage and optimize spending',
      icon: '💰',
      color: 'bg-emerald-100 border-emerald-300 hover:bg-emerald-200',
    },
    {
      name: 'Pattern Recognition',
      description: 'Discover recurring themes in your work',
      icon: '🔍',
      color: 'bg-sky-100 border-sky-300 hover:bg-sky-200',
    },
    {
      name: 'Growth Metrics',
      description: 'Measure progress toward your goals',
      icon: '📈',
      color: 'bg-lime-100 border-lime-300 hover:bg-lime-200',
    },
  ];

  const handleInsightSelect = (insight: string) => {
    setSelectedInsight(insight);
    setShowChat(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {!showChat ? (
          <div className="space-y-12">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Insights Analytics
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Analyze your data, track alignment trends, and uncover strategic insights.
                Make data-driven decisions that honor your purpose.
              </p>
            </div>

            {/* Insights Grid */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Choose an Analysis Type
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {insights.map((insight) => (
                  <button
                    key={insight.name}
                    onClick={() => handleInsightSelect(insight.name)}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${insight.color} ${
                      selectedInsight === insight.name
                        ? 'ring-4 ring-indigo-500 shadow-xl scale-105'
                        : 'shadow-md hover:scale-102'
                    }`}
                  >
                    <div className="text-5xl mb-4">{insight.icon}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {insight.name}
                    </h3>
                    <p className="text-gray-700 text-sm">{insight.description}</p>
                    <div className="mt-4 text-sm text-indigo-600 font-semibold">
                      Analyze →
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Start Option */}
            <div className="text-center">
              <p className="text-gray-600 mb-4">Need custom analysis?</p>
              <button
                onClick={() => setShowChat(true)}
                className="px-8 py-4 bg-indigo-600 text-white rounded-lg font-semibold text-lg hover:bg-indigo-700 transition-colors shadow-lg"
              >
                Start Custom Analysis
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
                ← Back to Insights
              </button>
              {selectedInsight && (
                <div className="px-6 py-2 bg-indigo-100 text-indigo-800 rounded-lg font-semibold">
                  Analysis: {selectedInsight}
                </div>
              )}
            </div>

            {/* Chat Interface */}
            <div className="h-[calc(100vh-200px)]">
              <GPTChat
                domain="insights"
                title="Insights Analytics"
                placeholder={
                  selectedInsight
                    ? `Ask about your ${selectedInsight.toLowerCase()}...`
                    : 'What insights are you looking for?'
                }
                systemContext={
                  selectedInsight
                    ? `Analyzing ${selectedInsight.toLowerCase()}`
                    : 'Strategic data analysis and insights'
                }
                temperature={0.4}
                className="h-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
