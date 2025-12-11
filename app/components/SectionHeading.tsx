import React from 'react';

interface SectionHeadingProps {
  children: React.ReactNode;
  level?: 'h2' | 'h3' | 'h4';
  className?: string;
}

export default function SectionHeading({ children, level = 'h2', className = '' }: SectionHeadingProps) {
  const sizes = {
    h2: 'text-2xl md:text-3xl',
    h3: 'text-xl md:text-2xl',
    h4: 'text-lg md:text-xl',
  };
  
  const Component = level;
  
  return (
    <Component className={`${sizes[level]} font-marcellus text-warmCharcoal font-semibold tracking-tight ${className}`}>
      {children}
    </Component>
  );
}
