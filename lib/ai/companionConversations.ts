import { accountDeletionLock } from '../accountDeletionLock';
import { AI_CONSENT_VERSION, CompanionSafetyError } from './companionSafety';
import { compassRequestRef } from './compassRequests';
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import {
  boundCompanionHistory,
  getCompanionModelConfig,
} from "@/lib/ai/companionModelConfig";
import type {
  CompanionConversationSummary,
  CompanionMessage,
} from "@/lib/ai/companionTypes";
import type { ResponseMode } from "@/lib/ai/prompts/ipurposeMentorPrompts";

const CONVERSATION_ID_PATTERN = /^[a-zA-Z0-9_-]{1,128}$/;
const RESPONSE_MODES = new Set<ResponseMode>(["balanced", "reflect", "build", "expand"]);

type UnknownRecord = Record<string, unknown>;

export class CompanionConversationError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "CompanionConversationError";
  }
}

function toIso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  const timestamp = value as { toDate?: () => Date } | undefined;
  try {
    return timestamp && typeof timestamp.toDate === "function"
      ? timestamp.toDate().toISOString()
      : new Date(0).toISOString();
  } catch {
    return new Date(0).toISOString();
  }
}

function responseMode(value: unknown): ResponseMode {
  return RESPONSE_MODES.has(value as ResponseMode) ? (value as ResponseMode) : "balanced";
}

function inferredLens(value: unknown): "soul" | "systems" | "ai" | undefined {
  return value === "soul" || value === "systems" || value === "ai"
    ? value
    : undefined;
}

function titleFromMessage(message: string): string {
  const normalized = message.replace(/\s+/g, " ").trim();
  return normalized.length > 64 ? `${normalized.slice(0, 63)}…` : normalized;
}

function conversationRef(uid: string, conversationId: string) {
  return firebaseAdmin
    .firestore()
    .collection("users")
    .doc(uid)
    .collection("companionConversations")
    .doc(conversationId);
}

function requireValidConversationId(conversationId: string) {
  if (!CONVERSATION_ID_PATTERN.test(conversationId)) {
    throw new CompanionConversationError("Invalid conversation ID", 400);
  }
}

export async function listCompanionConversations(
  uid: string,
  limit = 20
): Promise<CompanionConversationSummary[]> {
  const snapshot = await firebaseAdmin
    .firestore()
    .collection("users")
    .doc(uid)
    .collection("companionConversations")
    .orderBy("updatedAt", "desc")
    .limit(Math.min(Math.max(limit, 1), 20))
    .get();

  return snapshot.docs.map((document) => {
    const data = document.data() as UnknownRecord;
    return {
      id: document.id,
      title: typeof data.title === "string" ? data.title : "Mentor conversation",
      responseMode: responseMode(data.responseMode),
      messageCount: typeof data.messageCount === "number" ? data.messageCount : 0,
      createdAt: toIso(data.createdAt),
      updatedAt: toIso(data.updatedAt),
    };
  });
}

export async function getCompanionMessages(
  uid: string,
  conversationId: string
): Promise<CompanionMessage[]> {
  requireValidConversationId(conversationId);
  const reference = conversationRef(uid, conversationId);
  const conversation = await reference.get();
  if (!conversation.exists) {
    throw new CompanionConversationError("Conversation not found", 404);
  }

  const { maxHistoryMessages } = getCompanionModelConfig();
  const snapshot = await reference
    .collection("messages")
    .orderBy("sequence", "desc")
    .limit(maxHistoryMessages)
    .get();

  return snapshot.docs
    .map((document) => {
      const data = document.data() as UnknownRecord;
      return {
        id: document.id,
        role: data.role === "assistant" ? "assistant" as const : "user" as const,
        content: typeof data.content === "string" ? data.content : "",
        responseMode: responseMode(data.responseMode),
        sequence: typeof data.sequence === "number" ? data.sequence : 0,
        createdAt: toIso(data.createdAt),
        inferredLens: inferredLens(data.inferredLens),
      };
    })
    .reverse();
}

