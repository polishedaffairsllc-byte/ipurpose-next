'use client';
import { useEffect, useState } from 'react';
import { reload, sendEmailVerification } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebaseClient';
export default function VerifyEmailPage() {
  const [status, setStatus] = useState('You can keep using your account while confirming your email.');
  const [busy, setBusy] = useState(false);
  const [verified, setVerified] = useState(false);
  async function check(send = false) {
    const user = getFirebaseAuth().currentUser;
    if (!user) { setStatus('Sign in to send or check your verification email.'); return; }
    setBusy(true);
    try {
      await reload(user); await user.getIdToken(true);
      setVerified(user.emailVerified);
      await fetch('/api/auth/email-status', { method: 'POST', headers: { Authorization: `Bearer ${await user.getIdToken()}` } });
      if (user.emailVerified) setStatus('Your email is verified. Your marketing preferences have not changed.');
      else if (send) { await sendEmailVerification(user); setStatus('Verification email sent. Open the link in your inbox or spam folder, then check again.'); }
      else setStatus('Your email is not verified yet. You can keep using your account.');
    } catch (error) {
      setStatus((error as { code?: string }).code === 'auth/too-many-requests' ? 'Please wait a few minutes before trying again.' : 'Unable to check right now. Please try again.');
    } finally { setBusy(false); }
  }
  useEffect(() => {
    const unsubscribe = getFirebaseAuth().onAuthStateChanged(user => { if (user) void check(); });
    return unsubscribe;
  }, []);
  return <main className="mx-auto max-w-xl px-6 py-20"><h1 className="text-3xl">Verify your email</h1><p role="status" className="my-6">{status}</p>{!verified ? <div className="flex gap-4"><button disabled={busy} onClick={() => void check(true)} className="rounded-xl border px-4 py-3">Send verification email</button><button disabled={busy} onClick={() => void check()} className="rounded-xl border px-4 py-3">I’ve verified my email</button></div> : null}<p className="my-6">Email verification confirms that you can receive mail. Marketing still requires your separate opt-in.</p><a href="/dashboard">Return to your account</a></main>;
}
