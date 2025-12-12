'use client';

import { useRef, useState, MouseEvent } from 'react';
import Card from './Card';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  accent?: 'lavender' | 'salmon' | 'gold' | 'none';
  intensity?: number;
}

export default function TiltCard({ 
  children, 
  className = '', 
  hover = false, 
  accent = 'none',
  intensity = 15 
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const tiltX = ((y - centerY) / centerY) * intensity;
    const tiltY = ((x - centerX) / centerX) * -intensity;

    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: 'transform 0.1s ease-out',
      }}
    >
      <Card hover={hover} accent={accent} className={className}>
        {children}
      </Card>
    </div>
  );
}
