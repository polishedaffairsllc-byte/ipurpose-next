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

interface Props {
  practice: Practice;
  defaultOpen?: boolean;
  suggested?: boolean;
}

export default function PracticeCard({ practice, defaultOpen = false, suggested = false }: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
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
          window.location.reload();
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card hover>
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{practice.icon}</span>
          <div>
            <h3 className="font-marcellus text-lg text-warmCharcoal flex items-center gap-2">
              {practice.title}
              {suggested && <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Suggested for today</span>}
            </h3>
            <p className="text-xs text-warmCharcoal/60 font-marcellus">{practice.duration}-{practice.duration + 5} minutes</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsOpen((prev) => {
              const next = !prev;
              if (next) {
                setStep('instructions');
                setReflection('');
              }
              return next;
            });
          }}
        >
          {isOpen ? 'Collapse' : 'Begin'}
        </Button>
      </div>

      <p className="text-sm text-warmCharcoal/65 mb-4 leading-relaxed font-marcellus">
        {practice.description}
      </p>

      {isOpen && (
        <div className="space-y-5">
          {step === 'instructions' && (
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-warmCharcoal/55 mb-3 font-marcellus">Instructions</p>
                <ol className="space-y-3">
                  {practice.instructions.map((instruction, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="font-bold text-lavenderViolet flex-shrink-0">{idx + 1}</span>
                      <p className="text-sm text-warmCharcoal/70 font-marcellus">{instruction}</p>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="flex gap-4">
                <Button variant="secondary" onClick={() => setIsOpen(false)} className="flex-1">
                  Save for later
                </Button>
                <Button onClick={() => setStep('reflection')} className="flex-1">
                  I'm Ready
                </Button>
              </div>
            </div>
          )}

          {step === 'reflection' && (
            <div className="space-y-4">
              <div className="bg-salmonPeach/5 p-4 rounded-lg">
                <p className="text-sm text-warmCharcoal/70 font-marcellus">
                  Take your time. When you're done, come back here.
                </p>
              </div>

              <div>
                <p className="text-sm font-marcellus text-warmCharcoal mb-2">Reflection (optional)</p>
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="What came up for you? Any insights?"
                  className="w-full px-3 py-2 rounded-lg border border-warmCharcoal/20 text-sm font-marcellus"
                  rows={4}
                />
              </div>

              <Button onClick={handleComplete} disabled={loading} className="w-full">
                Complete Practice
              </Button>
            </div>
          )}

          {step === 'confirmation' && (
            <div className="text-center py-4 space-y-3">
              <p className="text-3xl">🎉</p>
              <p className="font-marcellus text-lg text-warmCharcoal">Practice complete</p>
              <p className="text-sm text-warmCharcoal/70 font-marcellus">
                You showed up for your soul. That’s enough for today.
              </p>
              <p className="text-xs text-warmCharcoal/55 font-marcellus">Saved to your reflections.</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
