'use client';

import { useEffect } from 'react';
import { initMetaPixel } from '@/lib/meta-pixel';

export default function PixelInitializer() {
  useEffect(() => {
    const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
    console.log('[MetaPixel] Initializing with ID:', pixelId);
    initMetaPixel();
  }, []);

  return null;
}
