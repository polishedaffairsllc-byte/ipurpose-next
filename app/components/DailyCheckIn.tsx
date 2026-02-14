'use client';

import { useState } from 'react';
import Card from './Card';
import Button from './Button';
import { addCheckInToToday } from '@/lib/dailySessionClient';

const EMOTIONS = ['Grounded', 'Energized', 'Uncertain', 'Tired', 'Inspired', 'Anxious', 'Peaceful'];

interface Props {
  checkinsLast7: number;
}

export default function DailyCheckIn({ checkinsLast7 }: Props) {
  const [step, setStep] = useState<'form' | 'confirmation'>('form');
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [alignment, setAlignment] = useState(5);
  const [need, setNeed] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions(prev =>
      prev.includes(emotion)
        ? prev.filter(e => e !== emotion)
        : [...prev, emotion]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const nextSuggestions: string[] = [];
    if (alignment <= 4 || selectedEmotions.includes('Tired') || selectedEmotions.includes('Anxious')) {
      nextSuggestions.push('Rest');
    }
    if (alignment <= 6 || selectedEmotions.includes('Uncertain')) {
      nextSuggestions.push('Structure');
    }
    if (alignment >= 7 || selectedEmotions.includes('Inspired') || selectedEmotions.includes('Energized')) {
      nextSuggestions.push('Expression');
    }
    if (!nextSuggestions.length) {
      nextSuggestions.push('Reflection');
    }
    setSuggestions(Array.from(new Set(nextSuggestions)));
    try {
      // Save to Soul checkin endpoint
      const response = await fetch('/api/soul/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emotions: selectedEmotions,
          alignmentScore: alignment,
          need,
          type: 'daily'
        })
      });

      // Also save to daily session
      if (response.ok) {
        try {
          await addCheckInToToday({
            emotions: selectedEmotions,
            alignmentScore: alignment,
            need,
            type: 'daily',
          });
        } catch (err) {
          console.error('Failed to save to daily session:', err);
          // Don't fail the whole operation if daily session fails
        }

        setStep('confirmation');
        setTimeout(() => window.location.reload(), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  if (step === 'confirmation') {
    return (
      <Card accent="salmon" className="mb-8">
          <div className="text-center py-6 space-y-3">
            <p style={{ fontSize: '96px', marginBottom: '4px' }}>✨</p>
            <p style={{ fontFamily: 'Marcellus, serif', fontSize: '72px', color: '#2A2A2A', marginBottom: '4px' }}>Saved. Your check-in is part of your ongoing Soul record.</p>
            <p style={{ fontSize: '56px', color: 'rgba(42,42,42,0.7)', fontFamily: 'Marcellus, serif' }}>
              Thanks — today you might benefit from:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {['Rest', 'Structure', 'Reflection', 'Expression'].map((item) => (
                <span
                  key={item}
                  style={{
                    padding: '8px 24px',
                    borderRadius: '9999px',
                    fontSize: '48px',
                    fontFamily: 'Marcellus, serif',
                    border: suggestions.includes(item) ? '1px solid #4B4E6D' : '1px solid rgba(42,42,42,0.15)',
                    color: suggestions.includes(item) ? '#4B4E6D' : 'rgba(42,42,42,0.7)',
                    backgroundColor: suggestions.includes(item) ? 'rgba(75,78,109,0.1)' : 'transparent',
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
      </Card>
    );
  }

  return (
    <Card accent="salmon" className="mb-8">
      <p style={{ fontSize: '48px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(42,42,42,0.45)', fontFamily: 'Marcellus, serif', marginBottom: '16px' }}>
          Today's Alignment Check
      </p>
      <p style={{ fontSize: '56px', color: 'rgba(42,42,42,0.6)', fontFamily: 'Marcellus, serif', marginBottom: '16px' }}>You've checked in {checkinsLast7} of the last 7 days.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Emotions */}
        <div>
          <p style={{ fontSize: '56px', color: '#2A2A2A', fontFamily: 'Marcellus, serif', marginBottom: '12px' }}>How are you feeling?</p>
          <div className="flex flex-wrap gap-2">
            {EMOTIONS.map(emotion => (
              <button
                key={emotion}
                type="button"
                onClick={() => toggleEmotion(emotion)}
                style={{
                  padding: '16px 32px',
                  borderRadius: '9999px',
                  fontSize: '56px',
                  fontFamily: 'Marcellus, serif',
                  transition: 'all 0.2s',
                  border: selectedEmotions.includes(emotion) ? '2px solid #FCC4B7' : '2px solid rgba(42,42,42,0.15)',
                  backgroundColor: selectedEmotions.includes(emotion) ? '#FCC4B7' : '#fff',
                  color: selectedEmotions.includes(emotion) ? '#fff' : 'rgba(42,42,42,0.7)',
                  transform: selectedEmotions.includes(emotion) ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: selectedEmotions.includes(emotion) ? '0 4px 12px rgba(252,196,183,0.4)' : 'none',
                  cursor: 'pointer',
                }}
              >
                {emotion}
              </button>
            ))}
          </div>
        </div>

        {/* Alignment Slider */}
        <div>
          <p style={{ fontSize: '56px', color: '#2A2A2A', fontFamily: 'Marcellus, serif', marginBottom: '12px' }}>
            Alignment with your purpose right now: <strong>{alignment}/10</strong>
          </p>
          <input
            type="range"
            min="1"
            max="10"
            value={alignment}
            onChange={(e) => setAlignment(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between mt-2" style={{ fontSize: '48px', color: 'rgba(42,42,42,0.5)', fontFamily: 'Marcellus, serif' }}>
            <span>Off track</span>
            <span>Aligned</span>
          </div>
        </div>

        {/* Need */}
        <div>
          <p style={{ fontSize: '56px', color: '#2A2A2A', fontFamily: 'Marcellus, serif', marginBottom: '8px' }}>One thing you need today…</p>
          <input
            type="text"
            value={need}
            onChange={(e) => setNeed(e.target.value)}
            placeholder="Rest, clarity, connection…"
            style={{ width: '100%', padding: '16px 24px', borderRadius: '8px', border: '1px solid rgba(42,42,42,0.2)', fontSize: '56px', fontFamily: 'Marcellus, serif' }}
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          Save Check-in
        </Button>
      </form>
    </Card>
  );
}
