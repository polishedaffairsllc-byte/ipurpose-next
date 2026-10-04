import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPurposePage, purposePages } from '@/content/purpose';
import { getCanonicalUrl } from '@/lib/canonical';
import PurposeBody, { purposeLinkClass } from '../_components/PurposeBody';
import PurposeCta from '../_components/PurposeCta';
import { purposeBreadcrumbs, purposeMetadata } from '../seo';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return purposePages.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const page = getPurposePage((await params).slug);
  if (!page) notFound();
  return purposeMetadata(page.title, page.description, `/purpose/${page.slug}`, true);
}

export default async function PurposeArticle({ params }: Props) {
  const page = getPurposePage((await params).slug);
  if (!page) notFound();
  const url = getCanonicalUrl(`/purpose/${page.slug}`);
  const structuredData = [
    {
      '@context': 'https://schema.org', '@type': 'Article',
      '@id': `${url}#article`, headline: page.heading,
      description: page.description, url, mainEntityOfPage: url,
      image: getCanonicalUrl('/images/my-logo.png'),
      inLanguage: 'en-US', articleSection: 'Purpose',
      publisher: { '@type': 'Organization', name: 'iPurpose', url: getCanonicalUrl('/') },
    },
    purposeBreadcrumbs(page.heading, page.slug),
  ];
  return (
    <main id="purpose-content" className="purpose:mx-auto purpose:max-w-3xl purpose:px-5 purpose:py-10 purpose:font-marcellus purpose:text-base purpose:leading-relaxed purpose:sm:px-8 purpose:sm:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />
      <nav aria-label="Breadcrumb" className="purpose:mb-10 purpose:text-sm">
        <ol className="purpose:flex purpose:list-none purpose:p-0 purpose:flex-wrap purpose:items-center purpose:gap-2">
          <li><Link href="/" className={purposeLinkClass}>Home</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/purpose" className={purposeLinkClass}>Purpose</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">{page.heading}</li>
        </ol>
      </nav>
      <article>
        <header className="purpose:mb-10 purpose:border-b purpose:border-indigoDeep/20 purpose:pb-8">
          <p className="purpose:mb-4 purpose:text-sm purpose:uppercase purpose:tracking-widest purpose:text-indigoDeep">Purpose</p>
          <h1 className="purpose:font-italiana purpose:text-display-hero purpose:text-indigoDeep">{page.heading}</h1>
        </header>
        <PurposeBody blocks={page.body} />
        <aside aria-labelledby="related-pages" className="purpose:mt-12 purpose:border-t purpose:border-indigoDeep/20 purpose:pt-8">
          <h2 id="related-pages" className="purpose:font-italiana purpose:text-display-h2 purpose:text-indigoDeep">Related pages</h2>
          <ul className="purpose:mt-5 purpose:list-none purpose:p-0 purpose:space-y-4">
            {page.related.map((slug) => {
              const related = getPurposePage(slug)!;
              return <li key={slug}><Link href={`/purpose/${slug}`} className={purposeLinkClass}>{related.heading}</Link></li>;
            })}
          </ul>
        </aside>
        <section aria-labelledby="purpose-cta-heading" className="purpose:mt-12 purpose:rounded-2xl purpose:bg-indigoDeep purpose:px-5 purpose:py-8 purpose:text-lightMistGray purpose:sm:px-8 purpose:sm:py-10">
          <h2 id="purpose-cta-heading" className="purpose:mb-6 purpose:font-italiana purpose:text-display-h2">{page.cta.heading}</h2>
          <PurposeBody blocks={page.cta.body} />
          <PurposeCta slug={page.slug} label={page.cta.label} />
        </section>
        {page.afterCta.length > 0 && <div className="purpose:mt-8"><PurposeBody blocks={page.afterCta} /></div>}
      </article>
    </main>
  );
}
