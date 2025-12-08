import { NextResponse } from 'next/server';

export async function GET() {
  const devFallback = process.env.NODE_ENV === 'development' && process.env.DEV_FALLBACK === 'true';
  return NextResponse.json({ devFallback });
}
