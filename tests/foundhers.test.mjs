import test from 'node:test';
import assert from 'node:assert/strict';
import { foundhersAttribution } from '../lib/foundhers.ts';

test('captures PDF attribution without unrelated query parameters', () => {
  const result = foundhersAttribution('?utm_source=foundhers_stage&utm_medium=pitch_deck&utm_campaign=foundhers_2026&utm_content=pdf&email=private@example.com&ipurpose_qa=1', null);
  assert.deepEqual(Object.fromEntries(result), { utm_source: 'foundhers_stage', utm_medium: 'pitch_deck', utm_campaign: 'foundhers_2026', utm_content: 'pdf' });
});
test('preserves the existing first touch used by downstream forms', () => {
  const result = foundhersAttribution('?utm_source=foundhers_stage&utm_campaign=foundhers_2026', JSON.stringify({ utm_source: 'original', utm_campaign: 'first', email: 'private@example.com' }));
  assert.deepEqual(Object.fromEntries(result), { utm_source: 'original', utm_campaign: 'first' });
});
test('recovers malformed or empty attribution without blocking navigation', () => {
  for (const stored of ['{', 'null', '{}', JSON.stringify({ utm_source: null })]) assert.equal(foundhersAttribution('?utm_source=foundhers_stage', stored).get('utm_source'), 'foundhers_stage');
});
test('bounds attribution and keeps only supported keys', () => {
  const result = foundhersAttribution('?utm_source=' + 'x'.repeat(500) + '&fbclid=ignore', null);
  assert.equal(result.get('utm_source')?.length, 200); assert.equal(result.size, 1);
});
