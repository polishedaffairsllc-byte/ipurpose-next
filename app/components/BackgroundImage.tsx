'use client';

import Image from 'next/image';

interface BackgroundImageProps {
  src: string;
  alt: string;
  fallbackColor?: string;
  children?: React.ReactNode;
}

export function BackgroundImage({
  src,
  alt,
  fallbackColor = 'from-lavenderViolet to-indigoDeep',
  children,
}: BackgroundImageProps) {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background Image */}
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        priority
        quality={85}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />

      {/* Content */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
