import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  accent?: 'lavender' | 'salmon' | 'gold' | 'none';
}

export default function Card({ children, className = '', hover = false, accent = 'none' }: CardProps) {
  const accentStyles = {
    lavender: 'ipurpose-card-lavender',
    salmon: 'ipurpose-card-salmon',
    gold: 'ipurpose-card-gold',
    none: '',
  };
  
  return (
    <div
      className={`ipurpose-card ${accentStyles[accent]} ${
        hover ? 'cursor-pointer group' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
