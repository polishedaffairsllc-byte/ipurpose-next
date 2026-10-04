import Link from 'next/link';
import { purposePages } from '@/content/purpose';
import PurposeCta from './_components/PurposeCta';
import { purposeLinkClass } from './_components/PurposeBody';
import { purposeBreadcrumbs, purposeMetadata } from './seo';

export const metadata = purposeMetadata(
  'Find Your Purpose: Values, Reflection, and Your Next Step',
  'Explore what purpose means, identify your values, and turn reflection into action. Start with simple exercises and find your next aligned step.',
  '/purpose',
);

export default function PurposeHub() {
  return (
    <main id="purpose-content" className="purpose:mx-auto purpose:max-w-5xl purpose:px-5 purpose:py-10 purpose:font-marcellus purpose:text-base purpose:leading-relaxed purpose:sm:px-8 purpose:sm:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(purposeBreadcrumbs()).replace(/</g, '\\u003c') }} />
      <nav aria-label="Breadcrumb" className="purpose:mb-10 purpose:text-sm"><ol className="purpose:flex purpose:list-none purpose:p-0 purpose:gap-2"><li><Link href="/" className={purposeLinkClass}>Home</Link></li><li aria-hidden="true">/</li><li aria-current="page">Purpose</li></ol></nav>
      <header className="purpose:mb-12 purpose:max-w-3xl">
        <p className="purpose:mb-4 purpose:text-sm purpose:uppercase purpose:tracking-widest purpose:text-indigoDeep">Purpose → Clarity → Action → Systems → AI</p>
        <h1 className="purpose:font-italiana purpose:text-display-hero purpose:text-indigoDeep">Find your purpose, one honest step at a time.</h1>
        <p className="purpose:mt-6">You don&apos;t need one perfect answer. Start with what matters to you, notice the clues in your own life, and choose a next step that fits.</p>
      </header>
      <section aria-labelledby="purpose-guides">
        <h2 id="purpose-guides" className="purpose:mb-6 purpose:font-italiana purpose:text-display-h2 purpose:text-indigoDeep">Explore your purpose</h2>
        <ol className="purpose:grid purpose:list-none purpose:p-0 purpose:gap-6 purpose:md:grid-cols-2">
          {purposePages.map((page, index) => <li key={page.slug} className={`purpose:rounded-2xl purpose:border purpose:border-indigoDeep/20 purpose:p-6 purpose:sm:p-8 ${index === 0 ? 'purpose:bg-lavenderViolet/10 purpose:md:col-span-2' : 'purpose:bg-lightMistGray'}`}>
            {index === 0 && <p className="purpose:mb-3 purpose:text-sm purpose:uppercase purpose:tracking-widest purpose:text-indigoDeep">Start here</p>}
            <h3 className="purpose:font-italiana purpose:text-display-h3"><Link href={`/purpose/${page.slug}`} className={purposeLinkClass}>{page.heading}</Link></h3>
            <p className="purpose:mt-4">{page.summary}</p>
          </li>)}
        </ol>
      </section>
      <section aria-labelledby="hub-cta" className="purpose:mt-12 purpose:rounded-2xl purpose:bg-indigoDeep purpose:px-6 purpose:py-10 purpose:text-lightMistGray purpose:sm:p-10">
        <h2 id="hub-cta" className="purpose:font-italiana purpose:text-display-h2">Ready for your next aligned step?</h2>
        <p className="purpose:mt-5 purpose:max-w-2xl">Start with the Clarity Check to see where you are right now and what your next step could be.</p>
        <PurposeCta slug="index" label={purposePages[0].cta.label} />
      </section>
    </main>
  );
}
