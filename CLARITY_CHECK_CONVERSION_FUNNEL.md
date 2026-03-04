# Clarity Check → Starter Pack Conversion Funnel

**Status:** ✅ Fully Implemented (Configuration Required)

---

## What's Been Built

### 1️⃣ GA4 Event: "Clarity Check Completed"
- **Event fires:** When user views their results page at `/clarity-check/results/[submissionId]`
- **Tracked parameter:** `clarity_check_completed` with user email
- **Purpose:** Track completion rate independently of dynamic submissionId URLs

**In GA4 Reports:**
- Filter for event: `clarity_check_completed`
- Shows: "Assessment Completions" as a conversion goal

---

### 2️⃣ Results Page Flow Redirect
- **Old flow:** After completing assessment → Results page → "Back to Home" button
- **New flow:** After completing assessment → Results page → **"Explore the Starter Pack"** button → `/starter-pack`

**Button Location:** `/app/clarity-check/results/ClarityCheckResultsClient.tsx` (lines 138-141)

```tsx
<Link
  href="/starter-pack"
  className="inline-block px-8 py-4 bg-gradient-to-r from-lavenderViolet to-indigoDeep text-white rounded-full font-marcellus text-lg hover:opacity-90 transition-opacity"
>
  Explore the Starter Pack ✨
</Link>
```

**Conversion Funnel Tracking:**
```
page_view (/clarity-check)
  ↓
view_item (Clarity Check Assessment)
  ↓
begin_checkout (optional - if added)
  ↓
clarity_check_completed (view results)
  ↓
page_view (/starter-pack) ← Users can see Starter Pack offer
  ↓
begin_checkout (click purchase)
  ↓
purchase (complete Stripe payment)
```

---

### 3️⃣ Email Automation: Day 1 + Day 5

#### **Day 1: Thank You Email**
- **Trigger:** Immediately after Clarity Check form submission
- **Subject:** "✨ Your Clarity Check Results Are Ready"
- **Content:**
  - Thank you for completing the assessment
  - Their Identity Type (if available)
  - Explanation of the 4 clarity dimensions
  - Link to view full results
  - Hint about Day 5 offer

#### **Day 5: Founder's Rate Offer Email**
- **Trigger:** Automatically scheduled 5 days after submission
- **Subject:** "⏰ Your Founder's Rate is Ready ($27 for 7 Days)"
- **Content:**
  - Founder's special rate: **$27** (regular: $47)
  - Benefits of the Starter Pack
  - **7-day countdown urgency** (expires Day 12)
  - CTA button to `/starter-pack`

---

## Setup Instructions

### STEP 1: Configure Email Service
Your email automation requires Gmail SMTP credentials. Add to `.env.local`:

```env
# Gmail SMTP Configuration
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# Scheduler Security Token (for sending Day 5 emails)
SCHEDULER_SECRET_TOKEN=your-secure-random-token-here
```

**To get Gmail App Password:**
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification (if not already enabled)
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Select "Mail" and "Windows Computer"
5. Copy the 16-character password

### STEP 2: Enable Firestore Collection
Day 5 emails are stored in Firestore for reliable retry logic.

**Collection:** `emailTasks`

Schema:
```typescript
{
  email: string,                    // User's email
  name: string,                     // User's name
  submissionId: string,             // Link to Clarity Check results
  identityType?: string,            // Their identity type
  totalScore?: number,              // Their clarity score
  type: string,                     // "clarity_check_founders_rate"
  scheduledFor: Timestamp,          // When to send
  status: string,                   // "pending" | "completed" | "failed"
  retryCount?: number,              // Retry attempt count
  sentAt?: Timestamp,               // When actually sent
  lastError?: string,               // Error message if failed
  createdAt: Timestamp,             // When task was created
}
```

### STEP 3: Set Up Cloud Scheduler (Google Cloud)

