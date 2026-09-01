import { MetadataRoute } from 'next';

const canonicalDomain = 'https://ipurposesoul.com';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${canonicalDomain}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${canonicalDomain}/discover`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${canonicalDomain}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${canonicalDomain}/program`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${canonicalDomain}/clarity-check`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];
}
