import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { parseAuditProcess, validateAudit, validateInstalledTree } from '../scripts/audit-production.mjs';

const ghsa = 'https://github.com/advisories/GHSA-m9gg-hp2v-232j';
const versions = { firebase: '10.14.1', '@firebase/firestore': '4.7.3',
  '@firebase/firestore-compat': '0.3.38', '@grpc/grpc-js': '1.9.16' };
const children = { firebase: ['@firebase/firestore', '@firebase/firestore-compat'],
  '@firebase/firestore': ['@grpc/grpc-js'], '@firebase/firestore-compat': ['@firebase/firestore'] };
const advisory = (name, severity, url) => ({ name, dependency: name, severity, url,
  source: 1240623, range: '<1.13.6', title: 'Advisory fixture' });

function recount(report) {
  const counts = { info: 0, low: 0, moderate: 0, high: 0, critical: 0, total: 0 };
  for (const finding of Object.values(report.vulnerabilities)) {
    counts[finding.severity]++;
    counts.total++;
  }
  report.metadata = { vulnerabilities: counts };
  return report;
}

function fixture() {
  const vulnerabilities = {};
  for (const name of Object.keys(versions)) {
    vulnerabilities[name] = { name, severity: 'high', nodes: [`node_modules/${name}`],
      effects: Object.keys(children).filter(parent => children[parent].includes(name)),
      via: children[name] ?? [advisory(name, 'high', ghsa),
        advisory(name, 'low', 'https://github.com/advisories/GHSA-f596-whhp-79r4')] };
  }
  vulnerabilities.uuid = { name: 'uuid', severity: 'moderate', nodes: ['node_modules/uuid'], effects: [],
    via: [advisory('uuid', 'moderate', 'https://github.com/advisories/GHSA-w5hq-g745-h8pq')] };
  return recount({ auditReportVersion: 2, vulnerabilities });
}

test('only the exact advisory and inherited Firebase parents pass; moderates remain visible', () => {
  const report = fixture();
  const parsed = parseAuditProcess({ status: 1, stdout: JSON.stringify(report) });
  assert.deepEqual(validateAudit(parsed), { info: 0, low: 0, moderate: 1, high: 4, critical: 0 });
  assert.equal(parsed.vulnerabilities.uuid.severity, 'moderate');
});

const mutations = {
  'another high advisory on gRPC': r => r.vulnerabilities['@grpc/grpc-js'].via.push(advisory('@grpc/grpc-js', 'high', 'https://github.com/advisories/GHSA-other')),
  'another high package': r => { r.vulnerabilities.other = { name: 'other', severity: 'high', nodes: ['node_modules/other'], effects: [], via: [advisory('other', 'high', 'https://github.com/advisories/GHSA-other')] }; },
  'critical severity even on the excepted advisory': r => { r.vulnerabilities['@grpc/grpc-js'].via[0].severity = 'critical'; },
  'additional vulnerable Admin gRPC copy': r => r.vulnerabilities['@grpc/grpc-js'].nodes.push('node_modules/google-gax/node_modules/@grpc/grpc-js'),
  'advisory disappears': r => { r.vulnerabilities['@grpc/grpc-js'].via.shift(); },
  'affected parent disappears': r => { delete r.vulnerabilities.firebase; },
  'parent has a different cause': r => { r.vulnerabilities.firebase.via = ['uuid']; },
  'unexpected parent': r => { r.vulnerabilities.other = { name: 'other', severity: 'high', nodes: ['node_modules/other'], effects: [], via: ['@grpc/grpc-js'] }; },
  'unexpected effects': r => r.vulnerabilities['@grpc/grpc-js'].effects.push('other'),
  'advisory range changes': r => { r.vulnerabilities['@grpc/grpc-js'].via[0].range = '*'; },
  'spoofed advisory URL': r => { r.vulnerabilities['@grpc/grpc-js'].via[0].url = `https://example.test/${ghsa}`; },
  'missing cause reference': r => { r.vulnerabilities.firebase.via = ['absent']; },
  'cyclic cause references': r => { r.vulnerabilities['@firebase/firestore'].via = ['firebase']; },
  'malformed leaf': r => { r.vulnerabilities['@grpc/grpc-js'].via = [null]; },
  'empty causes': r => { r.vulnerabilities['@grpc/grpc-js'].via = []; },
  'unknown severity': r => { r.vulnerabilities.uuid.severity = 'unknown'; },
  'missing paths': r => { delete r.vulnerabilities.firebase.nodes; },
  'new high advisory hidden under a moderate parent': r => r.vulnerabilities.uuid.via.push(advisory('uuid', 'high', 'https://github.com/advisories/GHSA-other')),
};
for (const [name, mutate] of Object.entries(mutations)) {
  test(`fails closed: ${name}`, () => {
    const report = fixture();
    mutate(report);
    recount(report);
    assert.throws(() => validateAudit(report));
  });
}
test('rejects inconsistent audit totals', () => {
  const report = fixture();
  report.metadata.vulnerabilities.high = 0;
  assert.throws(() => validateAudit(report));
});

