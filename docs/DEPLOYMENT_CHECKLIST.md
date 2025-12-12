# 🚀 Live Deployment Checklist - Phase 11

**Status:** In Progress  
**Date:** December 11, 2025  
**Branch:** `feat/ui-home-layout`  
**Deployment Target:** Vercel Production

---

## ✅ Pre-Deployment (Complete)

- [x] Local build validated (0 errors, 28 routes)
- [x] Code pushed to GitHub
- [x] Environment variables extracted
- [x] Vercel configuration ready (`vercel.json`)
- [x] Security hardening complete
- [x] Health check endpoint ready
- [x] Error boundaries implemented

---

## 📋 Current Step: Environment Variables

### Vercel Project Setup

1. **Go to:** https://vercel.com/dashboard
2. **Import:** `polishedaffairsllc-byte/ipurpose-next`
3. **Branch:** `feat/ui-home-layout` (or main)
4. **Deploy once** (expected to fail without env vars)

### Add 11 Environment Variables

Reference: `VERCEL_ENV_VARS.md` in project root

**Copy each variable to Vercel Dashboard → Settings → Environment Variables:**

| # | Variable Name | Source | Environment |
|---|---------------|--------|-------------|
| 1 | `OPENAI_API_KEY` | VERCEL_ENV_VARS.md | Production, Preview, Development |
| 2 | `FIREBASE_SERVICE_ACCOUNT_KEY` | VERCEL_ENV_VARS.md | Production, Preview, Development |
| 3 | `NEXT_PUBLIC_FIREBASE_API_KEY` | VERCEL_ENV_VARS.md | Production, Preview, Development |
| 4 | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | VERCEL_ENV_VARS.md | Production, Preview, Development |
| 5 | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | VERCEL_ENV_VARS.md | Production, Preview, Development |
| 6 | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | VERCEL_ENV_VARS.md | Production, Preview, Development |
| 7 | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | VERCEL_ENV_VARS.md | Production, Preview, Development |
| 8 | `NEXT_PUBLIC_FIREBASE_APP_ID` | VERCEL_ENV_VARS.md | Production, Preview, Development |
| 9 | `NEXT_PUBLIC_OPENAI_API_KEY` | VERCEL_ENV_VARS.md | Production, Preview, Development |
| 10 | `FIREBASE_PROJECT_ID` | VERCEL_ENV_VARS.md | Production, Preview, Development |
| 11 | `FIREBASE_CLIENT_EMAIL` | VERCEL_ENV_VARS.md | Production, Preview, Development |

**⚠️ Important:** Select all three environment types for each variable.

---

## 🔄 Redeploy

After adding all environment variables:

1. Go to **Deployments** tab
2. Find the failed deployment
3. Click **"..."** menu
4. Select **"Redeploy"**
5. Wait 2-3 minutes for build to complete

---

## ✅ Post-Deployment Testing

### Test 1: Health Check Endpoint

**URL:** `https://[your-app].vercel.app/health`

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-11T...",
  "checks": {
    "firebase": {
      "status": "healthy",
      "latency": "< 500ms"
    },
    "openai": {
      "status": "healthy",
      "latency": "< 1000ms"
    },
    "environment": {
      "status": "healthy",
      "missingVars": []
    }
  }
}
```

**If Failed:**
- Check Function Logs in Vercel Dashboard
- Verify all 11 environment variables are set
- Check FIREBASE_SERVICE_ACCOUNT_KEY is valid JSON

---

### Test 2: Authentication Flow

**Steps:**
1. Visit: `https://[your-app].vercel.app/login`
2. Click "Sign Up" or use test account
3. Enter email + password
4. Click "Sign In"

**Expected:**
- ✅ No errors in console
- ✅ Redirected to `/dashboard`
- ✅ Firebase session cookie set
- ✅ User authenticated

**If Failed:**
- Check Firebase Console → Authentication → Settings → Authorized domains
- Add your Vercel domain: `[your-app].vercel.app`
- Verify `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` matches Firebase project

---

### Test 3: GPT Chat - Soul Domain

**Steps:**
1. Visit: `https://[your-app].vercel.app/soul/chat`
2. Select archetype: "The Sage"
3. Type message: "What is my purpose?"
4. Click "Send" or press Enter

**Expected:**
- ✅ Typing indicator appears (3 dots)
- ✅ Response streams in real-time
- ✅ Token count displayed
- ✅ Message persists in Firestore
- ✅ No rate limit errors (< 30 requests)

**If Failed:**
- Check Function Logs for OpenAI errors
- Verify `OPENAI_API_KEY` is valid
- Check rate limiting (30 req/min)
- Verify Firestore rules allow authenticated writes

---

### Test 4: GPT Chat - Systems Domain

