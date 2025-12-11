# Firebase Admin setup (local development)

This project uses the Firebase Admin SDK on the server (see `lib/firebaseadmin.ts`) to create secure session cookies and perform server-side admin operations.

Do NOT commit your service account JSON or private keys to the repository.

Recommended local setup

1. Download service account JSON
   - In the Firebase Console → Project Settings → Service Accounts → Generate new private key
   - Save the downloaded JSON somewhere safe (do not commit it)

2. Choose a credential method and add to `.env.local` (create at project root):

   Option A — full JSON string (recommended for ease):

   - Open the downloaded service account JSON and copy its content.
   - Create a `.env.local` file and add:

     FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n","client_email":"..."}'

    Note: If your hosting provider or CI system escapes newlines in the private key (turning actual newlines into "\\n"), ensure your code restores them. The project initializer already calls `.replace(/\\n/g, '\n')` on the private key when needed, but if you encounter authentication errors, double-check the `private_key` value and ensure newlines are preserved.

   Option B — individual env vars (escape newlines):

     FIREBASE_PROJECT_ID=your-project-id
     FIREBASE_CLIENT_EMAIL=service-account-email@your-project.iam.gserviceaccount.com
     FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

    Tip: When setting `FIREBASE_PRIVATE_KEY` in CI or hosting dashboards, you may need to paste the key with literal `\n` sequences (escaped newlines). The server-side initializer will replace `\\n` with actual newlines before constructing the credential object.

   Option C — path to JSON file:

     FIREBASE_SERVICE_ACCOUNT_KEY_PATH=/absolute/path/to/serviceAccountKey.json

   Note: The code in `lib/firebaseadmin.ts` supports all three methods.

3. Restart Next dev server

   ```bash
   npm run dev
   ```

4. Test the login route

   - Sign in a user client-side and obtain an ID token via `user.getIdToken()`.
   - POST the ID token to the `/api/auth/login` route to create a session cookie.

   ```bash
   curl -i -X POST http://localhost:3000/api/auth/login \
     -H 'Content-Type: application/json' \
     -d '{"idToken":"<ID_TOKEN>"}'
   ```

Security notes

- Keep `.env.local` and any service account files out of git. This repo's `.gitignore` includes `.env*` and `serviceAccountKey.json`.
- Never use the Admin private key in a client bundle.
- For production, use your hosting platform's secrets manager (Vercel/Netlify/GCP) rather than `.env.local`.

Note: The project no longer enables a development fallback by default. If you need to iterate on UI flows without valid admin credentials, you can opt-in locally by setting `DEV_FALLBACK=true` in `.env.local` and ensuring `NODE_ENV=development`. This enables a temporary, insecure fallback (the server will approximate session cookies) and should NEVER be enabled in CI or production.

Example (local only — DO NOT COMMIT):

```bash
# .env.local
NODE_ENV=development
# DEV_FALLBACK=true  # Uncomment to enable insecure dev fallback
```

When `DEV_FALLBACK` is enabled, the server will print a prominent warning to the console. Prefer supplying the real `FIREBASE_SERVICE_ACCOUNT` instead.

## CI / Pre-deploy requirement

This repository includes a CI workflow that enforces Firebase Admin credentials are configured as repository secrets. The workflow will fail if none of the following repository secrets are set:

- `FIREBASE_SERVICE_ACCOUNT` (the full JSON string)
- OR the set: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY`

Add these secrets in your Git host (GitHub → Settings → Secrets → Actions) before merging or deploying. The CI also scans for accidentally committed service account JSON or `.env.local` and will fail the build if it finds them.

This ensures deployments run with proper admin credentials and avoids leaking secrets in the repository.

## Adding GitHub Secrets

1. Go to your repository on GitHub.
2. Settings → Secrets and variables → Actions → New repository secret.
3. Add `FIREBASE_SERVICE_ACCOUNT` and paste the entire service account JSON as the value, or add the three individual secrets `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY`.
4. Save and ensure the CI workflow passes on your next push or PR.

The CI workflow will validate that one of these secret configurations exists and will fail the build if none are set.

## CLI: Setting secrets with `gh` or Vercel CLI

If you prefer command-line automation, you can use the GitHub CLI (`gh`) or Vercel CLI to add secrets. These require you to be authenticated locally.

- GitHub (using `gh`):

   ```bash
   # from your repo directory
   gh secret set FIREBASE_SERVICE_ACCOUNT --body-file /path/to/serviceAccountKey.json
   ```

   This uploads the JSON file securely as an Actions secret. The `scripts/set_github_secret.sh` helper in the repo demonstrates this.

- Vercel (using `vercel` CLI):

   ```bash
   # set for production environment
   vercel env add FIREBASE_SERVICE_ACCOUNT production
   # the CLI will prompt you to paste the value
   ```

   Alternatively use the Vercel dashboard: Project → Settings → Environment Variables → Add.

Note: If your provider turns newlines into `\\n`, our initializer will replace `\\\\n` with real newlines before constructing the credential object. Double-check the `private_key` formatting if auth fails.