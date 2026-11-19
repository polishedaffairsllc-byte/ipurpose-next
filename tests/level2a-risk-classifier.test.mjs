import test from 'node:test';
import assert from 'node:assert/strict';
import {classifyLevel2A} from '../scripts/level2a-risk-classifier.mjs';

const safe = {filename:'src/components/WelcomeCard.tsx',status:'modified',additions:4,changes:6,patch:'@@ -1,1 +1,2 @@\n-hello\n+Hello'};
const allow = files => classifyLevel2A(files,{enabled:true,emergencyStop:false});
test('default-off and emergency stop reject even safe changes',()=>{
  assert.equal(classifyLevel2A([safe]).eligible,false);
  assert.equal(classifyLevel2A([safe],{enabled:true}).eligible,false);
  assert.equal(classifyLevel2A([safe],{enabled:true,emergencyStop:true}).eligible,false);
});
test('explicitly enabled safe component candidate is only classified, not approved',()=>{
  assert.deepEqual(allow([safe]),{eligible:true,reason:'low-risk-candidate-only'});
});
test('fail closed for unknown, oversized, truncated or sensitive changes',()=>{
  for (const files of [
    [], [safe,safe,safe], null,
    [{...safe,filename:'src/app/api/payments/route.ts'}],
    [{...safe,filename:'src/components/AuthCard.tsx'}],
    [{...safe,status:'removed'}],
    [{...safe,additions:151}],
    [{...safe,patch:undefined}],
    [{...safe,patch:'@@ -1 +1 @@\n+fetch(url)'}],
    [{...safe,patch:'@@ -1 +1 @@\n+dangerouslySetInnerHTML'}],
  ]) assert.equal(allow(files).eligible,false,JSON.stringify(files));
});
