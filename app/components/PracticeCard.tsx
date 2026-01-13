'use client';

import { useState } from 'react';
import Card from './Card';
import Button from './Button';

export interface Practice {
  id: string;
  title: string;
  description: string;
  duration: number;
  instructions: string[];
  icon: string;
}

interface PracticeCardProps {
  practice: Practice;
  onComplete: () => void;
}

export default function PracticeCard({ practice, onComplete }: PracticeCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'instructions' | 'reflection' | 'confirmation'>('instructions');
  const [reflection, setReflection] = useState('');
  const [loading, setLoading] = useState(false);
  const [startTime] = useState(Date.now());

  const handleComplete = async () => {
    setLoading(true);
    const durationMinutes = Math.round((Date.now() - startTime) / 60000);

    try {
      const response = await fetch('/api/soul/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          practiceId: practice.id,
          reflection: reflection || undefined,
          durationMinutes
        })
      });

      if (response.ok) {
        setStep('confirmation');
        setTimeout(() => {
          setIsOpen(false);
          onComplete();
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Card hover>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">{practice.icon}</span>
          <h3 className="font-marcellus text-lg text-warmCharcoal">{practice.title}</h3>
        </div>
        <p className="text-sm text-warmCharcoal/65 mb-4 leading-relaxed font-montserrat">
          {practice.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-warmCharcoal/50 font-montserrat">{practice.duration}-{practice.duration + 5} minutes</span>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)}>
            Begin Practice →
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-warmCharcoal/55 mb-2 font-montserrat">Practice</p>
            <h2 className="font-marcellus text-2xl text-warmCharcoal">{practice.title}</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-warmCharcoal/50 hover:text-warmCharcoal text-2xl"
          >
            ✕
          </button>
        </div>

        {step === 'instructions' && (
          <div className="space-y-6">
            <div className="bg-lavenderViolet/5 p-4 rounded-lg">
              <p className="text-sm text-warmCharcoal/70 font-montserrat">{practice.description}</p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-warmCharcoal/55 mb-3 font-montserrat">Instructions</p>
              <ol className="space-y-3">
                {practice.instructions.map((instruction, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="font-bold text-lavenderViolet flex-shrink-0">{idx + 1}</span>
                    <p className="text-sm text-warmCharcoal/70 font-montserrat">{instruction}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex gap-4">
              <Button variant="secondary" onClick={() => setIsOpen(false)} className="flex-1">
                Not Now
              </Button>
              <Button onClick={() => setStep('reflection')} className="flex-1">
                I'm Ready
              </Button>
            </div>
          </div>
        )}

        {step === 'reflection' && (
          <div className="space-y-6">
            <div className="bg-salmonPeach/5 p-4 rounded-lg">
              <p className="text-sm text-warmCharcoal/70 font-montserrat">
                Take your time. When you're done, come back here.
              </p>
            </div>

            <div>
              <p className="text-sm font-marcellus text-warmCharcoal mb-2">Reflection (optional)</p>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="What came up for you? Any insights?"
                className="w-full px-3 py-2 rounded-lg border border-warmCharcoal/20 text-sm font-montserrat"
                rows={4}
              />
            </div>

            <Button onClick={handleComplete} disabled={loading} className="w-full">
              Complete Practice
            </Button>
          </div>
        )}

        {step === 'confirmation' && (
          <div className="text-center py-8 space-y-4">
            <p className="text-3xl">🎉</p>
            <p className="font-marcellus text-lg text-warmCharcoal">Practice complete</p>
            <p className="text-sm text-warmCharcoal/70 font-montserrat">
              You showed up for your soul. That's what matters.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
