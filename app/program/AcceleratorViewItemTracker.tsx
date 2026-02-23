'use client';

import { useEffect } from 'react';
import { trackViewItem } from '@/lib/analytics';

/**
 * Tracks view_item event for Accelerator product page
 * This component mounts on page load and fires the event
 */
export default function AcceleratorViewItemTracker() {
  useEffect(() => {
    trackViewItem({
      itemId: 'accelerator',
      itemName: 'iPurpose Accelerator',
      itemCategory: 'cohort_program',
      price: 1497,
      currency: 'USD',
    });
  }, []);

  // This component doesn't render anything
  return null;
}
