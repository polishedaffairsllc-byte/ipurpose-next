// Bundle actual route handlers, replacing only authentication and the Admin connection.
// All persistence uses the localhost demo emulator; no service account is loaded.
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { FieldValue, type Firestore } from 'firebase-admin/firestore';

export async function loadRoute(path: string, db: Firestore, uid: string) {
  const mocks: Record<string, string> = {
    '@/lib/firebaseAdmin': `export const firebaseAdmin = { firestore: Object.assign(() => db, { FieldValue }) };`,
    '@/lib/firebase/requireUser': `export const requireUid = async () => uid; export const requireRole = async () => {};`,
  };
  const result = await build({
    entryPoints: [resolve(path)], bundle: true, platform: 'node', format: 'cjs',
    packages: 'external', write: false,
    plugins: [{ name: 'emulator-auth', setup(builder) {
      builder.onResolve({ filter: /^@\/lib\/(firebaseAdmin|firebase\/requireUser)$/ }, args => ({ path: args.path, namespace: 'mock' }));
      builder.onLoad({ filter: /.*/, namespace: 'mock' }, args => ({ contents: mocks[args.path], loader: 'ts' }));
    } }],
  });
  const routeModule = { exports: {} };
  new Function('require', 'module', 'exports', 'db', 'uid', 'FieldValue', result.outputFiles[0].text)(
    createRequire(resolve('package.json')), routeModule, routeModule.exports, db, uid, FieldValue,
  );
  return routeModule.exports as Record<string, (request?: Request) => Promise<Response>>;
}
