'use client';
import { useRef, useState } from 'react';
import { universityConversation, UNIVERSITY_PARTNERSHIPS_EMAIL } from '@/lib/universities/conversation';
import styles from './university.module.css';
export default function UniversityConversationCTA({ institutionName }: { institutionName: string }) {
  const address = useRef<HTMLInputElement>(null);
  const [copyStatus, setCopyStatus] = useState('');
  const href = universityConversation(institutionName).href;
  const copy = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(UNIVERSITY_PARTNERSHIPS_EMAIL);
      setCopyStatus('Email address copied.');
    } catch {
      address.current?.focus(); address.current?.select();
      setCopyStatus('Email address selected. Use your device’s copy command to copy it.');
    }
  };
  return <>
    <a className="sdsn-primary" href={href} data-proposal-destination="conversation">Request a Conversation</a>
    <div className={styles.emailFallback}>
      <p>If your email app does not open, email us at:</p>
      <div className={styles.emailCopyControls}>
        <input ref={address} type="text" readOnly aria-label="Partnership email address" value={UNIVERSITY_PARTNERSHIPS_EMAIL} onFocus={event => event.currentTarget.select()} />
        <button type="button" onClick={copy}>Copy email address</button>
      </div>
      <p role="status" aria-live="polite" className={styles.copyStatus}>{copyStatus}</p>
    </div>
  </>;
}