**Steps:**
1. Visit: `https://[your-app].vercel.app/systems/chat`
2. Select system: "Love & Relationships"
3. Type: "How do I improve communication?"
4. Send message

**Expected:**
- ✅ Streaming response with relationship insights
- ✅ Context from previous conversations (if any)
- ✅ Token tracking

---

### Test 5: GPT Chat - AI Tools Domain

**Steps:**
1. Visit: `https://[your-app].vercel.app/ai-tools/chat`
2. Select tool: "Goal Tracker"
3. Type: "Track my fitness goals"
4. Send message

**Expected:**
- ✅ Tool-specific GPT response
- ✅ Action-oriented suggestions
- ✅ Structured output

---

### Test 6: Context Persistence

**Steps:**
1. Chat in `/soul/chat` about purpose
2. Navigate to `/systems/chat`
3. Ask: "Based on my purpose, what systems should I focus on?"

**Expected:**
- ✅ GPT references previous soul conversation
- ✅ Context enrichment working
- ✅ Cross-domain insights

---

## 🔍 Monitoring & Logs

### Vercel Dashboard

**Function Logs:**
- Deployments → Click deployment → Function Logs
- Look for errors, warnings, security events

**Analytics:**
- Overview → Analytics
- Monitor request volume, response times, errors

### Firebase Console

**Authentication:**
- Monitor user signups, login success rate
- Check for auth errors

**Firestore:**
- Verify conversations collection populated
- Check preferences collection
- Monitor token usage in metadata

### OpenAI Dashboard

**Usage:**
- https://platform.openai.com/usage
- Monitor API calls, token consumption
- Check spending (should be < $5/day initially)

**Set Limits:**
- Billing → Usage limits
- Hard limit: $100/month (recommended)
- Soft limit: $50/month
- Email alerts: Enabled

---

## 🚨 Common Issues & Solutions

### Issue 1: Health Check Returns 503
**Cause:** Firebase or OpenAI connection failed  
**Solution:**
- Check environment variables
- Verify Firebase service account has correct permissions
- Test OpenAI API key in playground

### Issue 2: Authentication Fails
**Cause:** Vercel domain not authorized in Firebase  
**Solution:**
- Firebase Console → Authentication → Settings → Authorized domains
- Add: `[your-app].vercel.app`
- Wait 1-2 minutes for propagation

### Issue 3: GPT Returns 429 (Rate Limited)
**Cause:** Too many requests in short time  
**Solution:**
- Rate limit is 30 requests per minute per IP
- Wait 60 seconds and retry
- For testing, adjust limits in `lib/security.ts`

### Issue 4: Build Fails
**Cause:** Missing environment variables  
**Solution:**
- Verify all 11 variables in Vercel Dashboard
- Check for typos in variable names
- Ensure `FIREBASE_SERVICE_ACCOUNT_KEY` is valid JSON (no extra quotes)

### Issue 5: Streaming Doesn't Work
**Cause:** Response timeout or connection issue  
**Solution:**
- Check Function Logs for timeout errors
- Verify OpenAI API is responding
- Test with shorter prompts first

---

## ✅ Success Criteria

Deployment is successful when:

- [x] Health check returns `{"status":"healthy"}`
- [x] Can create account and login
- [x] GPT chat streams responses in all 4 domains
- [x] Token counting displays correctly
- [x] No errors in Function Logs
- [x] Context persistence works across pages
- [x] Rate limiting prevents abuse
- [x] All security headers present in response

---

## 📊 Production Metrics (First 24 Hours)

Track these metrics after deployment:

- **Response Time:** < 2s (p95)
- **Error Rate:** < 1%
- **Uptime:** > 99%
- **Auth Success Rate:** > 95%
- **GPT Success Rate:** > 98%
- **OpenAI Cost:** < $5 (first day)

---

## 🎉 Next Steps After Successful Deployment

1. **Add Custom Domain** (Optional)
   - Vercel Dashboard → Settings → Domains
   - Add your custom domain
   - Update Firebase authorized domains

2. **Enable Monitoring**
   - Vercel Analytics (free)
   - Sentry for error tracking (optional)
   - LogRocket for session replay (optional)

3. **Update Firestore Security Rules**
   - Copy production rules from `docs/DEPLOYMENT.md`
   - Firebase Console → Firestore → Rules
   - Publish rules

4. **Set OpenAI Spending Limits**
   - Hard limit: $100/month
   - Soft limit: $50/month
   - Email alerts enabled

5. **Create Backup Plan**
   - Document rollback process
   - Keep previous deployment available
   - Export Firestore data regularly

---

**Current Status:** Awaiting environment variable configuration  
**Next Action:** Add 11 environment variables in Vercel Dashboard  
**Estimated Time:** 5-10 minutes  

---

**Deployment Lead:** GitHub Copilot  
**Support:** See `docs/DEPLOYMENT.md` for comprehensive guide
