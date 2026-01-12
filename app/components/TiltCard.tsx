'use client';

import { useRef, useState } from 'react';
import Card from './Card';
import './TiltCard.css';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  accent?: 'lavender' | 'salmon' | 'gold' | 'none';
}

export default function TiltCard({ 
  children, 
  className = '', 
  hover = false, 
  accent = 'none'
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={isHovering ? 'pulsate-card' : ''}
      style={{
        transition: 'transform 0.3s ease-out',
      }}
    >
      <Card hover={hover} accent={accent} className={className}>
        {children}
      </Card>
    </div>
  );
}
