/**
 * Preferences API Route
 * Client-side access to user preferences and session management
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import { getUserPreferences, updateDomainPreferences, getActiveSession, completeSession } from '../gpt/utils/preferences';
import type { GPTDomain } from '../gpt/types';

export async function GET(request: NextRequest) {
  try {
    // Authenticate
    const cookieStore = await cookies();
    const session = cookieStore.get('FirebaseSession')?.value;
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await firebaseAdmin.auth().verifySessionCookie(session, true);
    const userId = decodedToken.uid;

    // Get preferences
    const preferences = await getUserPreferences(userId);

    return NextResponse.json({ success: true, data: preferences });
  } catch (error) {
    console.error('Get preferences error:', error);
    return NextResponse.json(
      { error: 'Failed to get preferences' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate
    const cookieStore = await cookies();
    const session = cookieStore.get('FirebaseSession')?.value;
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await firebaseAdmin.auth().verifySessionCookie(session, true);
    const userId = decodedToken.uid;

    const body = await request.json();
    const { action, domain, data } = body;

    if (action === 'update') {
      // Update domain preferences
      if (!domain || !data) {
        return NextResponse.json(
          { error: 'Missing domain or data' },
          { status: 400 }
        );
      }

      await updateDomainPreferences(userId, domain as GPTDomain, data);
      return NextResponse.json({ success: true });
    }

    if (action === 'getActiveSession') {
      // Get active session
      if (!domain) {
        return NextResponse.json(
          { error: 'Missing domain' },
          { status: 400 }
        );
      }

      const activeSession = await getActiveSession(userId, domain as GPTDomain);
      return NextResponse.json({ success: true, data: activeSession });
    }

    if (action === 'completeSession') {
      // Complete session
      const { sessionId } = body;
      if (!sessionId) {
        return NextResponse.json(
          { error: 'Missing sessionId' },
          { status: 400 }
        );
      }

      await completeSession(sessionId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Preferences API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
