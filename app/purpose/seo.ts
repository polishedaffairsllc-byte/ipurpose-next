import type { Metadata } from 'next';
import { getCanonicalUrl } from '@/lib/canonical';

export function purposeMetadata(title: string, description: string, path: string, article = false): Metadata {
  const url = getCanonicalUrl(path);
  const images = [{ url: getCanonicalUrl('/images/my-logo.png'), alt: 'iPurpose' }];
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: { title, description, url, type: article ? 'article' : 'website', siteName: 'iPurpose', locale: 'en_US', images },
    twitter: { card: 'summary', title, description, images: images.map((image) => image.url) },
  };
}

export function purposeBreadcrumbs(heading?: string, slug?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: getCanonicalUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Purpose', item: getCanonicalUrl('/purpose') },
      ...(heading && slug ? [{ '@type': 'ListItem', position: 3, name: heading, item: getCanonicalUrl(`/purpose/${slug}`) }] : []),
    ],
  };
}
