'use client';

/**
 * StickyNote Component
 * Displays a post as a colorful sticky note with rotation and playful styling
 */

import Link from 'next/link';
import { useMemo } from 'react';

interface StickyNoteProps {
  id: string;
  title: string | null;
  body: string;
  userId: string;
  createdAt?: string | null;
}

const noteColors = [
  '#fff3da', // creamButter
  '#d4af37', // deepGold
  '#e6c87c', // lightGold
  '#88b04b', // sage
  '#fcc4b7', // salmonPeach
  '#9c88ff', // lavenderViolet
  '#4b4e6d', // indigoDeep
];

export default function StickyNote({ id, title, body, userId, createdAt }: StickyNoteProps) {
  // Use ID to determine consistent color for this note
  const colorScheme = useMemo(() => {
    const index = id.charCodeAt(0) % noteColors.length;
    return noteColors[index];
  }, [id]);

  // Determine text color based on background - white text for dark indigo
  const textColor = useMemo(() => {
    return colorScheme === '#4b4e6d' ? '#ffffff' : '#2A2A2A';
  }, [colorScheme]);

  // Use ID to determine consistent rotation for this note
  const rotation = useMemo(() => {
    const charCode = id.charCodeAt(0);
    const rotationValues = [-3, -2, -1, 0, 1, 2, 3];
    const index = charCode % rotationValues.length;
    return rotationValues[index];
  }, [id]);

  // Format date
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) return 'Just now';
      return `${diffHours}h ago`;
    }
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Link href={`/community/post/${id}`}>
      <div
        className="relative p-4 rounded-sm cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105"
        style={{
          width: '300px',
          height: '300px',
          backgroundColor: colorScheme,
          border: `1px solid ${colorScheme}`,
          transform: `rotate(${rotation}deg)`,
          transformOrigin: 'center',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255,255,255,0.5)',
          fontFamily: 'Caveat, cursive',
        }}
      >
        {/* Pushpin */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full shadow-md border border-red-600" />
        
        {/* Content */}
        <div className="h-full flex flex-col justify-between">
          {/* Title and Body */}
          <div className="flex-1 overflow-hidden">
            {title && (
              <h3 className="font-caveat text-lg font-bold mb-1 line-clamp-1" style={{ color: textColor }}>
                {title}
              </h3>
            )}
            <p className="font-caveat text-sm line-clamp-4 leading-relaxed" style={{ color: textColor, opacity: 0.8 }}>
              {body}
            </p>
          </div>

          {/* Footer */}
          <div className="text-xs pt-2 border-t" style={{ color: textColor, opacity: 0.6, borderColor: textColor }}>
            <p>{formatDate(createdAt)}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
