const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
function load(relative, dependencies) {
  const output = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', relative), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  // eslint-disable-next-line @next/next/no-assign-module-variable -- Test-only CommonJS export object for isolated transpilation.
  const module = { exports: {} };
  new Function('require', 'module', 'exports', output)(id => dependencies[id], module, module.exports);
  return module.exports;
}
const safety = load('lib/ai/companionSafety.ts', { '../accountDeletionLock': {} });
function fixture(result, down = false) {
  const calls = [];
  const content = load('lib/ai/contentSafety.ts', { './companionSafety': safety,
    '@/app/api/gpt/utils/openai-client': { getOpenAI: () => ({ moderations: { create: async options => { calls.push(options); if (down) throw new Error('outage'); return result; } } }) } });
  return { ...content, calls };
}
test('moderation accepts only complete safe results and uses the documented model', async () => {
  const h = fixture({ results: [{ flagged: false }] });
  await h.requireSafeContent('Benign question');
  assert.deepEqual(h.calls, [{ model: 'omni-moderation-latest', input: 'Benign question' }]);
  for (const result of [{ results: [] }, { results: [{}] }]) await assert.rejects(fixture(result).requireSafeContent('text'), { status: 503 });
  await assert.rejects(fixture({ results: [{ flagged: true }] }).requireSafeContent('text'), { status: 422 });
  await assert.rejects(fixture({}, true).requireSafeContent('text'), { status: 503 });
  await assert.rejects(fixture({ results: [{ flagged: false }] }).requireSafeContent(['a', 'b']), { status: 503 });
});
