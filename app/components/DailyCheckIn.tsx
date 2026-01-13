'use client';

import { useState } from 'react';
import Card from './Card';
import Button from './Button';

const EMOTIONS = ['Grounded', 'Energized', 'Uncertain', 'Tired', 'Inspired', 'Anxious', 'Peaceful'];

interface DailyCheckInProps {
  onComplete: () => void;
}

export default function DailyCheckIn({ onComplete }: DailyCheckInProps) {
  const [step, setStep] = useState<'form' | 'confirmation'>('form');
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [alignment, setAlignment] = useState(5);
  const [need, setNeed] = useState('');
  const [loading, setLoading] = useState(false);

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

    try {
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

      if (response.ok) {
        setStep('confirmation');
        setTimeout(() => onComplete(), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  if (step === 'confirmation') {
    return (
      <Card accent="salmon" className="mb-8">
        <div className="text-center py-6">
          <p className="text-2xl mb-3">✨</p>
          <p className="font-marcellus text-lg text-warmCharcoal mb-2">Check-in saved</p>
          <p className="text-sm text-warmCharcoal/70 font-montserrat">
            You're showing up for yourself. That's the practice.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card accent="salmon" className="mb-8">
      <p className="text-xs font-medium tracking-widest text-warmCharcoal/45 uppercase mb-4 font-montserrat">
        Today's Check-in
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Emotions */}
        <div>
          <p className="text-sm font-marcellus text-warmCharcoal mb-3">How are you feeling?</p>
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
          <p className="text-sm font-marcellus text-warmCharcoal mb-3">
            Alignment with your purpose: <span className="font-bold">{alignment}/10</span>
          </p>
          <input
            type="range"
            min="1"
            max="10"
            value={alignment}
            onChange={(e) => setAlignment(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-warmCharcoal/50 mt-2 font-montserrat">
            <span>Off track</span>
            <span>Aligned</span>
          </div>
        </div>

        {/* Need */}
        <div>
          <p className="text-sm font-marcellus text-warmCharcoal mb-2">One thing you need today…</p>
          <input
            type="text"
            value={need}
            onChange={(e) => setNeed(e.target.value)}
            placeholder="Rest, clarity, connection…"
            className="w-full px-3 py-2 rounded-lg border border-warmCharcoal/20 text-sm font-montserrat"
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