export async function getCompanionHistory(
  uid: string,
  conversationId: string | undefined
): Promise<Array<{ role: "user" | "assistant"; content: string }>> {
  if (!conversationId) return [];
  const messages = await getCompanionMessages(uid, conversationId);
  const { maxHistoryCharacters } = getCompanionModelConfig();
  return boundCompanionHistory(
    messages.map(({ role, content }) => ({ role, content })),
    maxHistoryCharacters
  );
}

export async function saveCompanionTurnWithMessage(options: {
  uid: string;
  conversationId?: string;
  responseMode: ResponseMode;
  userMessage: string;
  assistantMessage: string;
  model: string;
  inferredLens?: "soul" | "systems" | "ai";
  requestId?: string;
}): Promise<{ conversationId: string; assistantMessageId: string }> {
  const { uid, responseMode: mode, userMessage, assistantMessage, model, inferredLens } = options;
  if (options.conversationId) requireValidConversationId(options.conversationId);

  const collection = firebaseAdmin
    .firestore()
    .collection("users")
    .doc(uid)
    .collection("companionConversations");
  const reference = options.conversationId
    ? collection.doc(options.conversationId)
    : collection.doc();

  const userMessageRef = reference.collection("messages").doc();
  const assistantMessageRef = reference.collection("messages").doc();
  await firebaseAdmin.firestore().runTransaction(async (transaction) => {
    const db = firebaseAdmin.firestore();
    const [deleting, profile] = await Promise.all([transaction.get(accountDeletionLock(db, uid)), transaction.get(db.collection('users').doc(uid))]);
    if (deleting.exists || !profile.exists) throw new CompanionSafetyError('Account deletion is in progress or your profile is unavailable.', 403);
    const existing = await transaction.get(reference);
    const requestRef = options.requestId ? compassRequestRef(firebaseAdmin.firestore(), uid, options.requestId) : null;
    if (requestRef) {
      const [request, permission] = await Promise.all([
        transaction.get(requestRef),
        transaction.get(firebaseAdmin.firestore().collection('users').doc(uid).collection('consents').doc('compassAi')),
      ]);
      if (request.data()?.status !== 'pending') throw new CompanionSafetyError('The message request is no longer pending.', 409);
      if (permission.data()?.granted !== true || permission.data()?.version !== AI_CONSENT_VERSION) throw new CompanionSafetyError('AI permission was withdrawn. Your draft is kept.', 403);
    }
    if (options.conversationId && !existing.exists) {
      throw new CompanionConversationError("Conversation not found", 404);
    }

    const current = existing.exists ? (existing.data() as UnknownRecord) : {};
    const currentCount = typeof current.messageCount === "number" ? current.messageCount : 0;
    const userSequence = currentCount + 1;
    const assistantSequence = currentCount + 2;
    const now = firebaseAdmin.firestore.Timestamp.now();
    const assistantCreatedAt = firebaseAdmin.firestore.Timestamp.fromMillis(now.toMillis() + 1);

    transaction.set(reference, {
      title: typeof current.title === "string" ? current.title : titleFromMessage(userMessage),
      responseMode: mode,
      messageCount: assistantSequence,
      createdAt: current.createdAt || now,
      updatedAt: assistantCreatedAt,
      lastModel: model,
    }, { merge: true });

    transaction.set(userMessageRef, {
      role: "user",
      content: userMessage,
      responseMode: mode,
      sequence: userSequence,
      createdAt: now,
    });

    if (requestRef) transaction.set(requestRef, {
      status: 'completed', finishedAt: new Date(), reply: {
        response: assistantMessage, conversationId: reference.id, assistantMessageId: assistantMessageRef.id,
        responseMode: mode, model, ...(inferredLens ? { inferredLens } : {}),
      },
    }, { merge: true });
    transaction.set(assistantMessageRef, {
      role: "assistant",
      content: assistantMessage,
      responseMode: mode,
      sequence: assistantSequence,
      createdAt: assistantCreatedAt,
      model,
      ...(inferredLens ? { inferredLens } : {}),
    });
  });

  return { conversationId: reference.id, assistantMessageId: assistantMessageRef.id };
}

export async function saveCompanionTurn(options: Parameters<typeof saveCompanionTurnWithMessage>[0]): Promise<string> {
  return (await saveCompanionTurnWithMessage(options)).conversationId;
}
