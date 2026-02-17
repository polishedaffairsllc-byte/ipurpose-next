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
  { bg: 'bg-yellow-100', border: 'border-yellow-200', shadow: 'shadow-yellow-200' },
  { bg: 'bg-pink-100', border: 'border-pink-200', shadow: 'shadow-pink-200' },
  { bg: 'bg-blue-100', border: 'border-blue-200', shadow: 'shadow-blue-200' },
  { bg: 'bg-green-100', border: 'border-green-200', shadow: 'shadow-green-200' },
  { bg: 'bg-purple-100', border: 'border-purple-200', shadow: 'shadow-purple-200' },
  { bg: 'bg-rose-100', border: 'border-rose-200', shadow: 'shadow-rose-200' },
  { bg: 'bg-sky-100', border: 'border-sky-200', shadow: 'shadow-sky-200' },
  { bg: 'bg-amber-100', border: 'border-amber-200', shadow: 'shadow-amber-200' },
];

export default function StickyNote({ id, title, body, userId, createdAt }: StickyNoteProps) {
  // Use ID to determine consistent color for this note
  const colorScheme = useMemo(() => {
    const index = id.charCodeAt(0) % noteColors.length;
    return noteColors[index];
  }, [id]);

  // Use ID to determine consistent rotation for this note
  const rotation = useMemo(() => {
    const hash = id.charCodeAt(0) + id.charCodeAt(id.length - 1);
    const degrees = ((hash % 8) - 4); // -4 to +4 degrees
    return degrees;
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
        className={`relative h-48 p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${colorScheme.bg} ${colorScheme.border} shadow-md`}
        style={{
          transform: `rotate(${rotation}deg)`,
          transformOrigin: 'center',
        }}
      >
        {/* Pushpin */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full shadow-md border border-red-600" />
        
        {/* Content */}
        <div className="h-full flex flex-col justify-between">
          {/* Title and Body */}
          <div className="flex-1 overflow-hidden">
            {title && (
              <h3 className="font-caveat text-lg font-bold text-warmCharcoal mb-1 line-clamp-1">
                {title}
              </h3>
            )}
            <p className="font-caveat text-sm text-warmCharcoal/80 line-clamp-4 leading-relaxed">
              {body}
            </p>
          </div>

          {/* Footer */}
          <div className="text-xs text-warmCharcoal/60 pt-2 border-t border-current/20">
            <p>{formatDate(createdAt)}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
