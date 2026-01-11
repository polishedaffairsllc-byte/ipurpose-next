/**
 * Complete Journaling System Implementation Guide
 *
 * This document explains the journaling and reflection system architecture
 * and provides usage examples for all key functions.
 */

# Journaling & Reflection System

## Architecture Overview

The system captures reflections at multiple points in the user's journey:

```
users/{uid}
├── Profile (displayName, email, timezone, etc.)
│
├── journalEntries/{entryId}
│   ├── type: "affirmation_reflection" | "intention" | "free_journal" | "soul_reflection" | "systems_note"
│   ├── status: "draft" | "final"
│   ├── content: string
│   ├── promptText?: string (optional prompt that guided the entry)
│   ├── sessionId: string (links to current session)
│   ├── source: "overview" | "soul" | "systems" | "ai"
│   └── tags?: string[] (user-provided tags)
│
└── sessions/{sessionId}
    ├── startedAt: Timestamp
    ├── endedAt: Timestamp | null (null until session finalized)
    ├── dateKey: "YYYY-MM-DD"
    └── summary?: SessionSummary (generated when finalized)
```

## Types & Interfaces

**JournalEntry Types:**
- `affirmation_reflection`: Reflection on today's affirmation
- `intention`: Today's intention statement
- `free_journal`: Unstructured journaling
- `soul_reflection`: Deep work on soul alignment
- `systems_note`: Notes on systems/workflows

**Entry Status:**
- `draft`: In progress, autosave enabled
- `final`: Finalized at session end, no further edits

**Entry Source:**
- `overview`: Created from overview page
- `soul`: Created from soul alignment page
- `systems`: Created from systems page
- `ai`: AI-generated prompt

## Key Functions

### 1. Session Management

```typescript
// Get or create today's session
const session = await getOrCreateSession(uid);
// Returns: { id: string, startedAt, endedAt, dateKey, summary? }
```

**Behavior:**
- Queries for existing session with today's dateKey
- Returns if found, otherwise creates new session
- All entries created during this session link to sessionId

### 2. Entry Management

```typescript
// Get or create a draft entry
const entry = await getOrCreateDraftEntry(
  uid,
  sessionId,
  "affirmation_reflection",
  "overview",
  "What does this affirmation mean to you?",
  "prompt-123"
);
// Returns: { id: string, type, status: "draft", content: "", ... }
```

**Behavior:**
- Queries for existing draft with same type/sessionId
- Returns if found (idempotent)
- Otherwise creates new entry with empty content
- Autosave is handled client-side via `useJournalEntryAutosave`

### 3. Autosave

```typescript
// Called from client-side hook (debounced 1s)
await autosaveEntry(uid, entryId, { content: "..." });
```

**Behavior:**
- Updates entry content and updatedAt timestamp
- Debounced to 1 second to avoid excessive writes
- Error handling surfaces to UI (saving/error state)

### 4. Session Finalization

```typescript
// When user clicks "End Session"
await finalizeSession(uid, sessionId);
```

**Behavior:**
- Marks all draft entries as "final"
- Sets session endedAt timestamp
- Generates session summary (highlights from all entries)
- No further edits allowed after finalization

## Component Usage

### JournalEntryBox

Reusable component for rendering a journal entry with autosave UI:

```tsx
<JournalEntryBox
  entry={entry}
  onContentChange={(content) => autosaveEntry(uid, entry.id, { content })}
  isSaving={autosaveState.isPending}
  saveError={autosaveState.error}
  lastSavedAt={autosaveState.lastSavedAt}
  placeholder="Write your thoughts here..."
/>
```

Shows:
- Entry type label
- Optional prompt text
- Textarea with focus ring
- Real-time save status ("Saving...", "Saved 2m ago", or error)

### SessionSummary

Display finalized session with entries and highlights:

```tsx
const entries = await getSessionEntries(uid, sessionId);
const session = await getSession(uid, sessionId);

<SessionSummary
  session={session}
  entries={entries}
  onPrint={() => window.print()}
  onDownload={() => /* download logic */}
  onClose={() => navigate("/")}
/>
```

Features:
- Session date and duration
- AI-generated highlights
- List of all entries (type, prompt, content, tags)
- Print and download buttons
- Print stylesheet for clean output

## Hook: useJournalEntryAutosave

Client-side hook for managing autosave with debouncing:

```tsx
const { content, setContent, autosaveState } = useJournalEntryAutosave(
  entryId,
  initialContent,
  async (newContent) => {
    await autosaveEntry(uid, entryId, { content: newContent });
  }
);

// In JSX:
<textarea
  value={content}
  onChange={(e) => setContent(e.target.value)}
/>

{autosaveState.isPending && <p>Saving...</p>}
{autosaveState.isError && <p>Error: {autosaveState.error}</p>}
{autosaveState.lastSavedAt && <p>Saved {formatTime(autosaveState.lastSavedAt)}</p>}
```

**Features:**
- Debounces saves by 1 second
- Immediate "Saving..." feedback
- Error handling with retry
- lastSavedAt timestamp
- Cleanup on unmount

## Firestore Security Rules

User data isolation enforced:

```firestore
// Users can only read/write their own data
match /users/{uid} {
  allow read, write: if request.auth.uid == uid;
  
  match /journalEntries/{entryId} {
    allow read, write: if request.auth.uid == uid;
  }
  
  match /sessions/{sessionId} {
    allow read, write: if request.auth.uid == uid;
  }
}
```

## Usage Flow (Overview Page)

1. **Page Load**: `getOrCreateSession(uid)` → creates session if needed
2. **Render Entries**: Call `getOrCreateDraftEntry()` for each reflection type
3. **User Writes**: `useJournalEntryAutosave()` debounces saves
4. **Save Button**: User clicks "End Session"
5. **Finalize**: `finalizeSession()` marks drafts as final, generates summary
6. **Summary Page**: Render `<SessionSummary>` with finalized entries

## Error Handling

**Autosave errors:**
- Network errors → show "Error" state, retry on next change
- Missing entryId → skip save
- Firestore permission denied → show "Error" state

**Session errors:**
- Missing session → create new one
- Finalization errors → log and alert user

## Future Enhancements

- [ ] AI-powered summary generation (call LLM API)
- [ ] Entry tagging with autocomplete
- [ ] Session templates (guided journaling)
- [ ] Analytics dashboard (reflection trends)
- [ ] Export to PDF with formatting
- [ ] Sharing sessions with accountability partner
- [ ] Historical session browsing
- [ ] Time-based entry expiration (auto-cleanup old drafts)
