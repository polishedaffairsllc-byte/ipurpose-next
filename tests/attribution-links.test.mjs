import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCampaignLink } from '../scripts/generate-campaign-link.mjs';

test('YouTube Shorts link uses canonical attribution fields', () => {
  const url = new URL(buildCampaignLink({
    source: 'YouTube',
    campaign: 'Clarity Check',
    content: 'Signal S2E1 Short',
  }));

  assert.equal(url.origin, 'https://ipurposesoul.com');
  assert.equal(url.pathname, '/clarity-check');
  assert.equal(url.searchParams.get('utm_source'), 'youtube');
  assert.equal(url.searchParams.get('utm_medium'), 'organic_video');
  assert.equal(url.searchParams.get('utm_campaign'), 'clarity_check');
  assert.equal(url.searchParams.get('utm_content'), 'signal_s2e1_short');
});

test('social, email, offline and referral sources receive fixed mediums', () => {
  const expected = {
    instagram: 'organic_social',
    facebook: 'organic_social',
    linkedin: 'organic_social',
    email: 'email',
    event: 'offline',
    qr: 'offline',
    partner: 'referral',
  };

  for (const [source, medium] of Object.entries(expected)) {
    const url = new URL(buildCampaignLink({ source, campaign: 'launch', content: 'example' }));
    assert.equal(url.searchParams.get('utm_medium'), medium);
  }
});

test('destination path can change without changing attribution contract', () => {
  const url = new URL(buildCampaignLink({
    source: 'youtube',
    campaign: 'starter pack',
    content: 'signal s2e5 short',
    path: '/starter-pack',
  }));
  assert.equal(url.pathname, '/starter-pack');
  assert.equal(url.searchParams.get('utm_campaign'), 'starter_pack');
});

test('unsupported sources and unsafe paths are rejected', () => {
  assert.throws(() => buildCampaignLink({ source: 'random', campaign: 'x', content: 'y' }), /Unsupported source/);
  assert.throws(() => buildCampaignLink({ source: 'youtube', campaign: 'x', content: 'y', path: 'https://example.com' }), /path must start/);
});
