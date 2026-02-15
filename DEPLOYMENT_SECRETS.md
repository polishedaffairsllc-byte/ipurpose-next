# Deployment secrets and CI configuration

This project requires several environment variables and secrets to run in CI/CD and production. Add these to your GitHub repository Settings → Secrets and variables → Actions.

Recommended secrets (names to use in GitHub Actions):

- `FIREBASE_SERVICE_ACCOUNT_KEY` — JSON string of the Firebase service account. Required for server-side Firebase Admin operations.
- `NEXT_PUBLIC_FIREBASE_API_KEY` — Firebase public API key (used on client).
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `OPENAI_API_KEY` — API key for OpenAI features.
- `STRIPE_SECRET_KEY` — Stripe secret key for server API calls.
- `RESEND_API_KEY` — Resend API key (if using Resend for emails).
- `VERCEL_TOKEN` or `FIREBASE_TOKEN` — If you want CI to deploy automatically to Vercel or Firebase Hosting.

How to add a secret
1. Go to your repository on GitHub.
2. Click `Settings` → `Secrets and variables` → `Actions`.
3. Click `New repository secret`, enter the *Name* (exactly as above) and *Value* (paste secret), then `Add secret`.

Example usage in GitHub Actions
- In `.github/workflows/ci.yml` you can reference these secrets as `secrets.FIREBASE_SERVICE_ACCOUNT_KEY`, etc. The existing CI workflow is intentionally non-deploying; to enable deploy add a job that uses these secrets and your deploy action.

Security note
- Never commit service account JSON or API keys to the repository. Use GitHub Secrets or your cloud provider's secret manager.
