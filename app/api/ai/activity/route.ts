import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { requireAuthenticated } from '@/lib/apiEntitlementHelper';
import { firebaseAdmin } from '@/lib/firebaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EVENT_TYPES = new Set(['account_created', 'login', 'compass_enter', 'compass_message', 'compass_exit']);
const PLATFORMS = new Set(['android', 'ios', 'web', 'unknown']);
const REASONS = new Set(['blur', 'background', 'unknown']);

type ActivityEventType = 'account_created' | 'login' | 'compass_enter' | 'compass_message' | 'compass_exit';
type ActivityPlatform = 'android' | 'ios' | 'web' | 'unknown';

type ActivityBody = {
  type?: unknown;
  platform?: unknown;
  sessionId?: unknown;
  conversationId?: unknown;
  durationMs?: unknown;
  reason?: unknown;
};

function optionalIdentifier(value: unknown, max = 128): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string') throw new Error('Invalid activity identifier.');
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max || !/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    throw new Error('Invalid activity identifier.');
  }
  return trimmed;
}

export async function POST(request: NextRequest) {
  const authentication = await requireAuthenticated();
  if (authentication.error) return authentication.error;
  const uid = authentication.uid;

  let body: ActivityBody | null = null;
  try {
    body = await request.json() as ActivityBody;
  } catch {
    return NextResponse.json({ error: 'Invalid activity payload.' }, { status: 400 });
  }

  try {
    const type = typeof body?.type === 'string' && EVENT_TYPES.has(body.type)
      ? body.type as ActivityEventType
      : null;
    if (!type) return NextResponse.json({ error: 'Invalid activity type.' }, { status: 400 });

    const platform = typeof body?.platform === 'string' && PLATFORMS.has(body.platform)
      ? body.platform as ActivityPlatform
      : 'unknown';
    const sessionId = optionalIdentifier(body?.sessionId);
    const conversationId = optionalIdentifier(body?.conversationId);
    const reason = typeof body?.reason === 'string' && REASONS.has(body.reason)
      ? body.reason
      : undefined;
    const durationMs = body?.durationMs === undefined || body.durationMs === null
      ? undefined
      : Number(body.durationMs);
    if (durationMs !== undefined && (!Number.isFinite(durationMs) || durationMs < 0 || durationMs > 24 * 60 * 60 * 1000)) {
      return NextResponse.json({ error: 'Invalid activity duration.' }, { status: 400 });
    }

    const db = firebaseAdmin.firestore();
    const now = FieldValue.serverTimestamp();
    const eventRef = db.collection('users').doc(uid).collection('activityEvents').doc();
    const summaryRef = db.collection('userActivitySummaries').doc(uid);

    const event: Record<string, unknown> = {
      type,
      platform,
      createdAt: now,
    };
    if (sessionId) event.sessionId = sessionId;
    if (conversationId) event.conversationId = conversationId;
    if (durationMs !== undefined) event.durationMs = Math.round(durationMs);
    if (reason) event.reason = reason;

    const summary: Record<string, unknown> = {
      platform,
      lastSeenAt: now,
      lastEventType: type,
      updatedAt: now,
    };
    if (type === 'account_created') summary.accountCreatedEventAt = now;
    if (type === 'login') summary.lastLoginAt = now;
    if (type === 'compass_enter') {
      summary.lastCompassEnterAt = now;
      summary.compassSessionCount = FieldValue.increment(1);
    }
    if (type === 'compass_message') {
      summary.lastCompassMessageAt = now;
      summary.compassExchangeCount = FieldValue.increment(1);
    }
    if (type === 'compass_exit') {
      summary.lastCompassExitAt = now;
      if (durationMs !== undefined) summary.totalCompassDurationMs = FieldValue.increment(Math.round(durationMs));
    }

    const batch = db.batch();
    batch.set(eventRef, event);
    batch.set(summaryRef, summary, { merge: true });
    await batch.commit();

    return NextResponse.json({ saved: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save activity.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
