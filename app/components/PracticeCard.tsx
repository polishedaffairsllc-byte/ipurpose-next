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
          setIsOpen(false);
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
          <span style={{ fontSize: '96px' }}>{practice.icon}</span>
          <div>
            <h3 className="flex items-center gap-2" style={{ fontFamily: 'Marcellus, serif', color: '#2A2A2A', fontSize: '64px' }}>
              {practice.title}
              {suggested && <span style={{ fontSize: '44px', padding: '4px 16px', borderRadius: '9999px', backgroundColor: '#d1fae5', color: '#065f46' }}>Suggested for today</span>}
            </h3>
            <p style={{ color: 'rgba(42,42,42,0.6)', fontFamily: 'Marcellus, serif', fontSize: '56px' }}>{practice.duration}-{practice.duration + 5} minutes</p>
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

      <p className="mb-4 leading-relaxed" style={{ color: 'rgba(42,42,42,0.65)', fontFamily: 'Marcellus, serif', fontSize: '56px' }}>
        {practice.description}
      </p>

      {isOpen && (
        <div className="space-y-5">
          {step === 'instructions' && (
            <div className="space-y-4">
              <div>
                <p className="mb-3" style={{ textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(42,42,42,0.55)', fontFamily: 'Marcellus, serif', fontSize: '48px' }}>Instructions</p>
                <ol className="space-y-3">
                  {practice.instructions.map((instruction, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span style={{ fontWeight: 'bold', color: '#9C88FF', flexShrink: 0 }}>{idx + 1}</span>
                      <p style={{ color: 'rgba(42,42,42,0.7)', fontFamily: 'Marcellus, serif', fontSize: '56px' }}>{instruction}</p>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="flex gap-4">
                <Button variant="secondary" onClick={() => setIsOpen(false)} className="flex-1">
                  Save for later
                </Button>
                <Button onClick={() => setStep('reflection')} className="flex-1">
                  Start reflection
                </Button>
              </div>
            </div>
          )}

          {step === 'reflection' && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(252,196,183,0.05)' }}>
                <p style={{ fontSize: '56px', color: 'rgba(42,42,42,0.7)', fontFamily: 'Marcellus, serif' }}>
                  Take your time. When you're done, come back here.
                </p>
              </div>

              <div>
                <p className="mb-2" style={{ fontSize: '56px', fontFamily: 'Marcellus, serif', color: '#2A2A2A' }}>Reflection (optional)</p>
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="What came up for you? Any insights?"
                  className="w-full"
                  rows={4}
                  style={{ padding: '16px 24px', borderRadius: '8px', border: '1px solid rgba(42,42,42,0.2)', fontSize: '56px', fontFamily: 'Marcellus, serif' }}
                />
              </div>

              <div className="space-y-2">
                <Button onClick={handleComplete} disabled={loading} className="w-full">
                  I'm Ready
                </Button>
                <p className="text-center" style={{ fontSize: '48px', color: 'rgba(42,42,42,0.6)', fontFamily: 'Marcellus, serif' }}>
                  This saves your reflection and closes the practice.
                </p>
              </div>
            </div>
          )}

          {step === 'confirmation' && (
            <div className="text-center py-4 space-y-3">
              <p style={{ fontSize: '120px' }}>🎉</p>
              <p style={{ fontFamily: 'Marcellus, serif', fontSize: '72px', color: '#2A2A2A' }}>Practice saved</p>
              <p style={{ fontSize: '56px', color: 'rgba(42,42,42,0.7)', fontFamily: 'Marcellus, serif' }}>
                This reflection will be available in your Soul history and Insights.
              </p>
              <p style={{ fontSize: '48px', color: 'rgba(42,42,42,0.55)', fontFamily: 'Marcellus, serif' }}>Take a breath, then choose what's next.</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
