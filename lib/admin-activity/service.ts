import { createHash } from 'node:crypto';
import type { Auth, UserRecord } from 'firebase-admin/auth';
import { FieldPath, FieldValue, type DocumentSnapshot, type Firestore, type Query } from 'firebase-admin/firestore';
import { getAccountDeletionPlan } from '../accountDeletionPlan';
import { ACTIVITY_KINDS, type ActivityKind, type ActivityPage, type ActivityTarget, type PurgePreview } from './types';

const COLLECTIONS = { profiles: 'users', leads: 'leads', clarity: 'clarityCheckSubmissions', registrations: 'infoSessionRegistrations', cohorts: 'cohort-registrations', emails: 'emailTasks' } as const;
const MAX_PURGE = 350;
const MAX_SCAN = 10000;
const PAGE_SIZE = 100;
export class ActivityError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
const string = (value: unknown): string | null => typeof value === 'string' && value ? value : null;
const normalized = (value: unknown) => string(value)?.trim().toLowerCase() || null;
function date(value: unknown): string | null {
  const input = value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function' ? value.toDate() : value;
  if (!(typeof input === 'string' || typeof input === 'number' || input instanceof Date)) return null;
  const parsed = new Date(input);
  return Number.isFinite(parsed.getTime()) ? parsed.toISOString() : null;
}
export function targetOf(value: unknown): ActivityTarget {
  const item = value as Partial<ActivityTarget> | null;
  if (!item || !ACTIVITY_KINDS.includes(item.kind as ActivityKind) || typeof item.id !== 'string'
    || !item.id || item.id.length > 1500 || item.id.includes('/') || /^\.+$/.test(item.id)) {
    throw new ActivityError(400, 'Select a valid activity record.');
  }
  return item as ActivityTarget;
}
function protectedData(data: Record<string, unknown> | undefined) {
  return data?.admin === true || data?.isFounder === true || ['admin', 'founder'].includes(String(data?.role)) || data?.entitlementTier === 'founder';
}
export function assertPurgeAllowed(actorUid: string, uid: string | null, email: string | null, user?: UserRecord, profile?: Record<string, unknown>) {
  const owners = ['mshmltn@gmail.com', 'renita@ipurposesoul.com', process.env.FOUNDER_EMAIL].map(normalized);
  if ((uid && uid === actorUid) || (email && owners.includes(email)) || (normalized(profile?.email) && owners.includes(normalized(profile?.email))) || protectedData(user?.customClaims) || protectedData(profile)) {
    throw new ActivityError(403, 'Your own account and administrator/founder accounts cannot be purged.');
  }
}

