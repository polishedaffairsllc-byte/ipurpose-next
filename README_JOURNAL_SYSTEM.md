# Journal & Reflection System - Complete Implementation

## 📋 What's Included

This is a production-ready journaling and reflection system for your iPurpose Next.js + Firebase app.

### Files Created

**Type Definitions:**
- `lib/types/journal.ts` - TypeScript interfaces for all domain models

**Core Utilities:**
- `lib/journal/dateUtils.ts` - Date/timezone utilities, ID generation
- `lib/journal/firestoreHelpers.ts` - Server-side Firestore operations

**React Hooks:**
- `lib/journal/useJournalEntryAutosave.ts` - Client-side autosave with debouncing

**Components:**
- `app/components/JournalEntryBox.tsx` - Reusable entry textarea with save status
- `app/components/SessionSummary.tsx` - Session summary display with print/download

**Documentation:**
- `docs/JOURNAL_SYSTEM.md` - Complete architecture guide
- `docs/JOURNAL_INTEGRATION_EXAMPLE.md` - Practical integration example
- `docs/firestore-rules-journal.security` - Firestore security rules

## 🏗️ Architecture

### Firestore Schema

```
users/{uid}/
  journalEntries/{entryId}
    - type: affirmation_reflection | intention | free_journal | soul_reflection | systems_note
    - status: draft | final
    - content: string
    - sessionId: string
    - source: overview | soul | systems | ai
    - promptText?: string
    - tags?: string[]
    - createdAt, updatedAt: Timestamp

  sessions/{sessionId}
    - startedAt, endedAt: Timestamp
    - dateKey: YYYY-MM-DD
    - summary?: { title, highlights[], generatedAt, model }
```

### Key Features

✅ **Session Management**
- Auto-creates today's session on page load
- Tracks session duration
- Generates AI-style summaries on finalization

✅ **Draft & Final States**
- Entries start as draft (autosave enabled)
- Finalize session → marks all drafts as final
- Immutable after finalization

✅ **Autosave**
- Debounced 1 second
- Real-time UI feedback (Saving... / Saved 2m ago / Error)
- Handles network errors gracefully

✅ **Multiple Reflection Types**
- Affirmation reflection
- Intention setting
- Free journal
- Soul alignment
- Systems notes

✅ **Session Summary**
- Generated on session finalization
- Lists all entries by type
- Print & download as text file
- Print-friendly stylesheet

✅ **Security**
- User data isolation via Firestore rules
- No cross-user data leakage
- Auth verified server-side

## 🚀 Quick Start

### 1. Use the TypeScript Interfaces

```typescript
import type { JournalEntry, Session } from "@/lib/types/journal";

const entry: JournalEntry = {
  type: "affirmation_reflection",
  status: "draft",
  content: "...",
  // ... other fields
};
```

### 2. Server-Side: Create/Fetch Session

```typescript
// In your dashboard/page.tsx (server component)
import { getOrCreateSession, getOrCreateDraftEntry } from "@/lib/journal/firestoreHelpers";

const session = await getOrCreateSession(uid);
const entry = await getOrCreateDraftEntry(
  uid,
  session.id,
  "affirmation_reflection",
  "overview",
  "What does this mean to you?"
);
```

### 3. Client-Side: Render with Autosave

```typescript
"use client";

import { useJournalEntryAutosave } from "@/lib/journal/useJournalEntryAutosave";
import { JournalEntryBox } from "@/app/components/JournalEntryBox";

function MyJournalComponent({ entry, uid }) {
  const { content, setContent, autosaveState } = useJournalEntryAutosave(
    entry.id,
    entry.content,
    (newContent) => autosaveEntry(uid, entry.id, { content: newContent })
  );

  return (
    <JournalEntryBox
      entry={{ ...entry, content }}
      onContentChange={setContent}
      isSaving={autosaveState.isPending}
      saveError={autosaveState.error}
      lastSavedAt={autosaveState.lastSavedAt}
    />
  );
}
```

### 4. Finalize Session

```typescript
import { finalizeSession, getSessionEntries } from "@/lib/journal/firestoreHelpers";

// When user clicks "End Session"
await finalizeSession(uid, sessionId);

// Get finalized entries
const entries = await getSessionEntries(uid, sessionId);
const session = await getSession(uid, sessionId);

// Render summary
<SessionSummary session={session} entries={entries} />
```

## 📚 API Reference

### Server Functions (lib/journal/firestoreHelpers.ts)

```typescript
// Session management
getOrCreateSession(uid: string): Promise<Session & { id: string }>
getSession(uid: string, sessionId: string): Promise<Session & { id: string } | null>

// Entry management
getOrCreateDraftEntry(uid, sessionId, type, source, promptText?, promptId?): Promise<JournalEntry & { id: string }>
getEntry(uid: string, entryId: string): Promise<JournalEntry & { id: string } | null>
getSessionEntries(uid: string, sessionId: string): Promise<(JournalEntry & { id: string })[]>

// Autosave
autosaveEntry(uid: string, entryId: string, updates: Partial<JournalEntry>): Promise<void>

// Finalization
finalizeSession(uid: string, sessionId: string): Promise<void>

// User
getOrCreateUserProfile(uid: string, email?: string): Promise<UserProfile>
```

