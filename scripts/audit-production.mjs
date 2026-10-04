import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync, realpathSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, posix, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Temporary exception pending Firebase's upstream gRPC fix (firebase/firebase-js-sdk#10412).
// PR #56: Firestore uses an outbound gRPC client; the inspected application does not
// use gRPC server credentials/getAuthContext for authentication. The package IS bundled.
// Remove this wrapper and restore npm audit --omit=dev --audit-level=high when fixed.
const advisory = 'https://github.com/advisories/GHSA-m9gg-hp2v-232j';
const versions = {
  firebase: '10.14.1',
  '@firebase/firestore': '4.7.3',
  '@firebase/firestore-compat': '0.3.38',
  '@grpc/grpc-js': '1.9.16',
};
const edges = {
  '': { firebase: '^10.14.1' },
  firebase: { '@firebase/firestore': '4.7.3', '@firebase/firestore-compat': '0.3.38' },
  '@firebase/firestore-compat': { '@firebase/firestore': '4.7.3' },
  '@firebase/firestore': { '@grpc/grpc-js': '~1.9.0' },
  '@grpc/grpc-js': {},
};
const levels = ['info', 'low', 'moderate', 'high', 'critical'];
const nodePath = name => name ? `node_modules/${name}` : '';
const readJSON = path => JSON.parse(readFileSync(path, 'utf8'));
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const equalSet = (actual, expected) => assert.deepEqual([...actual].sort(), [...expected].sort());

function resolveLocked(packages, parent, name) {
  for (let directory = parent; ; directory = posix.dirname(directory)) {
    const candidate = posix.join(directory, 'node_modules', name);
    if (packages[candidate]) return candidate;
    if (!directory || directory === '.') return undefined;
  }
}

export function validateInstalledTree(root) {
  root = realpathSync(root);
  const lock = readJSON(join(root, 'package-lock.json'));
  assert.equal(lock.lockfileVersion, 3, 'Unsupported lockfile format');
  assert.ok(object(lock.packages), 'Missing locked dependency tree');
  const incoming = new Set();
  const expectedIncoming = new Set();

  for (const [name, version] of Object.entries(versions)) {
    const location = nodePath(name);
    const installed = readJSON(join(root, location, 'package.json'));
    assert.equal(installed.name, name, `Unexpected installed identity: ${location}`);
    assert.equal(installed.version, version, `Review exception: ${name} version changed`);
    assert.equal(lock.packages[location]?.version, version, `Unexpected locked ${name}`);
    assert.ok(!lock.packages[location].link, 'Linked exception packages are not supported');
    assert.equal(realpathSync(join(root, location)), join(realpathSync(root), location));
  }

  for (const [parent, children] of Object.entries(edges)) {
    const location = nodePath(parent);
    const manifest = readJSON(join(root, location, 'package.json'));
    const locked = lock.packages[location];
    for (const source of [manifest, locked]) {
      const relevant = Object.fromEntries(Object.entries(source.dependencies ?? {})
        .filter(([name]) => Object.hasOwn(versions, name)));
      assert.deepEqual(relevant, children, `Unexpected dependencies of ${parent || 'root'}`);
    }
    const require = createRequire(join(root, location, 'package.json'));
    for (const child of Object.keys(children)) {
      assert.equal(require.resolve(`${child}/package.json`), join(root, nodePath(child), 'package.json'),
        `Unexpected installed path: ${parent} -> ${child}`);
      expectedIncoming.add(`${location} -> ${nodePath(child)}`);
    }
  }

  // Inspect all lockfile dependency edges, not just npm's aggregated advisory names.
  // Other (patched) gRPC copies are allowed, but never share this exception.
  for (const [location, pkg] of Object.entries(lock.packages)) {
    for (const [name, version] of Object.entries(versions)) {
      if (location.endsWith(`/node_modules/${name}`) &&
          (name !== '@grpc/grpc-js' || pkg.version === version)) {
        assert.fail(`Unexpected additional exception package: ${location}`);
      }
    }
    for (const field of ['dependencies', 'optionalDependencies', 'peerDependencies']) {
      for (const name of Object.keys(pkg[field] ?? {})) {
        if (!Object.hasOwn(versions, name)) continue;
        const target = resolveLocked(lock.packages, location, name);
        if (target === nodePath(name)) incoming.add(`${location} -> ${target}`);
      }
    }
  }
  equalSet(incoming, expectedIncoming);
}

export function parseAuditProcess(result) {
  assert.ok(!result.error && !result.signal, 'npm audit process failed or timed out');
  assert.ok(result.status === 0 || result.status === 1, `npm audit exited ${result.status}`);
  const report = JSON.parse(result.stdout);
  assert.ok(object(report) && !report.error, 'npm audit registry/command error');
  assert.equal(report.auditReportVersion, 2, 'Unsupported npm audit format');
  assert.ok(object(report.vulnerabilities), 'Missing audit findings');
  assert.ok(object(report.metadata?.vulnerabilities), 'Missing audit summary');
  assert.equal(result.status, Object.keys(report.vulnerabilities).length ? 1 : 0,
    'Unexpected npm audit exit status for findings');
  return report;
}

