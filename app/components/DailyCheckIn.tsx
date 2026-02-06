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
            <p className="text-2xl mb-1">✨</p>
            <p className="font-marcellus text-lg text-warmCharcoal mb-1">Saved. Your check-in is part of your ongoing Soul record.</p>
            <p className="text-sm text-warmCharcoal/70 font-marcellus">
              Thanks — today you might benefit from:
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-xs font-marcellus">
              {['Rest', 'Structure', 'Reflection', 'Expression'].map((item) => (
                <span
                  key={item}
                  className={`px-3 py-1 rounded-full border ${suggestions.includes(item) ? 'border-indigoDeep text-indigoDeep bg-indigoDeep/10' : 'border-warmCharcoal/15 text-warmCharcoal/70'}`}
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
      <p className="font-medium tracking-widest text-warmCharcoal/45 uppercase mb-4 font-marcellus" style={{ fontSize: '40px' }}>
          Today's Alignment Check
      </p>
      <p className="text-warmCharcoal/60 font-marcellus mb-4" style={{ fontSize: '40px' }}>You've checked in {checkinsLast7} of the last 7 days.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Emotions */}
        <div>
          <p className="font-marcellus text-warmCharcoal mb-3" style={{ fontSize: '40px' }}>How are you feeling?</p>
          <div className="flex flex-wrap gap-2">
            {EMOTIONS.map(emotion => (
              <button
                key={emotion}
                type="button"
                onClick={() => toggleEmotion(emotion)}
                className={`px-3 py-1 rounded-full text-xs transition-all ${
                  selectedEmotions.includes(emotion)
                    ? 'bg-salmonPeach text-white'
                    : 'bg-salmonPeach/20 text-warmCharcoal hover:bg-salmonPeach/40'
                }`}
              >
                {emotion}
              </button>
            ))}
          </div>
        </div>

        {/* Alignment Slider */}
        <div>
          <p className="font-marcellus text-warmCharcoal mb-3" style={{ fontSize: '40px' }}>
            Alignment with your purpose right now: <span className="font-bold">{alignment}/10</span>
          </p>
          <input
            type="range"
            min="1"
            max="10"
            value={alignment}
            onChange={(e) => setAlignment(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-warmCharcoal/50 mt-2 font-marcellus" style={{ fontSize: '40px' }}>
            <span>Off track</span>
            <span>Aligned</span>
          </div>
        </div>

        {/* Need */}
        <div>
          <p className="font-marcellus text-warmCharcoal mb-2" style={{ fontSize: '40px' }}>One thing you need today…</p>
          <input
            type="text"
            value={need}
            onChange={(e) => setNeed(e.target.value)}
            placeholder="Rest, clarity, connection…"
            className="w-full px-3 py-2 rounded-lg border border-warmCharcoal/20 text-sm font-marcellus"
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
