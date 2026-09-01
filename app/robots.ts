import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/',
    },
    sitemap: 'https://ipurposesoul.com/sitemap.xml',
    host: 'https://ipurposesoul.com',
  };
}