**Option A: Google Cloud Scheduler** (Recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable Cloud Scheduler API
3. Create a new job:
   - **Name:** `send-clarity-check-emails`
   - **Frequency:** `0 * * * *` (every hour)
   - **Timezone:** Your timezone
   - **HTTP Target:**
     - URL: `https://ipurposesoul.com/api/tasks/send-scheduled-emails`
     - HTTP Method: `POST`
     - Auth header: `Add OIDC token`
     - Service account: (select your service account)
   - **Headers:**
     ```
     Authorization: Bearer [SCHEDULER_SECRET_TOKEN from .env]
     Content-Type: application/json
     ```

**Option B: Vercel Cron (Free Alternative)**

Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/tasks/send-scheduled-emails",
      "schedule": "0 * * * *"
    }
  ]
}
```

Then add auth to your function (already done in code).

**Option C: Manual Testing (Local)**

```bash
# Send Day 5 emails immediately (for testing)
curl -X POST http://localhost:3000/api/tasks/send-scheduled-emails \
  -H "Authorization: Bearer test-token-123" \
  -H "Content-Type: application/json"
```

---

## Testing the Full Flow

### Test 1: Lead Capture + Day 1 Email

```bash
# 1. Submit Clarity Check form
POST /api/leads/clarity-check
{
  "name": "Sarah",
  "email": "sarah@example.com",
  "website": ""
}

# Expected:
# ✓ Lead stored in Firestore (clarityCheckLeads collection)
# ✓ Day 1 email sent to sarah@example.com
# ✓ Day 5 task created in emailTasks collection (status: pending)
```

### Test 2: View Results Page + GA4 Event

```
1. Go to: http://localhost:3000/clarity-check/results/[submissionId]
2. Open GA4 Real-time Dashboard
3. Look for event: clarity_check_completed
4. Verify email parameter is captured
```

### Test 3: Check Results Flow

```
1. Complete assessment at http://localhost:3000/clarity-check-numeric
2. View results page
3. Click "Explore the Starter Pack ✨" button
4. Should navigate to /starter-pack (sales page)
5. Verify in GA4 that page_view event fires for /starter-pack
```

### Test 4: Day 5 Email (Manual Trigger)

```bash
# Manually trigger the scheduler to test Day 5 email sending
curl -X POST http://localhost:3000/api/tasks/send-scheduled-emails \
  -H "Authorization: Bearer $(echo $SCHEDULER_SECRET_TOKEN)" \
  -H "Content-Type: application/json"

# Check Firestore emailTasks collection
# Status should change: "pending" → "completed"
```

---

## Conversion Metrics You'll See

### In GA4 (after 24-48 hours):

```
Clarity Check Completion Rate:
  Events → clarity_check_completed
  Shows: How many % of leads actually complete the assessment

Conversion Funnel:
  1. page_view (/clarity-check) → 100%
  2. generate_lead (initial form) → ~60-70%
  3. clarity_check_completed (results) → ~40-50%
  4. page_view (/starter-pack) → ~30-40%
  5. begin_checkout → ~8-15%
  6. purchase → ~2-5%
```

### Email Automation Metrics (in Firestore):

```
emailTasks collection:
  ✓ "completed" → Successfully sent emails
  ✗ "failed" → Retry exceeded (check lastError)
  ? "pending" → Waiting to send (scheduled future date)
```

---

## Email Customization

### Modify Day 1 Email
File: `/lib/email-automation.ts` (lines 20-80)
- Change subject line (currently: "✨ Your Clarity Check Results Are Ready")
- Update content/copy
- Adjust founder's name mention
- Customize brand colors/styling

### Modify Day 5 Email
File: `/lib/email-automation.ts` (lines 83-180)
- Change Founder's Rate price (currently: $27, regular: $47)
- Adjust deadline (currently: "7 Days")
- Update button text
- Add/remove benefit list items

---

## What Happens Behind the Scenes

### Step 1: User Submits Clarity Check Form
```
POST /api/leads/clarity-check
↓
processLead() creates entry in Firestore
↓
scheduleEmailSequence() called
  ├─ sendClarityCheckThankYouEmail() → Day 1 email sent immediately
  └─ emailTask created in Firestore with scheduledFor = now + 5 days
```

### Step 2: User Views Results
```
GET /clarity-check/results/[submissionId]
↓
ClarityCheckResultsClient component loads
↓
useEffect fires trackClarityCheckCompleted() → GA4 event logged
↓
User sees button "Explore the Starter Pack"
```

### Step 3: Cloud Scheduler Triggers (Hourly)
```
POST /api/tasks/send-scheduled-emails (triggered by Cloud Scheduler)
↓
Query Firestore: emailTasks where status='pending' AND scheduledFor <= now
↓
For each task:
  ├─ Send the email
  ├─ Mark as "completed"
  └─ If error, retry up to 5 times, then mark "failed"
