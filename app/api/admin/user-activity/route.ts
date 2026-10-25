import { NextRequest, NextResponse } from 'next/server';
import type { UserRecord } from 'firebase-admin/auth';
import type { DocumentReference, DocumentSnapshot, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import type {
  ActivityPlatform,
  CompassConversationActivity,
  CompassConversationResponse,
  UserActivityDetailResponse,
  UserActivityEvent,
  UserActivityListResponse,
  UserActivityRow,
} from '@/lib/admin-activity/userActivityTypes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const headers = { 'Cache-Control': 'private, no-store', Vary: 'Authorization' };
const MAX_USERS = 1000;
const MAX_CONVERSATIONS = 5000;
const MAX_CONVERSATION_MESSAGES = 200;
const UID_PATTERN = /^[a-zA-Z0-9_-]{1,128}$/;
const CONVERSATION_PATTERN = /^[a-zA-Z0-9_-]{1,128}$/;

function toIso(value: unknown): string | null {
  const candidate = value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function'
    ? value.toDate()
    : value;
  if (!(candidate instanceof Date || typeof candidate === 'string' || typeof candidate === 'number')) return null;
  const parsed = new Date(candidate);
  return Number.isFinite(parsed.getTime()) ? parsed.toISOString() : null;
}

function string(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function number(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function platform(value: unknown): ActivityPlatform {
  return value === 'android' || value === 'ios' || value === 'web' ? value : 'unknown';
}

function validUid(uid: string) {
  if (!UID_PATTERN.test(uid)) throw new Error('Invalid user ID.');
}

function validConversationId(conversationId: string) {
  if (!CONVERSATION_PATTERN.test(conversationId)) throw new Error('Invalid conversation ID.');
}

function isCompassRoute(value: string | null) {
  return value === '/mentor' || value === '/ai' || Boolean(value?.endsWith('/mentor'));
}

async function adminGate(request: NextRequest): Promise<NextResponse | null> {
  const token = /^Bearer (\S+)$/i.exec(request.headers.get('authorization') || '')?.[1];
  if (!token) return NextResponse.json({ error: 'Administrator sign-in is required.' }, { status: 401, headers });
  const auth = firebaseAdmin.auth();
  try {
    const decoded = await auth.verifyIdToken(token, true);
    const actor = await auth.getUser(decoded.uid);
    if (decoded.admin !== true || actor.customClaims?.admin !== true || actor.disabled) {
      return NextResponse.json({ error: 'Administrator access is required.' }, { status: 403, headers });
    }
    return null;
  } catch {
    return NextResponse.json({ error: 'Sign in again to continue.' }, { status: 401, headers });
  }
}

async function listAuthUsers(): Promise<{ users: UserRecord[]; truncated: boolean }> {
  const auth = firebaseAdmin.auth();
  const users: UserRecord[] = [];
  let pageToken: string | undefined;
  do {
    const page = await auth.listUsers(Math.min(1000, MAX_USERS - users.length), pageToken);
    users.push(...page.users);
    pageToken = page.pageToken;
  } while (pageToken && users.length < MAX_USERS);
  return { users, truncated: Boolean(pageToken) };
}

async function getMany(refs: DocumentReference[]): Promise<DocumentSnapshot[]> {
  const db = firebaseAdmin.firestore();
  const output: DocumentSnapshot[] = [];
  for (let i = 0; i < refs.length; i += 100) {
    output.push(...await db.getAll(...refs.slice(i, i + 100)));
  }
  return output;
}

type ConversationAggregate = {
  count: number;
  messages: number;
  firstAt: string | null;
  lastAt: string | null;
};

async function conversationAggregates() {
  const db = firebaseAdmin.firestore();
  const snapshot = await db.collectionGroup('companionConversations').limit(MAX_CONVERSATIONS).get();
  const byUid = new Map<string, ConversationAggregate>();
  for (const document of snapshot.docs) {
    const uid = document.ref.parent.parent?.id;
    if (!uid) continue;
    const data = document.data();
    const createdAt = toIso(data.createdAt);
    const updatedAt = toIso(data.updatedAt) || createdAt;
    const current = byUid.get(uid) || { count: 0, messages: 0, firstAt: null, lastAt: null };
    current.count += 1;
    current.messages += number(data.messageCount);
    if (createdAt && (!current.firstAt || createdAt < current.firstAt)) current.firstAt = createdAt;
    if (updatedAt && (!current.lastAt || updatedAt > current.lastAt)) current.lastAt = updatedAt;
    byUid.set(uid, current);
  }
  return byUid;
}

function buildRow(
  user: UserRecord,
  profileDoc: DocumentSnapshot | undefined,
  summaryDoc: DocumentSnapshot | undefined,
  conversations: ConversationAggregate | undefined,
): UserActivityRow {
  const profileData = profileDoc?.data() || {};
  const summaryData = summaryDoc?.data() || {};
  const conversation = conversations || { count: 0, messages: 0, firstAt: null, lastAt: null };
  const registeredAt = toIso(user.metadata.creationTime);
  const lastSignInAt = toIso(user.metadata.lastSignInTime);
  const lastSeenAt = toIso(summaryData.lastSeenAt) || conversation.lastAt || lastSignInAt || registeredAt;
  return {
    uid: user.uid,
    email: user.email || string(profileData.email),
    name: string(profileData.name ?? profileData.displayName ?? profileData.firstName) || user.displayName || null,
    registeredAt,
    lastSignInAt,
    lastSeenAt,
    emailVerified: user.emailVerified,
    disabled: user.disabled,
    platform: platform(summaryData.platform),
    compass: {
      conversationCount: conversation.count,
      storedMessageCount: conversation.messages,
      trackedSessionCount: number(summaryData.compassSessionCount),
      trackedExchangeCount: number(summaryData.compassExchangeCount),
      totalTrackedDurationMs: number(summaryData.totalCompassDurationMs),
      firstConversationAt: conversation.firstAt,
      lastConversationAt: conversation.lastAt,
      lastEnterAt: toIso(summaryData.lastCompassEnterAt),
      lastExitAt: toIso(summaryData.lastCompassExitAt),
    },
  };
}

async function listUsers(): Promise<UserActivityListResponse> {
  const db = firebaseAdmin.firestore();
  const { users, truncated } = await listAuthUsers();
  users.sort((a, b) => String(b.metadata.creationTime).localeCompare(String(a.metadata.creationTime)));
  const [profileDocs, summaryDocs, conversations] = await Promise.all([
    getMany(users.map(user => db.collection('users').doc(user.uid))),
    getMany(users.map(user => db.collection('userActivitySummaries').doc(user.uid))),
    conversationAggregates(),
  ]);
  const profiles = new Map(profileDocs.map(doc => [doc.id, doc]));
  const summaries = new Map(summaryDocs.map(doc => [doc.id, doc]));
  return {
    users: users.map(user => buildRow(user, profiles.get(user.uid), summaries.get(user.uid), conversations.get(user.uid))),
    truncated,
    generatedAt: new Date().toISOString(),
  };
}

function mapEvent(document: QueryDocumentSnapshot): UserActivityEvent | null {
  const data = document.data();
  const validEventTypes = new Set<UserActivityEvent['type']>([
    'account_created', 'login', 'screen_view', 'clarity_check_start', 'clarity_check_complete',
    'purpose_check_start', 'purpose_check_complete', 'compass_enter', 'compass_message', 'compass_exit',
  ]);
  const rawType = string(data.type) as UserActivityEvent['type'] | null;
  if (!rawType || !validEventTypes.has(rawType)) return null;
  return {
    id: document.id,
    type: rawType,
    at: toIso(data.createdAt),
    platform: platform(data.platform),
    sessionId: string(data.sessionId),
    conversationId: string(data.conversationId),
    durationMs: typeof data.durationMs === 'number' ? data.durationMs : null,
    reason: string(data.reason),
    route: string(data.route),
    previousRoute: string(data.previousRoute),
  };
}

async function clarityCompletion(uid: string, email: string | null): Promise<string | null> {
  const db = firebaseAdmin.firestore();
  const uidSnapshot = await db.collection('clarityCheckSubmissions').where('uid', '==', uid).limit(50).get();
  let docs = uidSnapshot.docs;
  if (!docs.length && email) {
    const emailSnapshot = await db.collection('clarityCheckSubmissions').where('email', '==', email.trim().toLowerCase()).limit(50).get();
    docs = emailSnapshot.docs;
  }
  return docs
    .map(document => toIso(document.data().createdAt))
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1) || null;
}

async function detail(uid: string): Promise<UserActivityDetailResponse> {
  validUid(uid);
  const db = firebaseAdmin.firestore();
  const auth = firebaseAdmin.auth();
  const [user, profileDoc, summaryDoc, eventsSnapshot, conversationsSnapshot] = await Promise.all([
    auth.getUser(uid),
    db.collection('users').doc(uid).get(),
    db.collection('userActivitySummaries').doc(uid).get(),
    db.collection('users').doc(uid).collection('activityEvents').orderBy('createdAt', 'desc').limit(200).get(),
    db.collection('users').doc(uid).collection('companionConversations').orderBy('updatedAt', 'desc').limit(MAX_CONVERSATIONS).get(),
  ]);

  const conversationAggregate: ConversationAggregate = { count: 0, messages: 0, firstAt: null, lastAt: null };
  const allConversations: CompassConversationActivity[] = conversationsSnapshot.docs.map(document => {
    const data = document.data();
    const createdAt = toIso(data.createdAt);
    const updatedAt = toIso(data.updatedAt) || createdAt;
    conversationAggregate.count += 1;
    conversationAggregate.messages += number(data.messageCount);
    if (createdAt && (!conversationAggregate.firstAt || createdAt < conversationAggregate.firstAt)) conversationAggregate.firstAt = createdAt;
    if (updatedAt && (!conversationAggregate.lastAt || updatedAt > conversationAggregate.lastAt)) conversationAggregate.lastAt = updatedAt;
    return {
      id: document.id,
      messageCount: number(data.messageCount),
      createdAt,
      updatedAt,
      responseMode: string(data.responseMode),
    };
  });

  const recentEvents = eventsSnapshot.docs
    .map(mapEvent)
    .filter((event): event is UserActivityEvent => Boolean(event));
  const summaryData = summaryDoc.data() || {};
  const profileData = profileDoc.data() || {};
  const email = user.email || string(profileData.email);
  const savedClarityCompletedAt = await clarityCompletion(uid, email || null);
  const purposeProfile = profileData.purposeProfile && typeof profileData.purposeProfile === 'object'
    ? profileData.purposeProfile as Record<string, unknown>
    : null;
  const savedPurposeCompletedAt = purposeProfile ? toIso(purposeProfile.completedAt) : null;

  const clarityStartedAt = toIso(summaryData.lastClarityStartAt)
    || recentEvents.find(event => event.type === 'clarity_check_start')?.at
    || null;
  const clarityTrackedCompleteAt = toIso(summaryData.lastClarityCompleteAt)
    || recentEvents.find(event => event.type === 'clarity_check_complete')?.at
    || null;
  const purposeStartedAt = toIso(summaryData.lastPurposeStartAt)
    || recentEvents.find(event => event.type === 'purpose_check_start')?.at
    || null;
  const purposeTrackedCompleteAt = toIso(summaryData.lastPurposeCompleteAt)
    || recentEvents.find(event => event.type === 'purpose_check_complete')?.at
    || null;

  const chronological = [...recentEvents].sort((a, b) => String(a.at).localeCompare(String(b.at)));
  const compassScreen = chronological.find(event => event.type === 'screen_view' && isCompassRoute(event.route));
  const routeBeforeCompass = compassScreen?.previousRoute || null;
  const routeAfterCompass = chronological.find(event =>
    event.type === 'screen_view'
    && isCompassRoute(event.previousRoute)
    && !isCompassRoute(event.route)
  )?.route || null;

  return {
    user: buildRow(user, profileDoc, summaryDoc, conversationAggregate),
    journey: {
      clarity: {
        startedAt: clarityStartedAt,
        completedAt: savedClarityCompletedAt || clarityTrackedCompleteAt,
        startEvidence: clarityStartedAt ? 'tracked_event' : 'not_tracked',
        completionEvidence: savedClarityCompletedAt ? 'saved_record' : clarityTrackedCompleteAt ? 'tracked_event' : 'none',
      },
      purpose: {
        startedAt: purposeStartedAt,
        completedAt: savedPurposeCompletedAt || purposeTrackedCompleteAt,
        startEvidence: purposeStartedAt ? 'tracked_event' : 'not_tracked',
        completionEvidence: savedPurposeCompletedAt ? 'saved_record' : purposeTrackedCompleteAt ? 'tracked_event' : 'none',
      },
      routeBeforeCompass,
      routeAfterCompass,
    },
    recentEvents,
    recentConversations: allConversations.slice(0, 50),
  };
}

async function conversation(uid: string, conversationId: string): Promise<CompassConversationResponse> {
  validUid(uid);
  validConversationId(conversationId);
  const db = firebaseAdmin.firestore();
  const reference = db.collection('users').doc(uid).collection('companionConversations').doc(conversationId);
  const conversationDoc = await reference.get();
  if (!conversationDoc.exists) {
    const error = new Error('Conversation not found.');
    (error as Error & { code?: string }).code = 'conversation/not-found';
    throw error;
  }
  const snapshot = await reference.collection('messages').orderBy('sequence', 'asc').limit(MAX_CONVERSATION_MESSAGES).get();
  return {
    uid,
    conversationId,
    messages: snapshot.docs.map(document => {
      const data = document.data();
      const lens = data.inferredLens;
      return {
        id: document.id,
        role: data.role === 'assistant' ? 'assistant' as const : 'user' as const,
        content: typeof data.content === 'string' ? data.content : '',
        sequence: number(data.sequence),
        createdAt: toIso(data.createdAt),
        responseMode: string(data.responseMode),
        inferredLens: lens === 'soul' || lens === 'systems' || lens === 'ai' ? lens : null,
      };
    }),
  };
}

export async function GET(request: NextRequest) {
  const denied = await adminGate(request);
  if (denied) return denied;
  try {
    const params = new URL(request.url).searchParams;
    const uid = params.get('uid');
    const conversationId = params.get('conversationId');
    const payload = uid && conversationId
      ? await conversation(uid, conversationId)
      : uid
        ? await detail(uid)
        : await listUsers();
    return NextResponse.json(payload, { headers });
  } catch (error) {
    const code = (error as { code?: string }).code;
    const status = code === 'auth/user-not-found' || code === 'conversation/not-found' ? 404 : 503;
    return NextResponse.json({ error: status === 404 ? 'User or conversation not found.' : 'User activity is unavailable. Please retry.' }, { status, headers });
  }
}
