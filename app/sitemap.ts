import { MetadataRoute } from 'next';
import { purposePages } from '@/content/purpose';
import { getCanonicalUrl } from '@/lib/canonical';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: getCanonicalUrl('/purpose'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...purposePages.map((page) => ({
      url: getCanonicalUrl(`/purpose/${page.slug}`),
      changeFrequency: 'monthly' as const,
      priority: page.slug === 'what-is-my-purpose' ? 0.9 : 0.7,
    })),
    {
      url: getCanonicalUrl('/'),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: getCanonicalUrl('/discover'),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: getCanonicalUrl('/clarity-check'),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: getCanonicalUrl('/program'),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: getCanonicalUrl('/programs'),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: getCanonicalUrl('/guides/what-to-automate-in-your-business'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: getCanonicalUrl('/guides/ai-tools-vs-business-systems'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: getCanonicalUrl('/guides/why-ai-is-not-saving-you-time'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: getCanonicalUrl('/guides/how-to-use-ai-in-your-business'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: getCanonicalUrl('/guides/business-decision-making-system'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: getCanonicalUrl('/guides/ai-for-overwhelmed-entrepreneurs'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: getCanonicalUrl('/about'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: getCanonicalUrl('/starter-pack'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: getCanonicalUrl('/ai-blueprint'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...[
      '/clarity-check-quiz',
      '/ipurpose-6-week',
      '/build',
      '/workshop',
      '/info-session',
      '/support',
      '/privacy',
      '/terms',
      '/disclaimer',
    ].map((path) => ({
      url: getCanonicalUrl(path),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    {
      url: getCanonicalUrl('/contact'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
}
