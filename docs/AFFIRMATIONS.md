# Daily Affirmations System

## Overview

This system displays a rotating daily affirmation that:
- Changes daily at midnight (America/New_York timezone)
- Is the same for all users globally
- Deterministically cycles through a list of affirmations stored in Firestore
- Uses server-side rendering to avoid timezone/hydration issues

## Architecture

### Files

1. **`lib/affirmationUtils.ts`** - Utility functions for date calculations
   - `getNYDateKey()` - Get today's date in NY timezone (YYYY-MM-DD)
   - `dayNumberFromDateKey()` - Convert date to day number since epoch
   - `getAffirmationIndex()` - Calculate which affirmation to show today

2. **`lib/affirmationClient.ts`** - Firebase Firestore client
   - `getActiveAffirmations()` - Fetch all active affirmations, ordered
   - `getTodaysAffirmation()` - Get the affirmation for today

3. **`app/api/affirmation/today/route.ts`** - Public API endpoint
   - GET `/api/affirmation/today` - Returns today's affirmation as JSON

4. **`app/api/admin/affirmations/route.ts`** - Admin API endpoint
   - GET - List all affirmations
   - POST - Create new affirmation

5. **`app/dashboard/page.tsx`** - Dashboard server component
   - Fetches and displays today's affirmation

## Firestore Schema

Collection: `affirmations`

Each document structure:
```typescript
{
  text: string,              // The affirmation text
  active: boolean,           // Whether this affirmation is in rotation
  order: number,             // Sort order (0, 1, 2, ... n)
  createdAt: Timestamp       // (Optional) Creation date
}
```

## Setup Instructions

### 1. Set Up Firebase Custom Claims (Admin Users)

First, set up admin access for your user account by adding a custom claim:

**Using Firebase Console:**
- Go to Authentication → Users
- Select your user
- Click "Custom claims" (upper right)
- Add:
```json
{
  "admin": true
}
```

**Using Firebase Admin SDK (Node.js):**
```bash
const admin = require('firebase-admin');
admin.initializeApp();

const uid = 'your-user-uid';
admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => console.log('Admin claim set for:', uid));
```

### 2. Environment Variables

Set the admin secret in your `.env.local` (for server-to-server access):
```
ADMIN_SECRET=your_secure_admin_secret_here
```

### 3. Create Initial Affirmations

Use the admin API to add affirmations. **Requires admin-level authentication:**

**Option A: Firebase ID Token (requires admin custom claim)**
```bash
# Get ID token from authenticated admin user, then:
curl -X POST http://localhost:3000/api/admin/affirmations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_id_token>" \
  -d '{"text": "I create space for what matters.", "active": true, "order": 0}'
```

**Option B: Admin Secret**
```bash
curl -X POST http://localhost:3000/api/admin/affirmations \
  -H "Content-Type: application/json" \
  -H "Authorization: Secret your_secure_admin_secret_here" \
  -d '{"text": "I create space for what matters.", "active": true, "order": 0}'

curl -X POST http://localhost:3000/api/admin/affirmations \
  -H "Content-Type: application/json" \
  -H "Authorization: Secret your_secure_admin_secret_here" \
  -d '{"text": "I am capable and resilient.", "active": true, "order": 1}'

curl -X POST http://localhost:3000/api/admin/affirmations \
  -H "Content-Type: application/json" \
  -H "Authorization: Secret your_secure_admin_secret_here" \
  -d '{"text": "My actions align with my purpose.", "active": true, "order": 2}'
```

### Authentication & Authorization

**Admin Endpoints** (`GET` and `POST` `/api/admin/affirmations`):

Both endpoints require **admin-level** authentication:

**Valid Credentials:**
1. **Firebase ID Token with admin custom claim** - `Authorization: Bearer <idToken>`
   - User MUST have custom claim `admin: true`
   - Only admins can use Bearer tokens

2. **Admin Secret** - `Authorization: Secret <secret>`
   - Requires `ADMIN_SECRET` environment variable
   - For server-to-server access

**Response Codes:**
- **401 Unauthorized**
  - Missing `Authorization` header
  - Invalid or expired token
  - Invalid auth header format

- **403 Forbidden**
  - Valid Firebase token but user lacks `admin: true` custom claim
  - Invalid admin secret

- **201 Created** (POST)
  - Affirmation successfully created

- **200 OK** (GET)
  - Affirmations list retrieved successfully

**Public Endpoints** (`GET` `/api/affirmation/today`):
- No authentication required
- Returns today's affirmation for all users

### 4. How It Works

1. User visits `/dashboard`
2. Server-side `getTodaysAffirmation()` is called
3. It fetches all active affirmations from Firestore
4. Calculates today's date in NY timezone (YYYY-MM-DD format)
5. Converts date to day number: `floor(Date.UTC(year, month-1, day) / 86400000)`
6. Uses modulo to determine index: `dayNum % affirmations.length`
7. Returns the affirmation at that index
8. Displays on dashboard with fallback if no affirmations exist

### 5. Timezone Behavior

- **Timezone**: America/New_York
- **Flip Time**: Midnight (00:00) ET
- **Deterministic**: Same date always shows same affirmation globally
- **No Hydration Issues**: Server-rendered, not client-side calculated

### 6. Examples

With 3 affirmations (order 0, 1, 2):
- Jan 1, 2025: dayNum ≈ 19723 → 19723 % 3 = 1 → affirmation[1]
- Jan 2, 2025: dayNum ≈ 19724 → 19724 % 3 = 2 → affirmation[2]
- Jan 3, 2025: dayNum ≈ 19725 → 19725 % 3 = 0 → affirmation[0]
- Jan 4, 2025: dayNum ≈ 19726 → 19726 % 3 = 1 → affirmation[1]

### 7. Admin Operations

**View all affirmations (admin only, requires auth):**
```bash
curl -H "Authorization: Secret your_secure_admin_secret_here" \
  http://localhost:3000/api/admin/affirmations
```

**Get today's affirmation (public, no auth required):**
```bash
curl http://localhost:3000/api/affirmation/today
```

**Update affirmation status:**
Use Firebase Console to toggle `active` flag or update `order`

## Edge Cases Handled

1. **No Affirmations**: Returns fallback text "I create space for what matters."
2. **Empty Active List**: Returns fallback text
3. **Timezone Transitions**: Uses Intl.DateTimeFormat for correct NY timezone handling
4. **DST Changes**: Handled automatically by browser/server timezone API

## Future Enhancements

- Add admin UI to manage affirmations
- Add user-specific affirmation preferences
- Add analytics to track which affirmations are resonating
- Add multi-language support
- Add seasonal/event-specific affirmations
