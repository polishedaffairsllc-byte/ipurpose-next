const fs = require('node:fs');
const cp = require('node:child_process');
const assert = require('node:assert/strict');
const ts = require('typescript');
const base = process.argv[2] || 'origin/main';
function original(file) { return cp.execFileSync('git', ['show', `${base}:${file}`], { encoding: 'utf8' }); }
function declarations(source, names) {
  const ast = ts.createSourceFile('source.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  return names.map(name => {
    const node = ast.statements.find(item => item.name?.text === name);
    assert.ok(node, name); return node.getText(ast);
  });
}
const unchanged = ['mobile/src/lib/onboarding.ts', 'app/clarity-check-quiz/page.tsx', 'app/clarity-check-results/page.tsx',
  'app/clarity-check/results/ClarityCheckResultsClient.tsx'];
for (const file of unchanged) assert.equal(fs.readFileSync(file, 'utf8'), original(file), file);
for (const [file, names] of [
  ['app/api/clarity-check/submit/route.ts', ['calculateDimensionScores', 'calculateIdentityType', 'generateSummary']],
  ['mobile/src/components/ClarityCheckFlow.tsx', ['Intro', 'ClarityQuestion', 'IdentityQuestion', 'FocusQuestion', 'Results']],
]) assert.deepEqual(declarations(fs.readFileSync(file, 'utf8'), names), declarations(original(file), names), file);
console.log('Clarity questions, identity choices, scoring, types and result-rendering copy match the baseline byte-for-byte.');
