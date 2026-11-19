import test from 'node:test';
import assert from 'node:assert/strict';
import { runController, validateRelease, REQUIRED_CHECKS } from '../scripts/level2a-release-controller.mjs';

const sha = 'a'.repeat(40), base = 'b'.repeat(40), repository = 'owner/repo';
const pr = { state:'open', draft:false, mergeable:true, base:{ref:'main',sha:base,repo:{full_name:repository}},head:{sha,repo:{full_name:repository}} };
const files = [{filename:'src/components/WelcomeCard.tsx',status:'modified',additions:2,changes:3,patch:'@@ -1 +1 @@\n-old\n+new'}];
const checks = REQUIRED_CHECKS.map(name => ({name,head_sha:sha,app:{slug:'github-actions'},status:'completed',conclusion:'success'}));
const input = {pr,files,checks,repository,enabled:true,emergencyStop:false,expectedHead:sha,expectedBase:base};

test('safe candidate and seven trusted checks pass',()=>assert.equal(validateRelease(input).ok,true));
test('defaults off and emergency stop deny',()=>{
  assert.equal(validateRelease({...input,enabled:false}).ok,false);
  assert.equal(validateRelease({...input,emergencyStop:true}).ok,false);
});
test('sensitive change, stale head, stale base and failed or duplicate checks deny',()=>{
  for(const change of [
    {files:[{...files[0],filename:'src/components/LoginCard.tsx'}]},
    {expectedHead:'c'.repeat(40)}, {expectedBase:'c'.repeat(40)},
    {checks:checks.slice(1)}, {checks:[...checks,checks[0]]},
    {checks:checks.map((c,i)=>i===0?{...c,conclusion:'failure'}:c)},
    {checks:checks.map((c,i)=>i===0?{...c,app:{slug:'untrusted'}}:c)},
    {pr:{...pr,mergeable:false}},
    {pr:{...pr,head:{...pr.head,repo:{full_name:'other/fork'}}}}
  ]) assert.equal(validateRelease({...input,...change}).ok,false,JSON.stringify(change));
});
test('dry run never merges, real run uses SHA-bound squash merge',async()=>{
  const calls=[];
  const api=async(method,path,body)=>{
    calls.push({method,path,body});
    if(path==='pulls/42') return pr;
    if(path.includes('/files?')) return files;
    if(path.includes('/check-runs?')) return {check_runs:checks};
    if(path.endsWith('/merge')) return {merged:true,sha:'c'.repeat(40)};
    throw Error('unexpected request');
  };
  const common={api,repository,prNumber:42,enabled:true,emergencyStop:false};
  assert.equal((await runController({...common,execute:false})).merged,false);
  assert.equal(calls.filter(c=>c.method==='PUT').length,0);
  assert.equal((await runController({...common,execute:true})).merged,true);
  assert.deepEqual(calls.filter(c=>c.method==='PUT').map(c=>c.body.sha),[sha]);
});
test('changed PR between checks is denied before merge',async()=>{
  let count=0, merged=false;
  const api=async(method,path)=>{
    if(path==='pulls/42') return ++count===1?pr:{...pr,head:{...pr.head,sha:'d'.repeat(40)}};
    if(path.includes('/files?')) return files;
    if(path.includes('/check-runs?')) return {check_runs:checks};
    if(method==='PUT') merged=true;
  };
  await assert.rejects(runController({api,repository,prNumber:42,enabled:true,emergencyStop:false,execute:true}),/changed during verification/);
  assert.equal(merged,false);
});
