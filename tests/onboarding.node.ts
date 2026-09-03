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
    claritySubmissionId: undefined,
  });
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
