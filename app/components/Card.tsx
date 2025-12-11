import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  accent?: 'lavender' | 'salmon' | 'gold' | 'none';
}

export default function Card({ children, className = '', hover = false, accent = 'none' }: CardProps) {
  const accentStyles = {
    lavender: 'border-l-2 border-lavenderViolet/70',
    salmon: 'border-l-2 border-salmonPeach/70',
    gold: 'border-l-2 border-softGold/70',
    none: '',
  };
  
  return (
    <div
      className={`ipurpose-card ${accentStyles[accent]} ${
        hover ? 'hover:border-white/10 hover:shadow-lg transition-all cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
