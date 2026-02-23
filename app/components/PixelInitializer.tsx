'use client';

import { useEffect } from 'react';
import { initMetaPixel } from '@/lib/meta-pixel';

export default function PixelInitializer() {
  useEffect(() => {
    initMetaPixel();
  }, []);

  return null;
}
