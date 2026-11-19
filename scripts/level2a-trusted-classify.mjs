// Read-only trusted workflow integration: no PR checkout, merge, or deploy authority.
import { classifyLevel2A } from './level2a-risk-classifier.mjs';

const deny = message => { console.error('::error::' + message); process.exit(1); };
const { GITHUB_TOKEN, GITHUB_REPOSITORY, PR_NUMBER, LEVEL2A_ENABLED, LEVEL2A_EMERGENCY_STOP } = process.env;
if (LEVEL2A_ENABLED !== 'true' || LEVEL2A_EMERGENCY_STOP !== 'false') deny('Level 2A disabled or emergency stop active');
if (!/^\d+$/.test(PR_NUMBER || '') || !GITHUB_TOKEN || !/^[\w.-]+\/[\w.-]+$/.test(GITHUB_REPOSITORY || '')) deny('Missing trusted inputs');
async function api(path) {
  const response = await fetch('https://api.github.com/repos/' + GITHUB_REPOSITORY + '/' + path, {
    headers: { Authorization: 'Bearer ' + GITHUB_TOKEN, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' }
  });
  if (!response.ok) deny('GitHub API unavailable: ' + response.status);
  return response.json();
}
const pr = await api('pulls/' + PR_NUMBER);
if (pr.state !== 'open' || pr.draft || pr.base?.ref !== 'main' ||
    pr.base?.repo?.full_name !== GITHUB_REPOSITORY ||
    pr.head?.repo?.full_name !== GITHUB_REPOSITORY ||
    !/^[a-f0-9]{40}$/.test(pr.head?.sha || '')) deny('Untrusted PR identity');
const files = await api('pulls/' + PR_NUMBER + '/files?per_page=3');
const decision = classifyLevel2A(files, { enabled: true, emergencyStop: false });
if (!decision.eligible) deny('Classifier denied: ' + decision.reason);
const fresh = await api('pulls/' + PR_NUMBER);
if (fresh.head?.sha !== pr.head.sha || fresh.base?.sha !== pr.base.sha ||
    fresh.state !== 'open' || fresh.draft) deny('PR changed during classification');
console.log('::notice::Trusted classifier eligible for ' + pr.head.sha + '; RELEASE NOT AUTHORIZED');
