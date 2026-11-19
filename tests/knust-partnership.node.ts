import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isKNUSTPreviewEnabled, knustConfig } from '../lib/partnerships/knust';
import { partnershipEventName } from '../lib/partnerships/presentation';
import { proposalById } from '../lib/outreach/registry';
import { outreachSchema } from '../lib/outreach/model';
import { randomUUID } from 'node:crypto';

test('KNUST page is enabled and uses the approved 8-slide university format', () => {
  assert.equal(isKNUSTPreviewEnabled('production', 'production'), true);
  assert.equal(knustConfig.slides.length, 8);
  assert.equal(knustConfig.analyticsPrefix, 'knust');
  assert.equal(knustConfig.videoUrl, undefined);
});

test('KNUST translates presentation events and is registered for launch metrics', () => {
  for (const suffix of ['page_view', 'deck_start', 'slide_view', 'deck_interaction', 'deck_complete', 'pdf_download', 'visit_ipurpose_click', 'contact_click', 'video_click', 'overview_download']) {
    assert.equal(partnershipEventName(`sdsn_${suffix}`, 'knust'), `knust_${suffix}`);
  }
  const proposal = proposalById('knust-career-services');
  assert.equal(proposal?.pagePath, '/partnerships/knust/career-services');
  assert.deepEqual(proposal?.recipients, { selina_angmor: 'Mrs. Selina Doe Angmor' });
});

test('KNUST recipient attribution accepts the controlled director link', () => {
  const parsed = outreachSchema.safeParse({
    proposal_id: 'knust-career-services', source_event_name: 'knust_page_view',
    event_id: randomUUID(), session_id: randomUUID(), client_timestamp: '2026-10-30T18:00:00.000Z',
    page_path: '/partnerships/knust/career-services', visit_number: 1, sequence: 1,
    traffic_type: 'external', debug_mode: false, recipient_key: 'selina_angmor',
  });
  assert.equal(parsed.success, true);
});
