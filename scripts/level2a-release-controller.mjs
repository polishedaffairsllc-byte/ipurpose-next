import { classifyLevel2A } from './level2a-risk-classifier.mjs';

export const REQUIRED_CHECKS = [
  'Verify Secrets & Repository Safety',
  'Firestore alignment regression tests',
  'Install, Lint, Type Check, Build & Test',
  'Verify Repository & Type Safety',
  'Tests, types, lint and unsigned mobile exports',
  'Level 2A no duplicate Vercel deployment paths',
  'Level 2A release authority boundary regression'
];

export function validateRelease({ pr, files, checks, repository, enabled, emergencyStop, expectedHead, expectedBase }) {
  if (enabled !== true || emergencyStop !== false) return { ok: false, reason: 'disabled-or-stopped' };
  if (!pr || pr.state !== 'open' || pr.draft || pr.mergeable !== true ||
      pr.base?.ref !== 'main' || pr.base?.repo?.full_name !== repository ||
      pr.head?.repo?.full_name !== repository ||
      !/^[a-f0-9]{40}$/.test(pr.head?.sha || '') ||
      !/^[a-f0-9]{40}$/.test(pr.base?.sha || '') ||
      pr.head.sha !== expectedHead || pr.base.sha !== expectedBase)
    return { ok: false, reason: 'pr-identity-or-sha' };
  const risk = classifyLevel2A(files, { enabled: true, emergencyStop: false });
  if (!risk.eligible) return { ok: false, reason: 'risk-' + risk.reason };
  if (!Array.isArray(checks)) return { ok: false, reason: 'missing-checks' };
  for (const name of REQUIRED_CHECKS) {
    const matching = checks.filter(c => c.name === name && c.head_sha === expectedHead &&
      c.app?.slug === 'github-actions' && c.status === 'completed' && c.conclusion === 'success');
    if (matching.length !== 1) return { ok: false, reason: 'required-check-' + name };
  }
  return { ok: true, reason: 'eligible-for-sha-bound-merge' };
}

export async function runController({ api, repository, prNumber, enabled, emergencyStop, execute }) {
  if (enabled !== true || emergencyStop !== false) throw Error('Level 2A disabled or emergency stop active');
  if (!/^[\w.-]+\/[\w.-]+$/.test(repository) || !/^[1-9]\d*$/.test(String(prNumber))) throw Error('Invalid controller inputs');
  const pr = await api('GET', 'pulls/' + prNumber);
  const head = pr.head?.sha, base = pr.base?.sha;
  const [files, checkResponse] = await Promise.all([
    api('GET', 'pulls/' + prNumber + '/files?per_page=3'),
    api('GET', 'commits/' + head + '/check-runs?per_page=100')
  ]);
  let decision = validateRelease({pr, files, checks: checkResponse.check_runs, repository, enabled, emergencyStop, expectedHead: head, expectedBase: base});
  if (!decision.ok) throw Error('Release denied: ' + decision.reason);
  const fresh = await api('GET', 'pulls/' + prNumber);
  decision = validateRelease({pr: fresh, files, checks: checkResponse.check_runs, repository, enabled, emergencyStop, expectedHead: head, expectedBase: base});
  if (!decision.ok) throw Error('Release changed during verification: ' + decision.reason);
  if (!execute) return { merged: false, head, reason: 'DRY RUN ONLY' };
  // GitHub's expected SHA prevents a changed head from merging. Branch rules
  // and required checks remain enforced; no admin bypass or push is used.
  const result = await api('PUT', 'pulls/' + prNumber + '/merge', {
    sha: head, merge_method: 'squash', commit_title: 'Level 2A authorized low-risk release (#' + prNumber + ')'
  });
  if (result.merged !== true) throw Error('GitHub did not confirm merge');
  return { merged: true, head, mergeSha: result.sha };
}
