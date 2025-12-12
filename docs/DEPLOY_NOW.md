# 🚀 Deploy to Vercel - Quick Start Guide

## Step 1: Open Vercel Dashboard

Go to: **https://vercel.com/dashboard**

(Login with GitHub if needed)

---

## Step 2: Import Your Project

1. Click **"Add New..."** → **"Project"**
2. Find your repository: **`polishedaffairsllc-byte/ipurpose-next`**
3. Click **"Import"**

---

## Step 3: Configure Build Settings

**Leave these as default:**
- Framework Preset: `Next.js`
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

**Root Directory:** Leave blank (or select root)

Click **"Deploy"** (it will fail because we need environment variables - that's expected!)

---

## Step 4: Add Environment Variables

After the first deploy attempt, go to your project settings:

1. Click **"Settings"** tab
2. Click **"Environment Variables"** in the left sidebar
3. Add each variable below (one at a time):

### 🔑 Required Variables

Copy these from your local `.env.local` file:

```bash
OPENAI_API_KEY=sk-proj-...
```

```bash
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"..."}
```

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
```

```bash
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
```

```bash
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
```

```bash
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
```

```bash
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
```

```bash
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

```bash
NEXT_PUBLIC_OPENAI_API_KEY=sk-proj-...
```

```bash
FIREBASE_PROJECT_ID=your-project-id
```

```bash
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

**Important:** Select **"Production"**, **"Preview"**, and **"Development"** for each variable.

---

## Step 5: Redeploy

1. Go to **"Deployments"** tab
2. Click the **"..."** menu on the failed deployment
3. Click **"Redeploy"**
4. Confirm the redeploy

**This time it will succeed!** ✅

---

## Step 6: Wait for Build

The deployment takes 2-3 minutes. You'll see:
- ✅ Building
- ✅ Uploading
- ✅ Ready

---

## Step 7: Visit Your App

Once deployed, Vercel will show you the URL:

**https://ipurpose-next-[random].vercel.app**

Click **"Visit"** to open your production app!

---

## Step 8: Test Your Deployment

### Test 1: Health Check
Visit: `https://your-app.vercel.app/health`

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-12-11T...",
  "checks": {
    "firebase": { "status": "healthy" },
    "openai": { "status": "healthy" },
    "environment": { "status": "healthy" }
  }
}
```

### Test 2: Authentication
1. Go to `/login`
2. Create an account
3. Verify you can login
4. Check redirect to `/dashboard`

### Test 3: GPT Chat
1. Go to `/soul/chat`
2. Select an archetype
3. Send a message
4. Verify streaming response works

---

## 🎯 Quick Command Reference

### View Your .env.local (to copy values)
```bash
cat .env.local
```

### Check Deployment Logs (if issues)
```bash
# In Vercel dashboard:
# Deployments → Click deployment → View Function Logs
```

---

## ✅ Success Checklist

- [ ] Project imported to Vercel
- [ ] All 11 environment variables added
- [ ] Deployment succeeded (green checkmark)
- [ ] Health check returns `{"status":"healthy"}`
- [ ] Login/signup works
- [ ] GPT chat streams responses
- [ ] No errors in Function Logs

---

## 🔥 Troubleshooting

### Build Fails
- Check that all environment variables are set
- Make sure `FIREBASE_SERVICE_ACCOUNT_KEY` is valid JSON
- Verify `OPENAI_API_KEY` starts with `sk-proj-`

### 500 Errors
- Check Function Logs in Vercel dashboard
- Verify Firebase service account has correct permissions
- Test OpenAI API key in playground

### Authentication Doesn't Work
- Check `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` matches your Firebase project
- Verify Firebase Console → Authentication → Settings → Authorized domains includes your Vercel domain
- Add your Vercel URL to Firebase authorized domains

---

## 🎉 You're Live!

Once all tests pass, your iPurpose app is running in production!

**Next Steps:**
1. Add custom domain (optional)
2. Enable Vercel Analytics
3. Set OpenAI spending limits ($50-100/month)
4. Update Firestore security rules (see DEPLOYMENT.md)

---

**Need help?** Check the full guide: `docs/DEPLOYMENT.md`