```

---

## Troubleshooting

### Day 1 Email Not Sending
**Check:**
1. `EMAIL_USER` and `EMAIL_PASSWORD` in `.env.local`
2. Gmail account has "Less secure apps" enabled (if not using App Password)
3. Check server logs: `[Email] Day 1 Thank You sent to...`

**Fix:**
```bash
# Test Gmail SMTP connection
npm run test:email
```

### Day 5 Email Not Sending
**Check:**
1. `SCHEDULER_SECRET_TOKEN` is set in `.env.local`
2. Cloud Scheduler job exists and is enabled
3. Firestore `emailTasks` collection has pending tasks
4. Check function logs in Cloud Console

**Fix:**
```bash
# Manually trigger scheduler (for testing)
curl -X POST http://localhost:3000/api/tasks/send-scheduled-emails \
  -H "Authorization: Bearer [your-token]" \
  -H "Content-Type: application/json"
```

### GA4 Event Not Appearing
**Check:**
1. GA4 Measurement ID is in `.env.local` (`NEXT_PUBLIC_GA_MEASUREMENT_ID`)
2. GA4 script is loading on the results page (check DevTools → Network)
3. Event name is exactly: `clarity_check_completed`

**Fix:**
```typescript
// In browser console, on results page:
window.gtag('event', 'clarity_check_completed', { email: 'test@example.com' });
// Check GA4 Real-time dashboard immediately after
```

---

## Files Modified/Created

| File | Type | Purpose |
|------|------|---------|
| `/lib/analytics.ts` | Modified | Added `trackClarityCheckCompleted()` function |
| `/app/clarity-check/results/ClarityCheckResultsClient.tsx` | Created | Client component with GA4 tracking + Starter Pack CTA |
| `/app/clarity-check/results/[submissionId]/page.tsx` | Modified | Refactored to use client component |
| `/lib/email-automation.ts` | Created | Day 1 + Day 5 email templates and sending logic |
| `/app/api/leads/clarity-check/route.ts` | Modified | Added email scheduling on form submission |
| `/app/api/tasks/send-scheduled-emails/route.ts` | Created | Scheduled task handler for Day 5 emails |

---

## Cost Implications

| Service | Cost | Notes |
|---------|------|-------|
| Gmail SMTP | Free | Uses your existing Gmail account |
| Cloud Scheduler | ~$0.10/month | Free tier: 3 jobs (you'd need 1) |
| Firestore Storage | Minimal | ~50 docs/month for emailTasks |
| Bandwidth | Included | Email sending is free |

**Total estimated cost: ~$0.10/month for email infrastructure**

---

## Next Steps

1. ✅ **Add `.env.local` variables** (EMAIL_USER, EMAIL_PASSWORD, SCHEDULER_SECRET_TOKEN)
2. ✅ **Deploy to production** (commit changes to main branch)
3. ✅ **Test full flow** using Test 1-4 above
4. ✅ **Set up Cloud Scheduler** job to run hourly
5. ✅ **Monitor GA4 dashboard** for clarity_check_completed events
6. ✅ **Check Firestore** emailTasks collection for completed email sends

---

## Success Metrics

Track these in GA4 and Firestore:

```
📊 Clarity Check → Starter Pack Funnel:
├─ Clarity Check Lead Rate: page_view → generate_lead
├─ Assessment Completion Rate: generate_lead → clarity_check_completed
├─ Results to Offer Rate: clarity_check_completed → page_view (/starter-pack)
├─ Purchase Rate: begin_checkout → purchase
└─ Revenue: Total $ from Clarity Check leads

📧 Email Performance:
├─ Day 1 Email Delivery: emailTasks.completed count
├─ Day 5 Email Delivery: emailTasks.completed (type='clarity_check_founders_rate')
└─ Founder's Rate Conversion: purchase events from email source
```

---

**Status:** Ready to deploy and test! 🚀

Questions? Check the setup instructions above or review the code comments in the implementation files.
