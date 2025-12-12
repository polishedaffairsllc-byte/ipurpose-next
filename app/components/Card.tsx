import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  accent?: 'lavender' | 'salmon' | 'gold' | 'none';
}

export default function Card({ children, className = '', hover = false, accent = 'none' }: CardProps) {
  const accentStyles = {
    lavender: 'border-accent-lavender',
    salmon: 'border-accent-salmon',
    gold: 'border-accent-gold',
    none: '',
  };
  
  return (
    <div
      className={`bg-white border border-lavenderViolet/10 rounded-2xl p-6 lg:p-8 shadow-soft ${
        accentStyles[accent]
      } ${
        hover
          ? 'hover:border-lavenderViolet/30 hover:shadow-xl transition-all cursor-pointer focus-within:ring-2 focus-within:ring-indigoDeep/40'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