export function validateAudit(report) {
  const findings = report.vulnerabilities;
  const counts = Object.fromEntries(levels.map(level => [level, 0]));
  const memo = new Map();
  function causes(name, visiting = new Set()) {
    assert.ok(!visiting.has(name), `Cyclic audit cause: ${name}`);
    if (memo.has(name)) return memo.get(name);
    const finding = findings[name];
    assert.ok(object(finding) && finding.name === name, `Invalid audit finding: ${name}`);
    assert.ok(levels.includes(finding.severity), `Unknown severity: ${name}`);
    assert.ok(Array.isArray(finding.via) && finding.via.length, `Missing causes: ${name}`);
    assert.ok(Array.isArray(finding.nodes) && finding.nodes.length, `Missing paths: ${name}`);
    assert.ok(finding.nodes.every(path => typeof path === 'string' &&
      path.startsWith('node_modules/') && !path.split('/').includes('..')), 'Invalid audit paths');
    assert.ok(Array.isArray(finding.effects) && finding.effects.every(x => typeof x === 'string'));
    const next = new Set([...visiting, name]);
    const leaves = finding.via.flatMap(cause => {
      if (typeof cause === 'string') return causes(cause, next);
      assert.ok(object(cause) && cause.name === name && cause.dependency === name &&
        Number.isInteger(cause.source) && typeof cause.url === 'string' &&
        typeof cause.range === 'string' && cause.range.length &&
        typeof cause.title === 'string' && levels.includes(cause.severity),
      `Unexpected advisory structure: ${name}`);
      return [cause];
    });
    assert.equal(levels.indexOf(finding.severity),
      Math.max(...leaves.map(leaf => levels.indexOf(leaf.severity))), `Inconsistent severity: ${name}`);
    memo.set(name, leaves);
    return leaves;
  }

  for (const [name, finding] of Object.entries(findings)) {
    const leaves = causes(name);
    counts[finding.severity]++;
    for (const leaf of leaves.filter(x => levels.indexOf(x.severity) >= 3)) {
      assert.ok(leaf.url === advisory && leaf.name === '@grpc/grpc-js' &&
        leaf.severity === 'high' && leaf.range === '<1.13.6',
      `Unexcepted ${leaf.severity} advisory: ${leaf.url}`);
    }
    if (levels.indexOf(finding.severity) < 3) continue;
    assert.ok(Object.hasOwn(versions, name), `Unexpected affected parent: ${name}`);
    equalSet(finding.nodes, [nodePath(name)]);
    const expectedParents = Object.entries(edges).filter(([, children]) => Object.hasOwn(children, name))
      .map(([parent]) => parent).filter(Boolean);
    equalSet(finding.effects, expectedParents);
    if (name !== '@grpc/grpc-js') equalSet(finding.via, Object.keys(edges[name]));
    else {
      assert.ok(finding.via.every(object), 'Unexpected gRPC advisory reference');
      assert.equal(finding.via.filter(leaf => leaf.severity === 'high').length, 1,
        'Expected exactly one underlying high gRPC advisory');
    }
  }
  for (const name of Object.keys(versions)) {
    assert.equal(findings[name]?.severity, 'high', `Review/remove exception: expected finding missing: ${name}`);
  }
  for (const level of levels) assert.equal(report.metadata.vulnerabilities[level], counts[level], 'Inconsistent audit totals');
  assert.equal(report.metadata.vulnerabilities.total, Object.keys(findings).length, 'Inconsistent audit total');
  return counts;
}

export function runAudit(root) {
  validateInstalledTree(root);
  const result = spawnSync('npm', ['audit', '--omit=dev', '--json'], {
    cwd: root, encoding: 'utf8', timeout: 300_000, maxBuffer: 8 * 1024 * 1024,
  });
  if (result.stderr) process.stderr.write(result.stderr);
  const report = parseAuditProcess(result);
  // Preserve the complete report, including informational moderate/low advisories.
  console.log(JSON.stringify(report, null, 2));
  const counts = validateAudit(report);
  console.log(`PASS WITH TEMPORARY EXCEPTION: GHSA-m9gg-hp2v-232j (one advisory, ${counts.high} affected package nodes).`);
  console.log(`Informational: ${counts.moderate} moderate, ${counts.low} low. This is NOT a zero-vulnerability audit.`);
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  try {
    runAudit(resolve(dirname(fileURLToPath(import.meta.url)), '..'));
  } catch (error) {
    console.error(`DEPENDENCY AUDIT FAILED: ${error.message}`);
    process.exitCode = 1;
  }
}
