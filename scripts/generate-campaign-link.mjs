#!/usr/bin/env node

const BASE_URL = 'https://ipurposesoul.com';

const SOURCES = new Set(['youtube', 'instagram', 'facebook', 'linkedin', 'email', 'event', 'qr', 'partner']);
const MEDIUM_BY_SOURCE = {
  youtube: 'organic_video',
  instagram: 'organic_social',
  facebook: 'organic_social',
  linkedin: 'organic_social',
  email: 'email',
  event: 'offline',
  qr: 'offline',
  partner: 'referral',
};

function slug(value, label) {
  if (!value) throw new Error(`Missing ${label}`);
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  if (!normalized) throw new Error(`Invalid ${label}`);
  return normalized;
}

export function buildCampaignLink({ source, campaign, content, path = '/clarity-check' }) {
  const normalizedSource = slug(source, 'source');
  if (!SOURCES.has(normalizedSource)) {
    throw new Error(`Unsupported source: ${normalizedSource}. Allowed: ${[...SOURCES].join(', ')}`);
  }

  if (!path.startsWith('/')) throw new Error('path must start with /');

  const url = new URL(path, BASE_URL);
  url.searchParams.set('utm_source', normalizedSource);
  url.searchParams.set('utm_medium', MEDIUM_BY_SOURCE[normalizedSource]);
  url.searchParams.set('utm_campaign', slug(campaign, 'campaign'));
  url.searchParams.set('utm_content', slug(content, 'content'));
  return url.toString();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [source, campaign, content, path] = process.argv.slice(2);
  try {
    console.log(buildCampaignLink({ source, campaign, content, path }));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    console.error('Usage: node scripts/generate-campaign-link.mjs <source> <campaign> <content> [path]');
    process.exitCode = 1;
  }
}