### React Hook (lib/journal/useJournalEntryAutosave.ts)

```typescript
useJournalEntryAutosave(
  entryId: string | null,
  initialContent: string,
  onSave: (content: string) => Promise<void>
): {
  content: string;
  setContent: (content: string) => void;
  autosaveState: {
    isPending: boolean;
    isError: boolean;
    error?: string;
    lastSavedAt?: Date;
  };
}
```

### Components

**JournalEntryBox**
```typescript
<JournalEntryBox
  entry={entry}
  onContentChange={(content) => void}
  isSaving={boolean}
  saveError={string | undefined}
  lastSavedAt={Date | undefined}
  placeholder={string}
/>
```

**SessionSummary**
```typescript
<SessionSummary
  session={session}
  entries={entries}
  onPrint={() => void}
  onDownload={() => void}
  onClose={() => void}
/>
```

## 🔐 Security Rules

Deploy to Firestore:

```
rules_version = '2';
service cloud.firestore {
  match /users/{uid} {
    allow read, write: if request.auth.uid == uid;
    
    match /journalEntries/{entryId} {
      allow read, write: if request.auth.uid == uid;
    }
    
    match /sessions/{sessionId} {
      allow read, write: if request.auth.uid == uid;
    }
  }
}
```

See `docs/firestore-rules-journal.security` for full rules.

## 🎨 UX Details

**Autosave Feedback:**
- User types → 1 second debounce
- "Saving..." appears immediately (optimistic)
- "Saved 2m ago" shown on success
- "⚠ Error" shown on failure
- Retry on next keystroke

**Session Finalization:**
- "End Session & View Summary" button
- All drafts marked as "final"
- Session marked as ended
- Summary generated
- Redirect to summary page

**Session Summary Page:**
- Date, duration, AI highlights
- All entries by type
- Optional tags
- Print button (clean stylesheet)
- Download as .txt file

## 📦 Integration Steps

1. **Deploy Firestore Rules**
   - Go to Firebase Console > Firestore > Rules
   - Paste content from `docs/firestore-rules-journal.security`
   - Publish

2. **Add to Dashboard**
   - Import `getOrCreateSession`, `getOrCreateDraftEntry`
   - Create entries on page load
   - Render `JournalEntryBox` components with hooks
   - Add "End Session" button that calls `finalizeSession`

3. **Create Summary Page**
   - New route: `app/journal/session/[sessionId]/page.tsx`
   - Fetch session and entries server-side
   - Render `<SessionSummary>` component

4. **Optional: AI Summaries**
   - Replace placeholder in `generateSessionSummary()`
   - Call OpenAI, Claude, or your LLM API
   - Parse response and structure as SessionSummary

## 🧪 Testing Checklist

- [ ] Session created on first dashboard visit
- [ ] Draft entries created for all reflection types
- [ ] Autosave works (content persists on page reload)
- [ ] Autosave UI shows Saving... → Saved time
- [ ] Error handling (disconnect network, see "⚠ Error")
- [ ] End Session button finalizes and redirects
- [ ] Summary page displays all entries
- [ ] Print works cleanly
- [ ] Download produces valid .txt file
- [ ] Entries immutable after finalization

## 🚦 Next Steps

**Immediate:**
- Integrate into dashboard page
- Test autosave flow
- Verify Firestore schema in Firebase Console

**Short Term:**
- Add entry tagging UI
- Create session archive/history page
- Add search across past sessions

**Long Term:**
- AI-powered summary generation
- Sentiment analysis
- Reflection trends dashboard
- Export to PDF
- Share sessions with coach/partner

## 📄 Files Summary

| File | Purpose |
|------|---------|
| `lib/types/journal.ts` | TypeScript domain models |
| `lib/journal/dateUtils.ts` | Utilities (timezone, IDs) |
| `lib/journal/firestoreHelpers.ts` | Server Firestore operations |
| `lib/journal/useJournalEntryAutosave.ts` | Client autosave hook |
| `app/components/JournalEntryBox.tsx` | Entry textarea component |
| `app/components/SessionSummary.tsx` | Summary display component |
| `docs/JOURNAL_SYSTEM.md` | Architecture guide |
| `docs/JOURNAL_INTEGRATION_EXAMPLE.md` | Integration example |
| `docs/firestore-rules-journal.security` | Firestore security rules |

## 💡 Design Principles

✅ **Type-Safe**: Full TypeScript coverage
✅ **Modular**: Independent, composable functions
✅ **Production-Ready**: Error handling, security rules, logging
✅ **User-Friendly**: Instant feedback, no data loss
✅ **Next.js Patterns**: Server/client components, App Router
✅ **Firebase v9+**: Modular SDK

Enjoy your journaling system! 🌱