export function createActivityService(db: Firestore, auth: Auth) {
  async function account(uidOrEmail: string, byEmail = false) {
    try { return await (byEmail ? auth.getUserByEmail(uidOrEmail) : auth.getUser(uidOrEmail)); }
    catch (error) { if ((error as { code?: string }).code === 'auth/user-not-found') return undefined; throw error; }
  }
  async function list(kind: ActivityKind, cursor?: string): Promise<ActivityPage> {
    if (!ACTIVITY_KINDS.includes(kind) || (cursor && cursor.length > 4000)) throw new ActivityError(400, 'Invalid page.');
    if (kind === 'accounts') {
      const page = await auth.listUsers(PAGE_SIZE, cursor || undefined);
      return { cursor: page.pageToken || null, rows: page.users.map(user => ({ kind, id: user.uid, email: user.email || null,
        name: user.displayName || null, date: date(user.metadata.creationTime), source: null,
        status: user.disabled ? 'disabled' : user.emailVerified ? 'verified' : 'unverified', score: null, identity: null })) };
    }
    // ID ordering includes legacy records without createdAt; every page is reachable.
    let query = db.collection(COLLECTIONS[kind]).orderBy(FieldPath.documentId()).limit(PAGE_SIZE);
    if (cursor) { targetOf({ kind, id: cursor }); query = query.startAfter(cursor); }
    const page = await query.get();
    return { cursor: page.size === PAGE_SIZE ? page.docs.at(-1)!.id : null, rows: page.docs.map(doc => {
      const data = doc.data();
      return { kind, id: doc.id, email: string(data.email), name: string(data.name ?? data.displayName ?? data.firstName),
        date: date(data.createdAt ?? data.timestamp ?? data.registeredAt ?? data.scheduledFor), source: string(data.source ?? data.type),
        status: string(data.status), score: typeof data.scores?.totalScore === 'number' ? data.scores.totalScore : null,
        identity: string(data.identityType) };
    }) };
  }

  async function plan(actorUid: string, target: ActivityTarget) {
    let selected: DocumentSnapshot | undefined;
    let user: UserRecord | undefined;
    let uid: string | null = null;
    let email: string | null = null;
    if (target.kind === 'accounts') {
      user = await account(target.id);
      if (!user) throw new ActivityError(404, 'Account no longer exists. Refresh the list.');
      uid = user.uid; email = normalized(user.email);
    } else {
      selected = await db.collection(COLLECTIONS[target.kind]).doc(target.id).get();
      if (!selected.exists) throw new ActivityError(404, 'Record no longer exists. Refresh the list.');
      const data = selected.data()!;
      uid = target.kind === 'profiles' ? target.id : string(data.uid); email = normalized(data.email);
      if (uid) user = await account(uid);
      const emailUser = email ? await account(email, true) : undefined;
      if ((uid && emailUser && uid !== emailUser.uid) || (user?.email && email && normalized(user.email) !== email)) {
        throw new ActivityError(409, 'Conflicting record identities. Manual review is required.');
      }
      user ||= emailUser;
      uid ||= user?.uid || null; email ||= normalized(user?.email);
    }
    if (uid && (uid.includes('/') || uid.length > 128)) throw new ActivityError(409, 'Invalid stored identity.');
    const profile = uid ? await db.collection('users').doc(uid).get() : undefined;
    assertPurgeAllowed(actorUid, uid, email, user, profile?.data());
    const operations = new Map<string, { doc: DocumentSnapshot; action: 'delete' | 'tombstone' | 'delink' }>();
    async function add(doc: DocumentSnapshot, action: 'delete' | 'tombstone' | 'delink' = 'delete') {
      if (operations.has(doc.ref.path)) return;
      if (doc.exists) operations.set(doc.ref.path, { doc, action });
      if (operations.size > MAX_PURGE) throw new ActivityError(409, 'This purge is too large for the safe single-batch limit. No data has been deleted.');
      if (action === 'delete') {
        for (const collection of await doc.ref.listCollections()) {
          const children = await collection.limit(MAX_PURGE + 1).get();
          if (children.size > MAX_PURGE) throw new ActivityError(409, 'Too many related records. No data has been deleted.');
          for (const child of children.docs) await add(child);
        }
      }
    }
    if (selected) await add(selected);
    // These older collections contain mixed-case emails, so exact equality alone would miss records.
    const sourceDocs: DocumentSnapshot[] = [];
    for (const collection of Object.values(COLLECTIONS)) {
      const page = await db.collection(collection).limit(MAX_SCAN + 1).get();
      if (page.size > MAX_SCAN) throw new ActivityError(409, 'The legacy identity scan needs an indexed migration before purging. No data has been deleted.');
      sourceDocs.push(...page.docs);
    }
    const linkedIds = new Set<string>(selected ? [selected.id] : []);
    for (const doc of sourceDocs) {
      const data = doc.data()!;
      const recordUid = doc.ref.parent.id === 'users' ? doc.id : data.uid;
      if ((email && normalized(data.email) === email) || (uid && recordUid === uid)) {
        if (doc.ref.parent.id === 'users' && recordUid !== uid) throw new ActivityError(409, 'Another profile shares this email. Manual review is required.');
        if (doc.ref.parent.id === 'users') assertPurgeAllowed(actorUid, uid, email, user, data);
        if ((data.uid && uid && data.uid !== uid) || (uid && data.uid === uid && email && normalized(data.email) && normalized(data.email) !== email)) {
          throw new ActivityError(409, 'Conflicting related identities. Manual review is required.');
        }
        await add(doc); linkedIds.add(doc.id);
      }
    }
    for (const doc of sourceDocs) {
      const data = doc.data()!;
      if (data.submissionId && linkedIds.has(data.submissionId)) {
        if (normalized(data.email) && normalized(data.email) !== email) throw new ActivityError(409, 'Conflicting linked email. Manual review is required.');
        await add(doc);
      }
    }
    async function addQuery(query: Query, action: 'delete' | 'tombstone' | 'delink' = 'delete') {
      const docs = await query.limit(MAX_PURGE + 1).get();
      if (docs.size > MAX_PURGE) throw new ActivityError(409, 'Too many related records. No data has been deleted.');
      for (const doc of docs.docs) await add(doc, action);
    }
    if (uid) {
      const existing = getAccountDeletionPlan(uid, email || undefined);
      for (const item of existing.directDocuments) await add(await db.collection(item.collection).doc(item.id).get());
      for (const item of existing.fieldQueries) {
        await addQuery(db.collection(item.collection).where(item.field, '==', item.value), item.collection === 'community_posts' ? 'tombstone' : 'delete');
      }
      await addQuery(db.collectionGroup('comments').where('authorUid', '==', uid));
      await addQuery(db.collection('purchases').where('uid', '==', uid), 'delink');
    }
    const entries = [...operations.values()].sort((a, b) => a.doc.ref.path.localeCompare(b.doc.ref.path));
    const fingerprint = createHash('sha256').update(JSON.stringify({ target, uid, email,
      accountCreated: user?.metadata.creationTime, claims: user?.customClaims,
      entries: entries.map(({ doc, action }) => [doc.ref.path, action, doc.updateTime?.toMillis(), doc.updateTime?.nanoseconds]),
    })).digest('hex');
    const preview: PurgePreview = { target, uid, email, loginExists: !!user, fingerprint, confirmation: `PURGE ${email || uid || target.id}`,
      counts: {}, pendingEmails: 0, records: entries.map(({ doc, action }) => ({ path: doc.ref.path, action })) };
    for (const { doc } of entries) {
      const collection = doc.ref.path.split('/')[0];
      preview.counts[collection] = (preview.counts[collection] || 0) + 1;
      if (collection === 'emailTasks' && doc.data()?.status === 'pending') preview.pendingEmails++;
    }
    return { preview, entries, user };
  }
  async function preview(actorUid: string, target: ActivityTarget) { return (await plan(actorUid, target)).preview; }
  async function purge(actorUid: string, target: ActivityTarget, fingerprint: string, confirmation: string) {
    const current = await plan(actorUid, target);
    if (confirmation !== current.preview.confirmation || fingerprint !== current.preview.fingerprint) {
      throw new ActivityError(409, 'Confirmation does not match or records changed. Preview again before deleting.');
    }
    try {
      // Disable first: a failure leaves a visible disabled account that can be safely retried.
      if (current.user) {
        const latest = await auth.getUser(current.user.uid);
        assertPurgeAllowed(actorUid, latest.uid, normalized(latest.email), latest);
        if (normalized(latest.email) !== current.preview.email) throw new ActivityError(409, 'Account changed; preview again.');
        await auth.updateUser(current.user.uid, { disabled: true });
        await auth.revokeRefreshTokens(current.user.uid);
      }
      const batch = db.batch();
      for (const { doc, action } of current.entries) {
        const precondition = { lastUpdateTime: doc.updateTime! };
        if (action === 'delete') batch.delete(doc.ref, precondition);
        else if (action === 'tombstone') batch.update(doc.ref, { authorUid: 'deleted-user', title: '', body: '', isDeleted: true, updatedAt: FieldValue.serverTimestamp() }, precondition);
        else batch.update(doc.ref, { uid: FieldValue.delete(), accountDeletedAt: FieldValue.serverTimestamp() }, precondition);
      }
      // Existing enrollment code honors this minimal suppression record. Do not remove existing opt-outs.
      if (current.preview.email) batch.set(db.collection('email_opt_outs').doc(Buffer.from(current.preview.email).toString('base64')), {
        adminPurged: true, updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
      await batch.commit();
      if (current.user) await auth.deleteUser(current.user.uid);
    } catch (error) {
      if (error instanceof ActivityError) throw error;
      throw new ActivityError(503, 'Purge did not finish. The login may be disabled and records may already be removed. Refresh Accounts and preview again; do not assume completion.');
    }
    return { purged: true, deletedLogin: !!current.user, records: current.entries.length, pendingEmails: current.preview.pendingEmails };
  }
  return { list, preview, purge };
}
