// Conservative Level 2A policy classifier. Pure function: no credentials,
// no deployment capability, and no authority to approve or merge a PR.
export function classifyLevel2A(files, {enabled = false, emergencyStop = true} = {}) {
  if (enabled !== true || emergencyStop !== false) return {eligible:false, reason:'controller-disabled'};
  if (!Array.isArray(files) || files.length < 1 || files.length > 2) return {eligible:false, reason:'file-count'};
  const blocked = /(auth|login|signup|account|password|session|token|secret|privacy|consent|payment|billing|stripe|firestore|database|migration|security|admin|api\/|middleware|proxy|analytics|tracking|vercel|policy|workflow|release|deploy|permission)/i;
  const unsafePatch = /(dangerouslySetInnerHTML|eval\s*\(|new\s+Function\s*\(|fetch\s*\(|localStorage|sessionStorage|document\.cookie|process\.env|NEXT_PUBLIC_|use server|server action|window\.location|XMLHttpRequest|navigator\.sendBeacon|WebSocket\s*\(|import\s*\(|require\s*\(|child_process|postMessage\s*\()/i;
  for (const f of files) {
    if (!f || !['added','modified'].includes(f.status)) return {eligible:false,reason:'change-status'};
    if (typeof f.filename !== 'string' || !/^(src\/components\/|components\/)/.test(f.filename) || blocked.test(f.filename)) return {eligible:false,reason:'protected-path'};
    if (!Number.isInteger(f.additions) || !Number.isInteger(f.changes) || f.additions > 150 || f.changes > 250 || f.additions < 0 || f.changes < 0) return {eligible:false,reason:'size'};
    if (typeof f.patch !== 'string' || !f.patch.startsWith('@@') || unsafePatch.test(f.patch)) return {eligible:false,reason:'unsafe-or-missing-patch'};
  }
  return {eligible:true,reason:'low-risk-candidate-only'};
}
