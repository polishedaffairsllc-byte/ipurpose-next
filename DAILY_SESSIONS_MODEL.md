# Daily Session Lock + Print Support - Data Model Summary

## Overview
The Daily Session system enables users to work day-by-day, lock in their work, print/export it, and see growth over time. Each day's work is stored as a separate, immutable record once locked.

## Data Model

### Firestore Collection Structure
```
users/{userId}/dailySessions/{date}
```

### DailySession Document Schema

```typescript
interface DailySession {
  userId: string;
  date: string;                    // YYYY-MM-DD format (UTC)
  
  // Session contents
  checkIns: DailySessionCheckIn[];
  labEntries: DailySessionLabEntry[];
  reflections: DailySessionReflection[];
  
  // Session metadata
  isLocked: boolean;              // true = read-only
  lockedAt?: string;              // ISO timestamp
  createdAt: string;              // ISO timestamp
  updatedAt: string;              // ISO timestamp
}
```

### DailySessionCheckIn (stored in checkIns array)
```typescript
interface DailySessionCheckIn {
  id: string;                     // unique ID
  emotions: string[];             // selected emotions
  alignmentScore: number;         // 1-10 scale
  need: string;                   // what user needs today
  type: 'daily';
  recordedAt: string;             // ISO timestamp
}
```

### DailySessionLabEntry (stored in labEntries array)
```typescript
interface DailySessionLabEntry {
  labId: string;                  // 'identity', 'meaning', 'agency'
  labName: string;
  status: 'in_progress' | 'complete';
  content: Record<string, string>; // lab-specific fields
  notes: string;
  completedAt?: string;           // ISO timestamp
  recordedAt: string;             // ISO timestamp
}
```

### DailySessionReflection (stored in reflections array)
```typescript
interface DailySessionReflection {
  id: string;
  type: 'lab-integration' | 'personal';
  labId?: string;                 // if lab-integration
  labName?: string;
  summary: string;
  fields: Record<string, any>;
  recordedAt: string;             // ISO timestamp
}
```

## Key Behaviors

### 1. Session Creation
- Automatically created on first access for a given day
- Date is determined in UTC (YYYY-MM-DD format)
- Empty session has no check-ins, lab entries, or reflections initially

### 2. Data Entry (Day is Unlocked)
- Users can add check-ins, lab entries, and reflections
- Each entry is appended to the appropriate array
- Session metadata (updatedAt) is updated on each write
- Only today's session can be modified

### 3. Session Lock
- Triggered when:
  - User clicks "Finish Today" button, OR
  - Next calendar day arrives
- Once locked: `isLocked = true`, `lockedAt` is set
- Read-only: All write attempts return 403 error

### 4. History Access
- Users can view any of their past sessions
- All data is retrievable (no deletion)
- Sessions are ordered by date (newest first)

### 5. Print/Export
- Each session can be printed as clean HTML
- Copy-to-clipboard exports as formatted plain text
- Print includes: date, all entries with timestamps, section headings

## API Endpoints

### Session Management
- `GET /api/daily-sessions` - Get all sessions
- `GET /api/daily-sessions/today` - Get today's session (create if missing)
- `GET /api/daily-sessions/[date]` - Get specific day (YYYY-MM-DD)

### Writing Data (today only)
- `POST /api/daily-sessions/today/check-in` - Add check-in
- `POST /api/daily-sessions/today/lab-entry` - Add lab entry
- `PATCH /api/daily-sessions/today/lab-entry/[labId]` - Update lab entry
- `POST /api/daily-sessions/today/reflection` - Add reflection
- `POST /api/daily-sessions/today/lock` - Lock today's session

## Client Libraries

### `lib/dailySessionClient.ts`
- `getTodaySession()` - Fetch today
- `getSessionByDate(date)` - Fetch specific day
- `getAllSessions()` - Fetch all
- `addCheckInToToday(checkIn)` - Add check-in
- `addLabEntryToToday(entry)` - Add lab entry
- `updateLabEntryInToday(labId, updates)` - Update lab entry
- `addReflectionToToday(reflection)` - Add reflection
- `lockTodaySession()` - Lock today

### `lib/sessionExport.ts`
- `generateSessionHTML(session)` - HTML for printing
- `generateSessionPlainText(session)` - Text for clipboard
- `printSession(session)` - Open print dialog
- `copyToClipboard(text)` - Copy utility
- `formatSessionDate(dateStr)` - Format YYYY-MM-DD

## UI Components

### `DailySessionViewer.tsx`
- Displays a single day's session
- Shows check-ins, lab entries, reflections
- Provides "Copy to Clipboard" and "Print" buttons
- Displays lock confirmation message
- Prevents editing on locked sessions

### `DailySessionHistory.tsx`
- List of all user's sessions
- Select a date to view details
- Integrated with DailySessionViewer

### Pages
- `/daily-sessions` - Full session history view

## Integration Points

### Existing Features
- **DailyCheckIn**: Now also saves check-ins to daily session
- **Labs**: Can add lab entries to daily session on save/complete
- **Reflections**: Can add reflections to daily session on integration
- **Soul**: Check-in endpoint also triggers daily session save

### No Changes Required To
- Navigation/routing
- Pricing structure
- Program content
- User authentication
- Existing data models

## Lock Behavior

### Automatic Lock
- Past dates are automatically considered locked (isLocked = true)
- API enforces read-only on any date before today

### Manual Lock
- User can click "Finish Today" to explicitly lock
- Sets lockedAt timestamp
- Returns confirmation message: "Today's session is saved."

### Error Handling
- Attempt to write to locked session: 403 Forbidden
- Attempt to lock already-locked session: 200 OK (idempotent)

## No Data Loss
- All entries are appended (no overwrites)
- Previous days remain accessible
- No automatic deletion or archiving
- No scoring or gamification logic
