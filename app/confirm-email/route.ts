import { randomBytes } from 'node:crypto';

// This receipt is outside the marketing/analytics layout so a confirmation
// secret cannot become a tracker URL. The fragment is cleared before any POST.
export async function GET() {
  const nonce = randomBytes(16).toString('base64');
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Confirm your email · iPurpose</title><style>body{font:18px/1.6 Georgia,serif;color:#302b45;background:#f7f4fa;margin:0}main{max-width:560px;margin:10vh auto;padding:32px}button{font:inherit;background:#514361;color:white;border:0;border-radius:12px;padding:14px 24px;cursor:pointer}button:disabled{opacity:.6}a{color:#514361}</style></head><body><main><h1>Confirm your email</h1><p id="status" role="status">Confirm that you can receive mail at this address.</p><button id="confirm" type="button">Confirm my email address</button><p>Confirmation does not subscribe you to marketing.</p><a href="/">Return to iPurpose</a></main><script nonce="${nonce}">
const params = new URLSearchParams(window.location.hash.slice(1));
window.history.replaceState(null, '', '/confirm-email');
const button = document.getElementById('confirm');
const status = document.getElementById('status');
let pending = false;
button.addEventListener('click', async () => {
  if (pending) return;
  pending = true; button.disabled = true; status.textContent = 'Confirming…';
  try {
    const response = await fetch('/api/email/confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: params.get('key'), token: params.get('token') }) });
    if (!response.ok) throw new Error();
    status.textContent = 'Your email address is confirmed. Your marketing preferences have not changed.';
    button.hidden = true;
  } catch {
    status.textContent = 'This link could not be confirmed. It may have expired or already been used. You can request another by entering your email with your Clarity results.';
    pending = false; button.disabled = false;
  }
});
</script></body></html>`, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer', 'Content-Security-Policy': `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'`, 'X-Content-Type-Options': 'nosniff' } });
}
