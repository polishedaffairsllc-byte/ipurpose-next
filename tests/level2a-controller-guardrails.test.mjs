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

import { spawnSync } from 'node:child_process';

// Exercise the exact shell block from the trusted workflow, without GitHub
// credentials or network access. Each case must exit before the first API call.
function trustedShell() {
  const marker = '        run: |\n';
  const index = source.indexOf(marker);
  assert.notEqual(index, -1, 'trusted workflow must contain a shell run block');
  const lines = source.slice(index + marker.length).split('\n').filter((line, i, all) => i < all.findIndex(candidate => /^      - name:/.test(candidate)));
  return lines.filter(line => line.trim() !== '').map(line => {
    assert.ok(line.startsWith('          '), 'unexpected shell indentation');
    return line.slice(10);
  }).join('\n');
}

test('actual trusted controller shell rejects disabled and emergency-stop states', () => {
  const script = trustedShell();
  for (const [enabled, emergencyStop, reason] of [
    ['', '', 'disabled or unconfigured'],
    ['false', 'false', 'disabled or unconfigured'],
    ['true', '', 'Emergency stop active or unconfigured'],
    ['true', 'true', 'Emergency stop active or unconfigured'],
    ['TRUE', 'false', 'disabled or unconfigured'],
  ]) {
    const result = spawnSync('bash', ['-c', script], {
      encoding: 'utf8',
      timeout: 3000,
      env: {
        PATH: process.env.PATH,
        ENABLED: enabled,
        EMERGENCY_STOP: emergencyStop,
        PR_NUMBER: '1',
        REPOSITORY: 'example/no-network',
        GH_TOKEN: '',
      },
    });
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stdout, new RegExp(reason));
    assert.doesNotMatch(result.stdout + result.stderr, /Cannot inspect PR|curl:/);
  }
});

test('trusted classifier is executed only after eligibility checks and without release privileges', () => {
  assert.match(source, /ref: main/);
  assert.match(source, /persist-credentials: false/);
  assert.match(source, /node scripts\/level2a-trusted-classify\.mjs/);
  assert.ok(source.indexOf('node scripts/level2a-trusted-classify.mjs') > source.indexOf('RELEASE NOT AUTHORIZED'));
  const classifier = readFileSync('scripts/level2a-trusted-classify.mjs', 'utf8');
  assert.match(classifier, /classifyLevel2A\(files/);
  assert.match(classifier, /fresh\.head\?\.sha !== pr\.head\.sha/);
  assert.match(classifier, /RELEASE NOT AUTHORIZED/);
  assert.doesNotMatch(classifier, /\/merge|deployments\/|actions\/workflows\/.*dispatches/);
});
