'use client';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Card from './Card';
import Button from './Button';

const ARCHETYPES = {
  visionary: {
    name: 'Visionary',
    emoji: '✨',
    strength: 'You see possibilities others don\'t. Strategic clarity and long-term vision.',
    shadow: 'Can feel isolated by big-picture thinking. Struggle with doubt about feasibility.',
    reframe: 'Your ability to see forward is a gift. Start small, trust the process.'
  },
  builder: {
    name: 'Builder',
    emoji: '🎯',
    strength: 'You create systems and structures that scale. Turning ideas into reality.',
    shadow: 'Can get lost in execution. Worry that the work is never "enough."',
    reframe: 'Your systems create space for others to thrive. Pace yourself—this is a marathon.'
  },
  healer: {
    name: 'Healer',
    emoji: '💫',
    strength: 'You hold space for deep transformation. Intuitive guidance and healing.',
    shadow: 'Can absorb others\' pain. Struggle with boundaries and saying no.',
    reframe: 'Your compassion is powerful. You cannot pour from an empty cup. Fill yours first.'
  }
};

export default function ArchetypeSelector() {
  const { user } = useAuth();
  const [step, setStep] = useState<'quiz' | 'selection'>('quiz');
  const [selectedPrimary, setSelectedPrimary] = useState<keyof typeof ARCHETYPES | null>(null);
  const [selectedSecondary, setSelectedSecondary] = useState<keyof typeof ARCHETYPES | null>(null);
  const [loading, setLoading] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<{ [key: number]: string }>({});

  const questions = [
    {
      id: 1,
      question: 'What energizes you most?',
      options: [
        { text: 'Seeing the big picture and possible futures', archetype: 'visionary' },
        { text: 'Building systems that work beautifully', archetype: 'builder' },
        { text: 'Helping others transform', archetype: 'healer' }
      ]
    },
    {
      id: 2,
      question: 'When facing a challenge, you tend to:',
      options: [
        { text: 'Step back and see the strategic angle', archetype: 'visionary' },
        { text: 'Create a plan and execute', archetype: 'builder' },
        { text: 'Understand the human element first', archetype: 'healer' }
      ]
    },
    {
      id: 3,
      question: 'Your shadow (self-judgment) sounds like:',
      options: [
        { text: '"Am I crazy for dreaming this big?"', archetype: 'visionary' },
        { text: '"I\'m never doing enough."', archetype: 'builder' },
        { text: '"I\'m giving too much away."', archetype: 'healer' }
      ]
    }
  ];

  const handleQuizAnswer = (questionId: number, archetype: string) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: archetype }));
  };

  const handleQuizComplete = () => {
    const scores = { visionary: 0, builder: 0, healer: 0 };
    Object.values(quizAnswers).forEach(a => {
      scores[a as keyof typeof scores]++;
    });
    
    const [primary] = Object.entries(scores).sort(([, a], [, b]) => b - a);
    setSelectedPrimary(primary[0] as keyof typeof ARCHETYPES);
    setStep('selection');
  };

  const handleSaveArchetype = async () => {
    if (!selectedPrimary || !user) return;

    setLoading(true);
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          archetypePrimary: selectedPrimary,
          archetypeSecondary: selectedSecondary,
          archetypeUpdatedAt: new Date().toISOString()
        })
      });

      // Actually save to Firestore via an API
      const saveResponse = await fetch('/api/soul/archetype', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primary: selectedPrimary,
          secondary: selectedSecondary
        })
      });

      if (saveResponse.ok) {
        window.location.reload();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card accent="lavender" className="mb-8">
      <p className="text-xs font-medium tracking-widest text-warmCharcoal/45 uppercase mb-4 font-marcellus">
        Find Your Archetype
      </p>

      {step === 'quiz' ? (
        <div className="space-y-6">
          {questions.map(q => (
            <div key={q.id} className="space-y-3">
              <p className="font-marcellus text-warmCharcoal">{q.question}</p>
              <div className="space-y-2">
                {q.options.map((opt, idx) => (
                  <label key={idx} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name={`q${q.id}`}
                      checked={quizAnswers[q.id] === opt.archetype}
                      onChange={() => handleQuizAnswer(q.id, opt.archetype)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-warmCharcoal/70 font-marcellus">{opt.text}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <Button
            onClick={handleQuizComplete}
            disabled={Object.keys(quizAnswers).length < 3}
            className="w-full"
          >
            See Your Archetype
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-warmCharcoal/55 mb-2 font-marcellus">Primary</p>
              <div className="bg-lavenderViolet/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{ARCHETYPES[selectedPrimary!].emoji}</span>
                  <p className="font-marcellus text-lg text-warmCharcoal">{ARCHETYPES[selectedPrimary!].name}</p>
                </div>
                <p className="text-sm text-warmCharcoal/70 mb-3 font-marcellus">{ARCHETYPES[selectedPrimary!].strength}</p>
                <p className="text-xs text-warmCharcoal/60 italic mb-2 font-marcellus">Shadow: "{ARCHETYPES[selectedPrimary!].shadow}"</p>
                <p className="text-xs text-warmCharcoal/70 font-marcellus">{ARCHETYPES[selectedPrimary!].reframe}</p>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-warmCharcoal/55 mb-2 font-marcellus">Secondary (optional)</p>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(ARCHETYPES).map(([key, arch]) => {
                  if (key === selectedPrimary) return null;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedSecondary(selectedSecondary === key ? null : (key as keyof typeof ARCHETYPES))}
                      className={`p-3 rounded-lg text-center transition-all ${
                        selectedSecondary === key
                          ? 'bg-lavenderViolet text-white'
                          : 'bg-lavenderViolet/10 text-warmCharcoal hover:bg-lavenderViolet/20'
                      }`}
                    >
                      <div className="text-lg mb-1">{arch.emoji}</div>
                      <div className="text-xs font-marcellus">{arch.name}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <Button
            onClick={handleSaveArchetype}
            disabled={loading}
            className="w-full"
          >
            Save My Archetype
          </Button>
        </div>
      )}
    </Card>
  );
}
