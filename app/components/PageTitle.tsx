import React from 'react';

interface PageTitleProps {
  children: React.ReactNode;
  subtitle?: string;
  className?: string;
}

export default function PageTitle({ children, subtitle, className = '' }: PageTitleProps) {
  return (
    <div className={`mb-6 sm:mb-8 md:mb-10 lg:mb-12 ${className}`}>
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-italiana text-lavenderViolet shadow-glow-lavender mb-2">
        {children}
      </h1>
      {subtitle && (
        <p className="text-xs sm:text-sm md:text-base lg:text-lg text-warmCharcoal/70 font-marcellus mt-2 sm:mt-3">
          {subtitle}
        </p>
      )}
    </div>
  );
}
