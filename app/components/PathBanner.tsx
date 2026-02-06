'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import './PathBanners.css';

interface PathBannerProps {
  href: string;
  title: string;
  description: string;
  color: string;
  descriptionStyle?: React.CSSProperties;
}

export default function PathBanner({ 
  href, 
  title, 
  description, 
  color,
  descriptionStyle
}: PathBannerProps) {
  const [isHovering, setIsHovering] = useState(false);
  const router = useRouter();

  const handleClick = () => {
    router.push(href);
  };

  const handleMouseEnter = () => {
    console.log('Hovering - isHovering set to true');
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    console.log('Left - isHovering set to false');
    setIsHovering(false);
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`w-full cursor-pointer ipurpose-card hover:shadow-glow-lavender transition-all duration-300 flex items-center gap-6 p-6 border-0 bg-inherit ${isHovering ? 'pulsate-heartbeat' : ''}`}
      style={{ display: 'flex' }}
    >
      <div 
        className={`w-16 h-16 rounded-full flex-shrink-0 ${isHovering ? 'scale-110' : 'scale-100'}`}
        style={{ 
          backgroundColor: color,
          transition: 'transform 0.3s ease-in-out, filter 0.6s ease-in-out infinite',
          transform: isHovering ? 'scale(1.1)' : 'scale(1)',
          animation: isHovering ? 'heartbeatOmbre 0.8s ease-in-out infinite' : 'none'
        }}
      />
      <div className="text-center flex-grow">
        <h3 className="font-marcellus text-2xl text-warmCharcoal mb-2">{title}</h3>
        <p className="text-base text-warmCharcoal/70" style={descriptionStyle}>{description}</p>
      </div>
      <span className="text-warmCharcoal/50 group-hover:text-warmCharcoal transition-colors">→</span>
    </button>
  );
}
