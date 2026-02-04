'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface ImageSlideshowProps {
  images: string[];
}

export default function ImageSlideshow({ images }: ImageSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    
    // Lub (first beat)
    timers.push(setTimeout(() => setScale(1.04), 0));
    timers.push(setTimeout(() => setScale(1), 250));
    
    // Dub (second beat)
    timers.push(setTimeout(() => setScale(1.04), 400));
    timers.push(setTimeout(() => setScale(1), 650));
    
    // Change to next image after pause
    timers.push(setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000));

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [currentIndex, images.length]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {images.map((src, index) => (
        <div
          key={src}
          style={{
            position: 'absolute',
            opacity: index === currentIndex ? 1 : 0,
            transform: `scale(${index === currentIndex ? scale : 1})`,
            transition: 'opacity 0.5s ease-in-out, transform 0.15s ease-in-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '500px',
            height: '500px',
          }}
        >
          <Image
            src={src}
            alt={`Soul meditation icon ${index + 1}`}
            width={500}
            height={500}
            style={{ objectFit: 'contain', width: '500px', height: '500px' }}
            priority={index === 0}
          />
        </div>
      ))}
    </div>
  );
}
