const RECENT_AUTHENTICATION_WINDOW_SECONDS = 5 * 60;

export const ACCOUNT_DIRECT_DOCUMENT_COLLECTIONS = [
  "users",
  "user-preferences",
  "user-contexts",
  "identity_maps",
  "meaning_maps",
  "agency_maps",
  "labs",
  "integration",
  "learning_path_progress",
  "labCompletion",
  "aiBlueprintResponses",
  "starterPackResponses",
  "rate-limits",
  "userProgress",
] as const;

export const ACCOUNT_UID_QUERY_COLLECTIONS = [
  "clarityCheckSubmissions",
  "workflowSystems",
  "lab_events",
  "activation_a_states",
  "cohort-registrations",
] as const;

export const ACCOUNT_USER_ID_QUERY_COLLECTIONS = [
  "gpt-interactions",
  "conversation-sessions",
  "conversation-memory",
] as const;

const LAB_COMPLETION_KEYS = ["identity", "meaning", "agency"] as const;

export function isRecentAuthentication(
  authTimeSeconds: number | undefined,
  nowSeconds = Math.floor(Date.now() / 1000)
): boolean {
  if (!Number.isFinite(authTimeSeconds)) return false;
  const ageSeconds = nowSeconds - (authTimeSeconds as number);
  return ageSeconds >= 0 && ageSeconds <= RECENT_AUTHENTICATION_WINDOW_SECONDS;
}

export function getAccountDeletionPlan(uid: string, email?: string) {
  const normalizedEmail = email?.trim().toLowerCase() || undefined;

  return {
    directDocuments: [
      ...ACCOUNT_DIRECT_DOCUMENT_COLLECTIONS.map((collection) => ({ collection, id: uid })),
      ...LAB_COMPLETION_KEYS.map((key) => ({ collection: "lab_completion", id: `${uid}_${key}` })),
    ],
    fieldQueries: [
      ...ACCOUNT_UID_QUERY_COLLECTIONS.map((collection) => ({ collection, field: "uid", value: uid })),
      ...ACCOUNT_USER_ID_QUERY_COLLECTIONS.map((collection) => ({ collection, field: "userId", value: uid })),
      { collection: "community_posts", field: "authorUid", value: uid },
      ...(normalizedEmail ? [
        { collection: "clarityCheckSubmissions", field: "email", value: normalizedEmail },
        { collection: "emailTasks", field: "email", value: normalizedEmail },
        { collection: "leads", field: "email", value: normalizedEmail },
      ] : []),
    ],
    purchaseQuery: { collection: "purchases", field: "uid", value: uid },
    commentsQuery: { collectionGroup: "comments", field: "authorUid", value: uid },
  } as const;
}
