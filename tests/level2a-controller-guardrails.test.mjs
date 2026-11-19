import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync('.github/workflows/level2a-trusted-eligibility.yml', 'utf8');

test('controller has no automatic release trigger', () => {
  assert.match(source, /workflow_dispatch:/);
  assert.doesNotMatch(source, /^\s{2}(push|pull_request|pull_request_target|schedule):/m);
});

test('controller token remains read-only', () => {
  assert.match(source, /permissions:\s*\n\s+contents: read\s*\n\s+pull-requests: read\s*\n\s+checks: read/);
  assert.doesNotMatch(source, /^\s+(contents|pull-requests|actions|deployments): write\s*$/m);
});

test('missing activation and emergency stop settings deny by default', () => {
  assert.match(source, /\[\[ "\$\{ENABLED\}" == "true" \]\] \|\| deny/);
  assert.match(source, /\[\[ "\$\{EMERGENCY_STOP\}" == "false" \]\] \|\| deny/);
  for (const [enabled, stop, expected] of [
    ['', '', false], ['false', 'false', false],
    ['true', '', false], ['true', 'true', false],
    ['true', 'false', true],
  ]) {
    assert.equal(enabled === 'true' && stop === 'false', expected);
  }
});

test('immutable source and trusted CI requirements are present', () => {
  assert.match(source, /\.head\.sha == \$head and \.base\.sha == \$base/);
  assert.match(source, /\.app\.slug == "github-actions"/);
  assert.match(source, /\.conclusion == "success"/);
  assert.match(source, /RELEASE NOT AUTHORIZED/);
});
