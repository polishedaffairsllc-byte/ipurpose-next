import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/discover', '/about', '/program', '/privacy', '/terms', '/contact', '/login', '/signup', '/clarity-check'],
      disallow: ['/dashboard', '/soul', '/systems', '/insights', '/ai', '/profile', '/settings', '/api', '/test', '/fivepage'],
    },
    sitemap: 'https://ipurposesoul.com/sitemap.xml',
  };
}
