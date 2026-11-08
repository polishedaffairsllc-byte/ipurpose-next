'use client';
import { useEffect, useRef, useState } from 'react';
import { onIdTokenChanged } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebaseClient';
import type { UniversityReview } from '@/lib/universities/review';
import { reviewCsv } from '@/lib/universities/drafts';
import { universityEmailHtml, universityEmailParts } from '@/lib/universities/email-links';
export default function UniversityReviewClient() {
  const [data, setData] = useState<UniversityReview | null>(null);
  const [error, setError] = useState('Administrator sign-in is required.');
  const [selected, setSelected] = useState('north-carolina-a-t-state-university');
  const [copyStatus, setCopyStatus] = useState('');
  const draft = useRef<HTMLPreElement>(null);
  useEffect(() => {
    let epoch = 0;
    const unsubscribe = onIdTokenChanged(getFirebaseAuth(), async user => {
      const version = ++epoch; setData(null); if (!user) { setError('Administrator sign-in is required.'); return; }
      setError('Loading private review queue…');
      try {
        const token = await user.getIdToken(); const response = await fetch('/api/admin/university-outreach', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store', credentials: 'omit', signal: AbortSignal.timeout(20000) });
        const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Private review unavailable.');
        if (epoch === version) { setData(result); setError(''); }
      } catch (failure) { if (epoch === version) setError(failure instanceof Error ? failure.message : 'Private review unavailable.'); }
    });
    return () => { epoch++; unsubscribe(); };
  }, []);
  const row = data?.rows.find(item => item.institution_id === selected);
  const copy = async (kind: 'draft' | 'link') => {
    if (!row) return;
    try {
      if (kind === 'draft' && navigator.clipboard?.write && typeof ClipboardItem !== 'undefined') {
        await navigator.clipboard.write([new ClipboardItem({ 'text/plain': new Blob([row.email_body], { type: 'text/plain' }), 'text/html': new Blob([universityEmailHtml(row.email_body)], { type: 'text/html' }) })]);
        setCopyStatus('Email draft copied with clickable links.');
      } else {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(kind === 'draft' ? row.email_body : row.email_preview_url || '');
        setCopyStatus(kind === 'draft' ? 'Email draft copied with complete URLs.' : 'Complete private preview link copied.');
      }
    } catch {
      if (draft.current) { const range = document.createRange(); range.selectNodeContents(draft.current); const selection = window.getSelection(); selection?.removeAllRanges(); selection?.addRange(range); }
      setCopyStatus('Select and copy the draft below, or open its clickable preview link.');
    }
  };
  return <main className="mx-auto max-w-5xl px-5 py-12 text-deepIndigo">
    <h1 className="text-3xl font-semibold">University outreach review</h1>
    <p className="my-4">Private draft queue · Each institution page and matching email require separate approval. No sending, scheduling or publication action is available here.</p>
    <a className="underline" href="/admin/launch-metrics">Proposal activity dashboard</a>
    {error && <p role="status" className="my-6">{error}</p>}
    {data && <>
      <p className="my-4">Tracking and attribution: Link activity may include internal previews, forwarding and security scans. It identifies the link used; it does not establish that a named recipient read a presentation.</p>
      <p className="my-4">{data.counts.institutions} active institutions · {data.counts.new} new targets · {data.counts.already_contacted} already contacted · {data.counts.archived} archived</p>
      <label className="block">Institution<select aria-label="Review institution" className="my-2 block w-full rounded border p-3" value={selected} onChange={event => { setSelected(event.target.value); setCopyStatus(''); }}>{data.rows.map(item => <option key={item.institution_id} value={item.institution_id}>{item.institution_name}{item.already_contacted ? ' — already contacted' : ''}</option>)}</select></label>
      <button className="my-4 rounded border px-4 py-3" onClick={() => { const url = URL.createObjectURL(new Blob([reviewCsv(data.rows)], { type: 'text/csv;charset=utf-8' })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'university-outreach-private-review.csv'; anchor.click(); URL.revokeObjectURL(url); }}>Export private review queue CSV</button>
      {row && <article className="my-5 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold">{row.institution_name}</h2><p>{row.country}{row.state ? ` · ${row.state}` : ''}</p><p className="my-3">{row.review_status} · {row.sent_status}</p>
        <p>{row.context}</p><p className="my-3">{row.rationale}</p>
        <h3 className="mt-6 font-semibold">Contact verification</h3><p>{row.recipient_name || 'Named contact not verified'} · {row.recipient_email || 'Work email not verified'}</p><p>{row.primary_office || 'Responsible office needs confirmation'} · {row.contact_status}</p>
        <a className="break-all underline" href={row.verified_source_url} target="_blank" rel="noopener noreferrer">Verification source</a><p>Checked {row.source_checked_at}</p>
        {row.notes.length > 0 && <ul className="my-4 list-disc pl-5">{row.notes.map((note, i) => <li key={i}>{String(note)}</li>)}</ul>}
        {row.preview_url && <a className="my-5 inline-block rounded bg-deepIndigo px-4 py-3 text-white" href={row.preview_url} target="_blank" rel="noopener noreferrer">Open private proposal preview</a>}
        <p>{row.analytics_status}</p><p className="my-3 break-all text-sm">Tracking identifier: {row.outreach_id || 'Existing outreach preserved'}</p>
        {row.pdf_url && <a className="my-3 block underline" href={row.pdf_url} download>Download complete eight-slide PDF</a>}
        {row.presentation_copy && <details className="my-5"><summary className="cursor-pointer font-semibold">Full eight-slide copy</summary>{row.presentation_copy.map(slide=><section key={slide.number} className="my-4 border-t pt-4"><h3 className="font-semibold">Slide {slide.number} — {slide.title}</h3><p className="my-3 whitespace-pre-wrap leading-relaxed">{slide.body}</p></section>)}</details>}
        <h3 className="mt-6 font-semibold">{row.already_contacted ? 'Optional follow-up draft — prior outreach log required' : 'Email draft — unsent'}</h3>
        {!row.already_contacted && row.email_preview_url && <><p className="my-3">These drafts use private preview links. The ipurposesoul.com proposal links remain unavailable until publication is approved.</p><div className="my-3 flex flex-wrap gap-3"><button type="button" className="rounded border px-4 py-3" onClick={() => copy('draft')}>Copy email draft</button><button type="button" className="rounded border px-4 py-3" onClick={() => copy('link')}>Copy private preview link</button></div><p role="status" className="my-3">{copyStatus}</p></>}
        <p className="my-3 font-semibold">Subject: {row.email_subject}</p><pre ref={draft} className="whitespace-pre-wrap break-words font-sans leading-relaxed [overflow-wrap:anywhere]">{universityEmailParts(row.email_body).map((part,i)=>part.href?<a key={i} className="underline" href={part.href} target="_blank" rel="noopener noreferrer">{part.text}</a>:part.text)}</pre>
      </article>}
      <details className="my-8"><summary className="cursor-pointer font-semibold">Archived — excluded from active outreach ({data.archived_rows.length})</summary><p className="my-3">Presentations and history are preserved for reference. These institutions are excluded from the active queue and its CSV export.</p><ul className="list-disc pl-5">{data.archived_rows.map(item=><li key={item.institution_id} className="my-3">{item.institution_name} · excluded from active outreach{item.preview_url && <> · <a className="underline" href={item.preview_url} target="_blank" rel="noopener noreferrer">Private historical presentation</a></>}{item.pdf_url && <> · <a className="underline" href={item.pdf_url} download>Archived PDF</a></>}</li>)}</ul></details>
    </>}
  </main>;
}
