const assert = require('node:assert/strict');
const { test, after } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const previousKey = process.env.STRIPE_SECRET_KEY;
const previousPrice = process.env.STRIPE_PRICE_ID_6WEEK;
process.env.STRIPE_SECRET_KEY = 'sk_test_fixture_not_real';
process.env.STRIPE_PRICE_ID_6WEEK = 'price_fixture';
after(() => { if (previousKey === undefined) delete process.env.STRIPE_SECRET_KEY; else process.env.STRIPE_SECRET_KEY = previousKey; if (previousPrice === undefined) delete process.env.STRIPE_PRICE_ID_6WEEK; else process.env.STRIPE_PRICE_ID_6WEEK = previousPrice; });
function harness() {
 const state = { cookie: 'valid-cookie', invalidCookie: false, account: {email:'buyer@example.com',emailVerified:true}, session: { id:'cs_test_fixture', status:'complete', payment_status:'paid', mode:'payment', customer:'cus_fixture', payment_intent:{latest_charge:{paid:true,refunded:false,amount:199700,amount_refunded:0}}, customer_details:{email:'buyer@example.com'}, metadata:{product:'accelerator',cohort:'test'}, line_items:{data:[{price:{id:'price_fixture'}}]} }, profile: { displayName:'Existing customer', preferences:{ preserved:true } }, writes: [] };
 const auth = { verifySessionCookie: async () => { if(state.invalidCookie) throw Error('invalid'); return {uid:'user1'}; }, getUser: async () => state.account };
 const db = {
   collection: name => ({ doc: uid => ({ name, uid }) }),
   runTransaction: async operation => operation({
     get: async ref => ({ data: () => ref.name === 'users' ? state.profile : state.order }),
     set: (ref, data, options) => {
       state.writes.push({ ...ref, data, options });
       if (ref.name === 'users') state.profile = { ...state.profile, ...data };
     },
   }),
 };
 const firestore = () => db;
 firestore.FieldValue = {serverTimestamp: () => 'timestamp'};
 class Stripe { constructor() { this.checkout={sessions:{retrieve:async () => state.session}}; } }
 const mocks = {'next/headers':{cookies:async()=>({get:()=>state.cookie?{value:state.cookie}:undefined})},'next/server':{NextResponse:{json:(obj,opts={})=>Response.json(obj,opts)}},'stripe':{__esModule:true,default:Stripe},'@/lib/firebaseAdmin':{firebaseAdmin:{auth:()=>auth,firestore}}};
 const cache=new Map();
 function load(rel){ const filename=path.resolve(root,rel); if(cache.has(filename)) return cache.get(filename).exports; const m={exports:{}};cache.set(filename,m);const output=ts.transpileModule(fs.readFileSync(filename,'utf8'),{fileName:filename,compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true,target:ts.ScriptTarget.ES2022}}).outputText; const req=id=>{if(Object.hasOwn(mocks,id))return mocks[id];if(id.startsWith('.')||id.startsWith('@/')){const base=id.startsWith('@/')?path.resolve(root,id.slice(2)):path.resolve(path.dirname(filename),id);const f=['.ts','.tsx'].map(ext=>base+ext).find(fs.existsSync);if(f)return load(path.relative(root,f));}return require(id)};new Function('require','module','exports',output)(req,m,m.exports);return m.exports;}
 return {state,route:load('app/api/auth/create-user-with-entitlement/route.ts')};
}
const request = body => new Request('https://test.invalid/api/auth/create-user-with-entitlement',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
test('verified buyer receives access without replacing existing profile or trusting client product',async()=>{const {state,route}=harness();const res=await route.POST(request({sessionId:'cs_test_fixture',product:'deepen_membership',uid:'attacker'}));assert.equal(res.status,200);assert.equal(state.writes[0].uid,'user1');assert.equal(state.writes[0].data.entitlement.product,'accelerator');assert.deepEqual(state.writes[0].options,{merge:true});assert.equal(state.profile.displayName,'Existing customer');});
for(const [label,mutate,code] of [['missing login',s=>s.cookie=null,401],['invalid login',s=>s.invalidCookie=true,401],['unverified email',s=>s.account.emailVerified=false,403],['different buyer',s=>s.account.email='other@example.com',403],['unpaid order',s=>s.session.payment_status='unpaid',403],['wrong product price',s=>s.session.line_items.data[0].price.id='price_wrong',403]])test(label+' cannot grant access',async()=>{const {state,route}=harness();mutate(state);const res=await route.POST(request({sessionId:'cs_test_fixture'}));assert.equal(res.status,code);assert.equal(state.writes.length,0);});

test('a full Stripe refund or terminal local record denies direct purchase claims', async () => {
 for (const terminal of ['stripe', 'firestore']) {
  const { state, route } = harness();
  if (terminal === 'stripe') state.session.payment_intent.latest_charge.refunded = true;
  else state.order = { refundStatus: 'full_review' };
  assert.equal((await route.POST(request({ sessionId: 'cs_test_fixture' }))).status, 403);
  assert.equal(state.writes.length, 0);
 }
});
