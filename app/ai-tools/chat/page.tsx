'use client';

/**
 * AI Tools GPT Interface
 * Interactive chat for content generation and creative assistance
 */

import { useState } from 'react';
import GPTChat from '../../components/GPTChat';

export default function AIToolsGPTPage() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);

  const tools = [
    {
      name: 'Content Writing',
      description: 'Blog posts, newsletters, social media',
      icon: '✍️',
      color: 'bg-violet-100 border-violet-300 hover:bg-violet-200',
    },
    {
      name: 'Email Drafts',
      description: 'Client emails, proposals, follow-ups',
      icon: '📧',
      color: 'bg-cyan-100 border-cyan-300 hover:bg-cyan-200',
    },
    {
      name: 'Marketing Copy',
      description: 'Sales pages, ads, promotional content',
      icon: '📢',
      color: 'bg-pink-100 border-pink-300 hover:bg-pink-200',
    },
    {
      name: 'Brainstorming',
      description: 'Ideas, concepts, creative exploration',
      icon: '💡',
      color: 'bg-yellow-100 border-yellow-300 hover:bg-yellow-200',
    },
  ];

  const handleToolSelect = (tool: string) => {
    setSelectedTool(tool);
    setShowChat(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-pink-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {!showChat ? (
          <div className="space-y-12">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                AI Tools Studio
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Generate high-quality content, emails, and marketing copy. Let AI amplify
                your creative output while maintaining your unique voice.
              </p>
            </div>

            {/* Tools Grid */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Choose Your Creative Tool
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {tools.map((tool) => (
                  <button
                    key={tool.name}
                    onClick={() => handleToolSelect(tool.name)}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${tool.color} ${
                      selectedTool === tool.name
                        ? 'ring-4 ring-violet-500 shadow-xl scale-105'
                        : 'shadow-md hover:scale-102'
                    }`}
                  >
                    <div className="text-5xl mb-4">{tool.icon}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {tool.name}
                    </h3>
                    <p className="text-gray-700 text-sm">{tool.description}</p>
                    <div className="mt-4 text-sm text-violet-600 font-semibold">
                      Create →
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Start Option */}
            <div className="text-center">
              <p className="text-gray-600 mb-4">Need something custom?</p>
              <button
                onClick={() => setShowChat(true)}
                className="px-8 py-4 bg-violet-600 text-white rounded-lg font-semibold text-lg hover:bg-violet-700 transition-colors shadow-lg"
              >
                Start Free-Form Creation
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
                ← Back to Tools
              </button>
              {selectedTool && (
                <div className="px-6 py-2 bg-violet-100 text-violet-800 rounded-lg font-semibold">
                  Tool: {selectedTool}
                </div>
              )}
            </div>

            {/* Chat Interface */}
            <div className="h-[calc(100vh-200px)]">
              <GPTChat
                domain="ai-tools"
                title="AI Content Studio"
                placeholder={
                  selectedTool
                    ? `What ${selectedTool.toLowerCase()} would you like to create?`
                    : 'Describe what you want to create...'
                }
                systemContext={
                  selectedTool
                    ? `Creating ${selectedTool.toLowerCase()}`
                    : 'AI-powered content generation'
                }
                temperature={0.8}
                className="h-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
