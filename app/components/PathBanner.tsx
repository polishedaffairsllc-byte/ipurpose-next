'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import './PathBanners.css';

interface PathBannerProps {
  href: string;
  title: string;
  description: string;
  color: string;
}

export default function PathBanner({ 
  href, 
  title, 
  description, 
  color
}: PathBannerProps) {
  const [isHovering, setIsHovering] = useState(false);
  const router = useRouter();

  const handleClick = () => {
    router.push(href);
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="w-full cursor-pointer ipurpose-card hover:shadow-glow-lavender transition-all duration-300 flex items-center gap-6 p-6 border-0 bg-inherit"
      style={{ display: 'flex' }}
    >
      <div 
        className={`w-16 h-16 rounded-full flex-shrink-0 banner-circle ${isHovering ? 'pulsate-heartbeat' : ''}`}
        style={{ backgroundColor: color }}
      />
      <div className="text-center flex-grow">
        <h3 className="font-marcellus text-2xl text-warmCharcoal mb-2">{title}</h3>
        <p className="text-base text-warmCharcoal/70">{description}</p>
      </div>
      <span className="text-warmCharcoal/50 group-hover:text-warmCharcoal transition-colors">→</span>
    </button>
  );
}
