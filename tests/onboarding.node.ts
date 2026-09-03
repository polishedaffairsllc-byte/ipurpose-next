import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  deriveOnboardingStatus,
  normalizeOnboardingDraft,
} from '../lib/ai/companionOnboarding';
import { hasExistingFocus } from '../lib/ai/profileFocus';
import { getOnboardingRedirect } from '../mobile/src/lib/onboarding';
import { getRequiredTierForAPI } from '../app/lib/auth/entitlements';

test('brand-new users are detected without client-only state', () => {
  assert.equal(deriveOnboardingStatus({}), 'new');
  assert.equal(deriveOnboardingStatus({ compassOnboarding: {} }), 'new');
});

test('legacy users with a primary archetype bypass onboarding', () => {
  assert.equal(deriveOnboardingStatus({ archetypePrimary: 'Builder' }), 'complete');
});

test('partial onboarding overrides archetype grandfathering until completion', () => {
  assert.equal(deriveOnboardingStatus({
    archetypePrimary: 'Visionary',
    compassOnboarding: { status: 'in_progress' },
  }), 'partial');
});

test('partial answers and the safe resume step are normalized', () => {
  assert.deepEqual(normalizeOnboardingDraft({
    currentStep: 9,
    clarityResponses: { 1: 5, 2: 3, 8: 4, bad: 9 },
    identityResponses: ['A', 'C', 'not-valid'],
    focusAreasDraft: ['  Launch the offer  ', '', 'ignored third'],
  }), {
    currentStep: 9,
    clarityResponses: { 1: 5, 2: 3 },
    identityResponses: ['A', 'C'],
    focusAreasDraft: ['Launch the offer', 'ignored third'],
  });
});

test('brand-new onboarding drafts omit undefined values rejected by Firestore', () => {
  const draft = normalizeOnboardingDraft({
    currentStep: 1,
    clarityResponses: {},
    identityResponses: [],
    focusAreasDraft: [],
  });

  assert.equal(Object.hasOwn(draft, 'claritySubmissionId'), false);
  assert.equal(Object.values(draft).includes(undefined), false);
  assert.equal(
    normalizeOnboardingDraft({ claritySubmissionId: 'submission-123' }).claritySubmissionId,
    'submission-123'
  );
});

test('oversized focus drafts are not persisted', () => {
  assert.deepEqual(normalizeOnboardingDraft({
    focusAreasDraft: ['a'.repeat(161), 'Keep this focus'],
  }).focusAreasDraft, ['Keep this focus']);
});

test('completion and routing cannot create an onboarding loop', () => {
  assert.equal(getOnboardingRedirect('new', 'other'), '/onboarding');
  assert.equal(getOnboardingRedirect('partial', 'other'), '/onboarding');
  assert.equal(getOnboardingRedirect('partial', 'onboarding'), null);
  assert.equal(getOnboardingRedirect('complete', 'onboarding'), '/');
  assert.equal(getOnboardingRedirect('complete', 'other'), null);
  assert.equal(getOnboardingRedirect('complete', 'clarity-check'), null);
});

test('existing focus detection protects every current profile source', () => {
  assert.equal(hasExistingFocus({}), false);
  assert.equal(hasExistingFocus({ focusAreas: ['Existing'] }), true);
  assert.equal(hasExistingFocus({ businessGoals: ['Legacy'] }), true);
  assert.equal(hasExistingFocus({
    aiPreferences: { focusAreas: ['Existing preference'] },
  }), true);
});

test('free Compass routes retain authentication while removing paid gates', async () => {
  const routeFiles = [
    'app/api/ai/profile/route.ts',
    'app/api/ai/route.ts',
    'app/api/ai/conversations/route.ts',
    'app/api/ai/conversations/[conversationId]/route.ts',
  ];

  for (const file of routeFiles) {
    const source = await readFile(new URL(`../${file}`, import.meta.url), 'utf8');
    assert.match(source, /requireAuthenticated/);
    assert.doesNotMatch(source, /requireBasicPaid/);
  }
  assert.equal(getRequiredTierForAPI('/api/ai'), 'FREE');
  assert.equal(getRequiredTierForAPI('/api/ai/profile'), 'FREE');
  assert.equal(getRequiredTierForAPI('/api/ai/conversations'), 'FREE');
  assert.equal(getRequiredTierForAPI('/api/ai/stream'), 'BASIC_PAID');
});

test('the paid Soul archetype route remains Deepening-gated', async () => {
  const source = await readFile(
    new URL('../app/api/soul/archetype/route.ts', import.meta.url),
    'utf8'
  );
  assert.match(source, /requireDeepening/);
});

