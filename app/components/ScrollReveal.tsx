'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale';
}

export default function ScrollReveal({ 
  children, 
  className = '', 
  delay = 0,
  direction = 'up'
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setIsVisible(true);
            }, delay);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [delay]);

  const getTransform = () => {
    if (isVisible) return 'translate(0, 0) scale(1)';
    
    switch (direction) {
      case 'up':
        return 'translate(0, 40px) scale(1)';
      case 'down':
        return 'translate(0, -40px) scale(1)';
      case 'left':
        return 'translate(40px, 0) scale(1)';
      case 'right':
        return 'translate(-40px, 0) scale(1)';
      case 'scale':
        return 'translate(0, 0) scale(0.9)';
      default:
        return 'translate(0, 40px) scale(1)';
    }
  };

  return (
    <div
      ref={elementRef}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {children}
    </div>
  );
}
