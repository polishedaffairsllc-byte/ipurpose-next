'use client';

import { useState } from 'react';

export interface ModuleGuideProps {
  moduleId: string;
  title: string;
  purpose: string;
  actions: string[];
  outcomes: string[];
  estimatedTime?: string;
}

interface ModuleGuideContentMap {
  [key: string]: ModuleGuideProps;
}

const moduleGuideContent: ModuleGuideContentMap = {
  orientation: {
    moduleId: 'orientation',
    title: 'Orientation',
    purpose: 'Understand how iPurpose works and what to expect in your journey.',
    actions: [
      'Watch the welcome video',
      'Read the foundational concepts',
      'Set up your profile',
    ],
    outcomes: [
      'Know your entry point into the program',
      'Understand the lab sequence',
      'Be ready to begin your clarity work',
    ],
    estimatedTime: '20 minutes',
  },
  compass: {
    moduleId: 'compass',
    title: 'Compass',
    purpose: 'Map your current state and clarify what matters to you right now.',
    actions: [
      'Complete the Clarity Check assessment',
      'Reflect on your results',
      'Identify your starting point',
    ],
    outcomes: [
      'Understand your current alignment',
      'Know which lab to start with',
      'Feel grounded in your direction',
    ],
    estimatedTime: '15 minutes',
  },
  labs: {
    moduleId: 'labs',
    title: 'Labs',
    purpose: 'Do the reflective work that builds clarity, meaning, and agency.',
    actions: [
      'Choose a lab: Identity, Meaning, or Agency',
      'Spend time with the reflection prompts',
      'Save your work and integrate insights',
    ],
    outcomes: [
      'Deepen your self-knowledge',
      'Articulate what matters to you',
      'Identify where you can act',
    ],
    estimatedTime: '30-60 minutes per lab',
  },
  soul: {
    moduleId: 'soul',
    title: 'Soul',
    purpose: 'Explore the deeper alignment between your inner state and your actions.',
    actions: [
      'Reflect on core values and meaning',
      'Examine decision patterns',
      'Connect internal state to external choices',
    ],
    outcomes: [
      'Clarify what gives your life meaning',
      'Understand your core values',
      'See how they show up in your work and life',
    ],
    estimatedTime: 'Ongoing reflection',
  },
  systems: {
    moduleId: 'systems',
    title: 'Systems',
    purpose: 'Build practical structures that support your clarity and alignment.',
    actions: [
      'Learn about system design for your context',
      'Map your current systems and workflows',
      'Create aligned workflows',
    ],
    outcomes: [
      'Have systems that reflect your values',
      'Reduce friction in daily decisions',
      'Build sustainable practices',
    ],
    estimatedTime: '45 minutes per system',
  },
  reflections: {
    moduleId: 'reflections',
    title: 'Reflections',
    purpose: 'Collect and review your insights from labs and work.',
    actions: [
      'Integrate snapshots from completed labs',
      'Add personal reflections',
      'Review patterns over time',
    ],
    outcomes: [
      'Have a record of your clarity journey',
      'See progress and patterns',
      'Export your reflections',
    ],
    estimatedTime: 'Ongoing collection',
  },
  settings: {
    moduleId: 'settings',
    title: 'Settings',
    purpose: 'Manage your account, preferences, and program access.',
    actions: [
      'Update your profile information',
      'Manage email preferences',
      'Download your data',
    ],
    outcomes: [
      'Have full control over your data',
      'Customize your experience',
      'Manage your account securely',
    ],
    estimatedTime: '10 minutes',
  },
  deepen: {
    moduleId: 'deepen',
    title: 'Deepen',
    purpose: 'Access the full Accelerator experience with personalized guidance.',
    actions: [
      'Review your Compass results',
      'Choose your lab sequence',
      'Progress through integrated modules',
    ],
    outcomes: [
      'Complete the full clarity journey',
      'Have ongoing access to community',
      'Build sustainable clarity practices',
    ],
    estimatedTime: '6-12 weeks at your pace',
  },
};

export default function ModuleGuide({ moduleId }: { moduleId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const guide = moduleGuideContent[moduleId];

  if (!guide) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-lavenderViolet to-indigoDeep text-white shadow-lg hover:shadow-xl transition flex items-center justify-center font-semibold text-lg"
        aria-label="Toggle module guide"
        title="Module Guide"
      >
        ?
      </button>

      {/* Guide Panel */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 bg-white rounded-xl shadow-xl border border-warmCharcoal/10 p-6 space-y-4">
          {/* Header */}
          <div>
            <h3 className="text-lg font-semibold text-warmCharcoal">{guide.title}</h3>
            <p className="text-xs text-warmCharcoal/60 mt-1">
              {guide.estimatedTime && `~${guide.estimatedTime}`}
            </p>
          </div>

          {/* Purpose */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.1em] font-semibold text-warmCharcoal/70 mb-2">
              Purpose
            </h4>
            <p className="text-sm text-warmCharcoal/80">{guide.purpose}</p>
          </div>

          {/* Actions */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.1em] font-semibold text-warmCharcoal/70 mb-2">
              What to do now
            </h4>
            <ul className="text-sm text-warmCharcoal/80 space-y-1">
              {guide.actions.map((action, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="text-lavenderViolet">→</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Outcomes */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.1em] font-semibold text-warmCharcoal/70 mb-2">
              What you'll leave with
            </h4>
            <ul className="text-sm text-warmCharcoal/80 space-y-1">
              {guide.outcomes.map((outcome, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="text-indigoDeep">✓</span>
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Close hint */}
          <p className="text-xs text-warmCharcoal/50 pt-2 border-t border-warmCharcoal/10">
            Click the ? button to close
          </p>
        </div>
      )}
    </div>
  );
}
