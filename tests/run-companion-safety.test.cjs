// Run these provider-free TypeScript tests without initializing any cloud SDK.
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const cache = new Map();
function load(file) {
  const absolute = path.resolve(file);
  if (cache.has(absolute)) return cache.get(absolute).exports;
  // eslint-disable-next-line @next/next/no-assign-module-variable -- Test-only CommonJS export object for isolated transpilation.
  const module = { exports: {} }; cache.set(absolute, module);
  const output = ts.transpileModule(fs.readFileSync(absolute, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  new Function('require', 'module', 'exports', output)(id => id.startsWith('.') ? load(path.resolve(path.dirname(absolute), id + '.ts')) : require(id), module, module.exports);
  return module.exports;
}
load(path.join(__dirname, 'companion-safety.node.ts'));
