import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';

const workflows = readdirSync('.github/workflows').filter(name => /\.ya?ml$/.test(name));
const source = name => readFileSync('.github/workflows/' + name, 'utf8');

// These tests are repository-side defense in depth. They do not protect
// Vercel API tokens held outside GitHub, or Git integration deployments.
test('Level 2A workflows cannot obtain merge or deployment write authority', () => {
  for (const name of workflows.filter(n => n.startsWith('level2a-'))) {
    const yaml = source(name);
    assert.doesNotMatch(yaml, /^\s*(?:contents|pull-requests|deployments|actions|checks|statuses):\s*write\s*$/m, name);
    assert.doesNotMatch(yaml, /\b(?:gh\s+pr\s+merge|gh\s+api\s+[^\n]*\/merge|git\s+push|vercel\s+(?:deploy|promote|alias))\b/i, name);
    assert.doesNotMatch(yaml, /\b(?:secrets\.(?:VERCEL_TOKEN|GH_PAT|GITHUB_PAT)|pull_request_target[\s\S]*actions\/checkout[^\n]*ref:\s*\$\{\{\s*github\.event\.pull_request\.head\.sha)/i, name);
  }
});

test('trusted eligibility is manual, read-only and cannot approve its own result', () => {
  const yaml = source('level2a-trusted-eligibility.yml');
  assert.match(yaml, /^\s{2}workflow_dispatch:/m);
  assert.doesNotMatch(yaml, /^\s{2}(?:push|pull_request|pull_request_target|schedule):/m);
  assert.match(yaml, /RELEASE NOT AUTHORIZED/);
  assert.match(yaml, /LEVEL2A_EMERGENCY_STOP/);
  assert.match(yaml, /persist-credentials: false/);
  assert.doesNotMatch(yaml, /(?:auto-merge|merge_pull_request|approve_pull_request|create-deployment)/i);
});

test('duplicate deployment-path audit runs on all PRs and is not path filtered', () => {
  const yaml = source('level2a-deployment-path-audit.yml');
  assert.match(yaml, /^\s{2}pull_request:\s*$/m);
  assert.doesNotMatch(yaml, /^\s{4}paths(?:-ignore)?:/m);
});
