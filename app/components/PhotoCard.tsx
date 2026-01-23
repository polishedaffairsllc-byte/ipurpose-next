'use client';

import { useState, useEffect } from 'react';

interface PhotoCardProps {
  src: string;
  alt: string;
  title?: string;
  description?: string;
  className?: string;
  aspectRatio?: 'square' | 'landscape' | 'portrait';
}

export default function PhotoCard({ 
  src, 
  alt, 
  title, 
  description,
  className = '',
  aspectRatio = 'landscape'
}: PhotoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const aspectClasses = {
    square: 'aspect-square',
    landscape: 'aspect-[16/9]',
    portrait: 'aspect-[3/4]'
  };

  if (!isClient) {
    return (
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-lavenderViolet/10 to-salmonPeach/10 ${aspectClasses[aspectRatio]} ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-6">
            {title && <h3 className="font-marcellus text-2xl mb-2 text-warmCharcoal">{title}</h3>}
            {description && <p className="text-sm text-warmCharcoal/70">{description}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`group relative overflow-hidden rounded-2xl ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`relative ${aspectClasses[aspectRatio]} overflow-hidden`}>
        {/* Image with zoom effect */}
        {!imageError ? (
          <div
            className="absolute inset-0 transition-transform duration-700 ease-out"
            style={{
              transform: isHovered ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            {/* Use next/image for optimization */}
            <img
              src={src}
              alt={alt || 'iPurpose image'}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-lavenderViolet/20 to-salmonPeach/20 flex items-center justify-center">
            <div className="text-6xl">{title === 'Soul' ? '🧠' : title === 'Systems' ? '⚙️' : '✨'}</div>
          </div>
        )}

        {/* Gradient overlay */}
        <div 
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            background: 'linear-gradient(to top, rgba(42, 42, 42, 0.8) 0%, transparent 60%)',
            opacity: isHovered ? 1 : 0.6,
          }}
        />

        {/* Content overlay */}
        {(title || description) && (
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            {title && (
              <h3 
                className="font-marcellus text-2xl mb-2 transition-transform duration-500"
                style={{
                  transform: isHovered ? 'translateY(0)' : 'translateY(10px)',
                }}
              >
                {title}
              </h3>
            )}
            {description && (
              <p 
                className="text-sm opacity-90 transition-all duration-500"
                style={{
                  transform: isHovered ? 'translateY(0)' : 'translateY(20px)',
                  opacity: isHovered ? 1 : 0,
                }}
              >
                {description}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Glow border effect */}
      <div 
        className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-500"
        style={{
          boxShadow: '0 0 40px rgba(156, 136, 255, 0.4), inset 0 0 0 1px rgba(255, 255, 255, 0.2)',
          opacity: isHovered ? 1 : 0,
        }}
      />
    </div>
  );
}
