# iPurpose Production Deployment Guide

## Prerequisites

Before deploying to production, ensure you have:

- ✅ Vercel account (free tier works)
- ✅ Firebase project with Firestore enabled
- ✅ OpenAI API key with billing enabled
- ✅ GitHub repository (recommended for CI/CD)

## Environment Variables

### Required Production Variables

Add these to your Vercel project settings (Settings → Environment Variables):

```bash
# Firebase Admin SDK
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# OpenAI
OPENAI_API_KEY=sk-your_production_key_here

# Optional
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NODE_ENV=production
```

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Connect GitHub Repository**
   ```
   - Go to vercel.com/new
   - Import your GitHub repository
   - Select: ipurpose-next
   ```

2. **Configure Project**
   ```
   Framework Preset: Next.js
   Root Directory: ./
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

3. **Add Environment Variables**
   - Click "Environment Variables"
   - Add all variables from above
   - Select: Production, Preview, Development
   - Click "Add"

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build
   - Visit your deployment URL

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to production
vercel --prod

# Follow prompts to link project
```

## Post-Deployment Checklist

### 1. Verify Health Check
```bash
curl https://your-app.vercel.app/health
```

Expected response:
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": "healthy",
  "checks": {
    "firebase": { "status": "ok", "latency": 150 },
    "openai": { "status": "ok", "latency": 200 },
    "environment": { "status": "ok", "missing": [] }
  }
}
```

### 2. Test Authentication
- Visit https://your-app.vercel.app/login
- Create test account
- Verify Firebase auth works

### 3. Test GPT Integration
- Navigate to /soul/chat
- Send test message
- Verify streaming response
- Check token usage display

### 4. Monitor Logs
```bash
# View real-time logs
vercel logs your-deployment-url --follow
```

## Firestore Security Rules

Update your Firestore security rules for production:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // User preferences
    match /user-preferences/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Conversation sessions
    match /conversation-sessions/{sessionId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Conversation memory
    match /conversation-memory/{memoryId} {
      allow read: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
    
    // GPT interactions
    match /gpt-interactions/{interactionId} {
      allow read: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
    
    // Rate limits
    match /rate-limits/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // User contexts
    match /user-contexts/{contextId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Health check (public read only)
    match /_health/{document=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

## Firebase Storage Rules (if using)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Monitoring & Alerts

### Vercel Analytics
- Automatically enabled
- View at: vercel.com/your-project/analytics

### Firebase Monitoring
- Enable Performance Monitoring in Firebase Console
- Set up alerts for:
  - Authentication failures
  - Firestore errors
  - High latency queries

### OpenAI Usage
- Set up billing alerts in OpenAI dashboard
- Monitor token usage daily
- Set hard limit (e.g., $100/month)

## Performance Optimization

### Edge Functions (Optional)
For faster response times, consider moving auth checks to edge:

```bash
# Update next.config.ts
export const config = {
  runtime: 'edge',
}
```

### Caching Headers
Already configured in `vercel.json`:
- API responses: no-cache
- Static assets: immutable, 1 year
- Fonts: immutable, 1 year

## Security Best Practices

✅ **Implemented:**
- Rate limiting (30 req/min per IP)
- Input sanitization
- CORS protection
- Security headers
- Firebase session validation
- OpenAI API key rotation

⚠️ **Recommended:**
- Set up Sentry for error tracking
- Enable Vercel Password Protection during beta
- Use custom domain with SSL
- Set up backup schedule for Firestore

## Troubleshooting

### Build Fails
```bash
# Check logs
vercel logs --follow

# Common issues:
- Missing environment variables → Add in Vercel dashboard
- TypeScript errors → Fix locally first
- Dependency issues → Update package.json
```

### 500 Errors
```bash
# Check runtime logs
vercel logs your-deployment-url --follow

# Common causes:
- Missing OPENAI_API_KEY
- Invalid Firebase credentials
- Firestore security rules blocking
```

### Rate Limiting Issues
```bash
# Adjust in lib/security.ts:
const limits = {
  '/api/gpt': { requests: 60, window: 60000 }, // Increase if needed
}
```

## Rollback

If issues arise:

```bash
# List deployments
vercel ls

# Rollback to previous
vercel rollback your-deployment-url
```

## Cost Estimation

### Vercel (Free Tier)
- 100GB bandwidth/month: Free
- 100 builds/month: Free
- Serverless functions: Free (first 100k invocations)

### Firebase (Spark Plan)
- Authentication: Free (first 50k users)
- Firestore: Free (50k reads, 20k writes/day)
- Storage: Free (1GB)

### OpenAI
- GPT-4 Turbo: ~$0.01/1k input tokens, ~$0.03/1k output tokens
- Est: $50-200/month (100-500 conversations/day)

**Total estimated cost: $50-200/month** (primarily OpenAI)

## Next Steps

After successful deployment:

1. ✅ Set up custom domain (optional)
2. ✅ Configure error monitoring (Sentry)
3. ✅ Set up automated backups
4. ✅ Create admin dashboard
5. ✅ Implement analytics tracking

---

## Support

For deployment issues:
- Vercel Docs: vercel.com/docs
- Firebase Docs: firebase.google.com/docs
- Next.js Docs: nextjs.org/docs

**Your app is production-ready!** 🚀
