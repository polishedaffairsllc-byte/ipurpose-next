import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { randomUUID } from 'node:crypto';
import { notFound } from 'next/navigation';
import { institutionBySlug } from '@/lib/universities/institutions';
import { resolveUniversityLink, universityPreviewEnabled } from '@/lib/universities/links';
import { privatePresentation } from '@/lib/universities/presentations';
import UniversityPresentation from './UniversityPresentation';
import '@/app/partnerships/sdsn/[audience]/sdsn.css';
import styles from './university.module.css';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'iPurpose · University partnership concept', robots: { index: false, follow: false, noarchive: true }, referrer: 'no-referrer' };
export default async function UniversityProposal({ params, searchParams }: { params: Promise<{ institution: string }>; searchParams: Promise<{ outreach?: string }> }) {
  if (!universityPreviewEnabled()) notFound();
  const institution = institutionBySlug((await params).institution); if (!institution || institution.already_contacted) notFound();
  const token = (await searchParams).outreach; if (!token) notFound();
  const { firebaseAdmin } = await import('@/lib/firebaseAdmin'); const db=firebaseAdmin.firestore(); const link = await resolveUniversityLink(db, token);
  if (!link || link.institution.institution_id !== institution.institution_id) notFound();
  const deck=await privatePresentation(db,link); if(!deck)notFound();
  let sessionId = randomUUID(), visitNumber = 1;
  try { const visit = JSON.parse(Buffer.from((await cookies()).get(`university_visit_${link.hash.slice(0,16)}`)?.value || '', 'base64url').toString()); if (/^[0-9a-f-]{36}$/.test(visit.id)) { sessionId = visit.id; visitNumber = visit.number || 1; } } catch { /* Anonymous fallback. */ }
  const slides=deck.slides.map(slide=>{const stem=`/p/${token}/asset/slide-${String(slide.number).padStart(2,'0')}`;return {src:`${stem}.webp`,srcSet:`${stem}-1280.webp 1280w, ${stem}-1920.webp 1920w, ${stem}.webp 2880w`,title:slide.title,alt:slide.body,dwellSeconds:18};});
  return <main className="sdsn-page university-page min-h-screen">
    <a className="sdsn-skip" href="#university-presentation">Skip to presentation</a>
    <header className="sdsn-brand"><div className="sdsn-container"><span className="sdsn-wordmark">iPurpose<span aria-hidden="true">.</span></span></div></header>
    <section className="sdsn-intro" aria-labelledby="university-title"><div className="sdsn-container"><p className="sdsn-eyebrow">{deck.prepared_for}</p><h1 id="university-title">iPurpose × {institution.institution_name}</h1><p className="sdsn-subtitle">An exploratory student-development pilot connecting clarity, confident decisions and purposeful next steps.</p><div className="sdsn-signature"><p>Renita Hamilton, MPS — Founder &amp; CEO, iPurpose</p><p>Strategic Leadership · Social Impact · AI-Enabled Human Development</p></div></div></section>
    <section id="university-presentation" className="sdsn-deck-section sdsn-container" aria-label={`iPurpose × ${institution.institution_name}`}>
      <UniversityPresentation institution={institution} token={token} sessionId={sessionId} visitNumber={visitNumber} contactId={link.contactId} outreachId={link.hash} slides={slides}/>
    </section>
    <section className="sdsn-contact sdsn-container" aria-labelledby="university-invitation"><div className="sdsn-contact-copy"><span className="sdsn-contact-line" aria-hidden="true"/><h2 id="university-invitation">Invitation to explore</h2><p>{deck.slides[7].paragraphs[0]}</p></div><div className="sdsn-actions"><a className="sdsn-primary" href={`/p/${token}/go/conversation`} data-proposal-destination="conversation">Request a conversation</a><div className="sdsn-secondary-actions"><a href={`/p/${token}/download`} data-proposal-destination="pdf" download={deck.pdf_filename}>Download PDF</a></div></div></section>
    <div className="sdsn-container"><p className={styles.notice}>Discussion draft · No institutional endorsement or agreed partnership is implied. Link activity may include previews, forwarding and security scans; it does not establish that a named recipient read this presentation.</p></div>
    <footer className="sdsn-footer">© 2026 iPurpose · Concept for discussion</footer>
  </main>;
}
