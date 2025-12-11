import React from 'react';

interface PageTitleProps {
  children: React.ReactNode;
  subtitle?: string;
  className?: string;
}

export default function PageTitle({ children, subtitle, className = '' }: PageTitleProps) {
  return (
    <div className={`mb-8 md:mb-12 ${className}`}>
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-italiana text-lavenderViolet drop-shadow-[0_0_22px_rgba(156,136,255,0.6)] mb-2">
        {children}
      </h1>
      {subtitle && (
        <p className="text-base md:text-lg text-white/70 font-marcellus mt-3">
          {subtitle}
        </p>
      )}
    </div>
  );
}