for (const [name, result] of Object.entries({
  'process error': { status: 1, error: new Error('ENOENT') },
  'signal/timeout': { status: null, signal: 'SIGTERM' },
  'unexpected exit': { status: 2 },
  'malformed JSON': { status: 1, stdout: '{' },
  'registry error': { status: 1, stdout: JSON.stringify({ error: { code: 'ENOAUDIT' } }) },
  'unsupported format': { status: 1, stdout: JSON.stringify({ ...fixture(), auditReportVersion: 3 }) },
  'missing findings': { status: 1, stdout: JSON.stringify({ auditReportVersion: 2 }) },
  'missing summary': { status: 1, stdout: JSON.stringify({ ...fixture(), metadata: {} }) },
  'success exit with findings': { status: 0, stdout: JSON.stringify(fixture()) },
})) {
  test(`rejects audit command failure: ${name}`, () => assert.throws(() => parseAuditProcess(result)));
}

function installedFixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'audit-policy-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const packages = { '': { name: 'test-root', dependencies: { firebase: '^10.14.1' } } };
  for (const [name, version] of Object.entries(versions)) {
    packages[`node_modules/${name}`] = { name, version, dependencies: Object.fromEntries(
      (children[name] ?? []).map(child => [child, child === '@grpc/grpc-js' ? '~1.9.0' : versions[child]])) };
  }
  // A separately resolved, patched Admin gRPC copy must not be excepted or rejected.
  packages['node_modules/google-gax'] = { dependencies: { '@grpc/grpc-js': '^1.13.0' } };
  packages['node_modules/google-gax/node_modules/@grpc/grpc-js'] = { name: '@grpc/grpc-js', version: '1.14.5' };
  for (const [path, pkg] of Object.entries(packages)) {
    const file = join(root, path, 'package.json');
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, JSON.stringify(pkg));
  }
  writeFileSync(join(root, 'package-lock.json'), JSON.stringify({ lockfileVersion: 3, packages }));
  return root;
}
function editJSON(file, mutate) {
  const value = JSON.parse(readFileSync(file, 'utf8'));
  mutate(value);
  writeFileSync(file, JSON.stringify(value));
}

test('validates exact installed paths/versions with a separate patched gRPC copy', t => {
  validateInstalledTree(installedFixture(t));
});
for (const name of Object.keys(versions)) {
  test(`rejects installed version drift: ${name}`, t => {
    const root = installedFixture(t);
    editJSON(join(root, 'node_modules', name, 'package.json'), p => { p.version = '99.0.0'; });
    assert.throws(() => validateInstalledTree(root));
  });
}
test('rejects lockfile version drift', t => {
  const root = installedFixture(t);
  editJSON(join(root, 'package-lock.json'), p => { p.packages['node_modules/@grpc/grpc-js'].version = '1.14.5'; });
  assert.throws(() => validateInstalledTree(root));
});
test('rejects undeclared nested installed resolution', t => {
  const root = installedFixture(t);
  const file = join(root, 'node_modules/@firebase/firestore/node_modules/@grpc/grpc-js/package.json');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify({ name: '@grpc/grpc-js', version: '1.9.16' }));
  assert.throws(() => validateInstalledTree(root));
});
test('rejects an additional incoming dependency path', t => {
  const root = installedFixture(t);
  editJSON(join(root, 'package-lock.json'), p => {
    p.packages['node_modules/other'] = { dependencies: { '@grpc/grpc-js': '~1.9.0' } };
  });
  assert.throws(() => validateInstalledTree(root));
});
test('rejects changed Firestore declared range, even if installed version stayed the same', t => {
  const root = installedFixture(t);
  editJSON(join(root, 'node_modules/@firebase/firestore/package.json'), p => { p.dependencies['@grpc/grpc-js'] = '*'; });
  assert.throws(() => validateInstalledTree(root));
});
