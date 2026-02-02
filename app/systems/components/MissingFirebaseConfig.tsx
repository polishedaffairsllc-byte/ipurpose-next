function MissingFirebaseConfig() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-6 py-12">
      <div className="max-w-xl w-full rounded-2xl border border-warmCharcoal/10 bg-white/80 shadow-soft-lg p-8 space-y-4 text-warmCharcoal/80 font-marcellus">
        <p className="text-sm font-semibold tracking-[0.25em] uppercase text-warmCharcoal/60">
          Server Misconfigured
        </p>
        <p className="text-base">
          Firebase Admin credentials are missing for this deployment. Set
          <code className="mx-1 rounded bg-neutral-900/5 px-1.5 py-0.5 text-xs font-mono text-indigoDeep">
            FIREBASE_SERVICE_ACCOUNT_KEY
          </code>
          (JSON or base64 encoded service account), or provide
          <code className="mx-1 rounded bg-neutral-900/5 px-1.5 py-0.5 text-xs font-mono text-indigoDeep">
            FIREBASE_SERVICE_ACCOUNT
          </code>
          /
          <code className="mx-1 rounded bg-neutral-900/5 px-1.5 py-0.5 text-xs font-mono text-indigoDeep">
            FIREBASE_ADMIN_CREDENTIALS
          </code>
          in the Vercel Preview and Production environments, then redeploy.
        </p>
        <p className="text-sm text-warmCharcoal/70">
          Once the secret is present, re-run the health check and the Calendar Sync harness to confirm preview parity.
        </p>
      </div>
    </div>
  );
}

export default MissingFirebaseConfig;
