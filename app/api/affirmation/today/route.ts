/**
 * GET /api/affirmation/today
 * Returns today's affirmation based on America/New_York timezone
 */

import { getTodaysAffirmation } from '@/lib/affirmationClient';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const affirmation = await getTodaysAffirmation();
    return NextResponse.json({ affirmation }, { status: 200 });
  } catch (error) {
    console.error('Error fetching today\'s affirmation:', error);
    return NextResponse.json(
      { affirmation: 'I create space for what matters.' },
      { status: 200 }
    );
  }
}
