import { runController } from './level2a-release-controller.mjs';

const env = process.env;
const fail = message => { console.error('::error::' + message); process.exitCode = 1; };
if (env.LEVEL2A_ENABLED !== 'true' || env.LEVEL2A_EMERGENCY_STOP !== 'false') {
  console.log('Level 2A OFF; no merge attempted');
  process.exit(0);
}
const repository = env.GITHUB_REPOSITORY;
const prNumber = env.PR_NUMBER;
const token = env.RELEASE_APP_TOKEN;
if (!token) { fail('Missing independently managed release app token'); process.exit(1); }
async function api(method, path, body) {
  const response = await fetch('https://api.github.com/repos/' + repository + '/' + path, {
    method,
    headers: {
      Authorization: 'Bearer ' + token,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body ? { 'Content-Type': 'application/json' } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  if (!response.ok) throw Error('GitHub ' + method + ' failed (' + response.status + ')');
  return response.json();
}
try {
  const result = await runController({
    api, repository, prNumber,
    enabled: env.LEVEL2A_ENABLED === 'true',
    emergencyStop: env.LEVEL2A_EMERGENCY_STOP !== 'false',
    execute: env.LEVEL2A_EXECUTE === 'true'
  });
  console.log(JSON.stringify(result));
} catch (error) { fail(error.message); }
