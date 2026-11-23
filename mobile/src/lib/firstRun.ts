/**
 * Native mirror of the existing server-side first-run stage contract.
 *
 * This is onboarding state, never an OpenAI consent grant. The authenticated
 * server remains authoritative for admission, sequence and per-user writes.
 */
export type FirstRunStage = 'welcome' | 'choice' | 'intro' | 'experience' | 'complete';
export type FirstRunChoice = 'clarity' | 'purpose';
export type FirstRunState = { stage: FirstRunStage; choice?: FirstRunChoice };
export type FirstRunRoute = '/welcome-video' | '/starting-point' | '/starting-intro' | '/onboarding' | '/purpose-path' | '/';

export function firstRunRedirect(state: FirstRunState, route: string | undefined): FirstRunRoute | null {
  const openingFirstRunIntro = route === 'welcome-video' || route === 'starting-point' || route === 'starting-intro';
  if (state.stage === 'complete') {
    return openingFirstRunIntro ? '/' : null;
  }
  if (state.stage === 'experience') {
    // Continue from the intro into the chosen activity. From there, users can
    // go Home and resume the activity without marking first run complete.
    if (!openingFirstRunIntro) return null;
    return state.choice === 'clarity' ? '/onboarding' : '/purpose-path';
  }
  const target = {
    welcome: '/welcome-video',
    choice: '/starting-point',
    intro: '/starting-intro',
  } as const;
  const path = target[state.stage];
  return route === path.slice(1) || route === 'account' ? null : path;
}

export const FIRST_RUN_CHOICES: readonly {
  value: FirstRunChoice;
  title: string;
  description: string;
}[] = [
  {
    value: 'clarity',
    title: 'Clarity Check',
    description: 'Understand what feels off, unclear, or out of alignment.',
  },
  {
    value: 'purpose',
    title: 'Purpose Path',
    description: 'Explore your direction, strengths, audience, and impact.',
  },
];

export const FIRST_RUN_CHOICE_NOTE = 'Both remain available later from Home.';

/** Reject malformed, stale or cross-protocol state before native routing. */
export function parseFirstRunState(input: unknown): FirstRunState {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('Invalid first-run state. Please retry.');
  }
  const state = input as Record<string, unknown>;
  const stage = state.stage;
  const choice = state.choice;
  if (typeof stage !== 'string' || !['welcome', 'choice', 'intro', 'experience', 'complete'].includes(stage)
    || Object.keys(state).some(key => key !== 'stage' && key !== 'choice')
    || (choice !== undefined && choice !== 'clarity' && choice !== 'purpose')
    || ((stage === 'intro' || stage === 'experience') && !choice)
    || ((stage === 'welcome' || stage === 'choice') && choice !== undefined)) {
    throw new Error('Invalid first-run state. Please retry.');
  }
  return {
    stage: stage as FirstRunStage,
    ...(choice === 'clarity' || choice === 'purpose' ? { choice } : {}),
  };
}