test('failed completion cannot navigate Home before server confirmation', async () => {
  const source = await readFile(
    new URL('../mobile/src/components/ClarityCheckFlow.tsx', import.meta.url),
    'utf8'
  );
  const focusCall = source.indexOf('await initializeCompanionFocusAreas(focusAreas)');
  const completionCall = source.indexOf('await completeOnboarding()');
  const confirmationCheck = source.indexOf("nextState?.status !== 'complete'");
  const homeNavigation = source.indexOf("router.replace('/')");
  assert.ok(focusCall >= 0);
  assert.ok(completionCall > focusCall);
  assert.ok(confirmationCheck > completionCall);
  assert.ok(homeNavigation > confirmationCheck);
});

test('mobile offers Firebase account creation from sign in', async () => {
  const [authSource, signInSource, createAccountSource] = await Promise.all([
    readFile(new URL('../mobile/src/context/AuthContext.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../mobile/src/app/sign-in.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../mobile/src/app/create-account.tsx', import.meta.url), 'utf8'),
  ]);

  assert.match(authSource, /createUserWithEmailAndPassword/);
  assert.match(signInSource, /router\.push\('\/create-account'\)/);
  assert.match(createAccountSource, /await createAccount\(normalizedEmail, password\)/);
  assert.match(createAccountSource, /<Redirect href="\/" \/>/);
});

test('signed-out mobile users enter through the permanent welcome screen', async () => {
  const [layoutSource, welcomeSource, scaffoldSource] = await Promise.all([
    readFile(new URL('../mobile/src/app/(app)/_layout.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../mobile/src/app/welcome.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../mobile/src/components/AuthScaffold.tsx', import.meta.url), 'utf8'),
  ]);

  assert.match(layoutSource, /<Redirect href="\/welcome" \/>/);
  assert.match(welcomeSource, />Sign In<\/Text>/);
  assert.match(welcomeSource, />Create Account<\/Text>/);
  assert.match(welcomeSource, /router\.push\('\/sign-in'\)/);
  assert.match(welcomeSource, /router\.push\('\/create-account'\)/);
  assert.match(scaffoldSource, /welcome-atmosphere\.jpg/);
  assert.doesNotMatch(scaffoldSource, /useVisualEnvironment/);
});

test('mobile tab order keeps Clarity Check permanently visible', async () => {
  const [layoutSource, clarityTabSource] = await Promise.all([
    readFile(new URL('../mobile/src/app/(app)/(tabs)/_layout.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../mobile/src/app/(app)/(tabs)/clarity-check.tsx', import.meta.url), 'utf8'),
  ]);
  const home = layoutSource.indexOf('name="index"');
  const clarity = layoutSource.indexOf('name="clarity-check"');
  const compass = layoutSource.indexOf('name="mentor"');
  const account = layoutSource.indexOf('name="account"');

  assert.ok(home >= 0 && clarity > home && compass > clarity && account > compass);
  assert.match(clarityTabSource, /<ClarityCheckFlow mode="retake" \/>/);
});

test('formatted Current Focus reaches the final Compass model messages', async () => {
  const [routeSource, formatterSource] = await Promise.all([
    readFile(new URL('../app/api/ai/route.ts', import.meta.url), 'utf8'),
    readFile(new URL('../lib/ai/companionContextFormatter.ts', import.meta.url), 'utf8'),
  ]);

  assert.match(
    routeSource,
    /role: "system", content: formatCompanionContext\(journeyContext\)/
  );
  assert.match(formatterSource, /Current Focus/);
  assert.match(formatterSource, /Do not mechanically repeat/);
  assert.match(formatterSource, /ask for confirmation before any profile update/);
});

test('retakes return to Account before any onboarding focus or completion write', async () => {
  const source = await readFile(
    new URL('../mobile/src/components/ClarityCheckFlow.tsx', import.meta.url),
    'utf8'
  );
  const finish = source.slice(
    source.indexOf('async function finish()'),
    source.indexOf('async function goBack()')
  );
  const retakeGuard = finish.indexOf("if (mode === 'retake')");
  const accountNavigation = finish.indexOf("router.replace('/account')");
  const earlyReturn = finish.indexOf('return;', accountNavigation);
  const focusWrite = finish.indexOf('await initializeCompanionFocusAreas(focusAreas)');

  assert.ok(retakeGuard >= 0);
  assert.ok(accountNavigation > retakeGuard);
  assert.ok(earlyReturn > accountNavigation);
  assert.ok(focusWrite > earlyReturn);
});
