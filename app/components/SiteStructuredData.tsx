const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://ipurposesoul.com/#organization',
      name: 'iPurpose',
      url: 'https://ipurposesoul.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://ipurposesoul.com/images/my-logo.png',
      },
      description:
        'iPurpose helps creators and entrepreneurs turn clarity into sustainable systems and practical AI-supported action through the Soul → Systems → AI framework.',
    },
    {
      '@type': 'WebSite',
      '@id': 'https://ipurposesoul.com/#website',
      url: 'https://ipurposesoul.com',
      name: 'iPurpose',
      publisher: {
        '@id': 'https://ipurposesoul.com/#organization',
      },
      inLanguage: 'en-US',
    },
  ],
};

export default function SiteStructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
      }}
    />
  );
}
