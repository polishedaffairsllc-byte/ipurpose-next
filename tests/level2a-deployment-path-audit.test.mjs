import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// Read-only defense in depth: this does not revoke Vercel credentials or
// enforce GitHub merge authorization. It catches new workflow deployment paths.
test('no GitHub Actions workflow can directly publish to Vercel', () => {
  const dir = '.github/workflows';
  const files = readdirSync(dir).filter(name => /\.ya?ml$/.test(name));
  const prohibited = [
    /\bamondnet\/vercel-action@/i,
    /\bvercel\s+(?:--prod\b|deploy\b|promote\b|alias\b)/i,
    /\bvercel\s+deploy\s+[^\n]*--prod\b/i,
    /\bvercel\s+--yes\s+--prod\b/i,
    /\bVERCEL_TOKEN\b/,
    /\bdeployments\.create\b/,
  ];
  for (const file of files) {
    const source = readFileSync(join(dir, file), 'utf8');
    for (const pattern of prohibited) {
      assert.doesNotMatch(source, pattern, `${file}: secondary production deployment path`);
    }
  }
});
