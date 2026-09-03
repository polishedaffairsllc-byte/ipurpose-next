import type { OnboardingStatus } from '../types/onboarding';

export const CLARITY_QUESTIONS = [
  "I know what I'm trying to build — and why it matters to me.",
  "My choices feel more like mine than like things I'm doing to keep up, fit in, or make others comfortable.",
  "I'm open to getting outside perspective or structure — I don't need to figure this all out alone.",
  "I'm ready to put real time or energy into getting unstuck — not just thinking about it.",
  "I know something needs to change — I just can't seem to make myself do it.",
  "I'm not stuck because I lack ideas — I'm stuck because I don't have a clear next step or path.",
  "I know what my most meaningful next step is right now.",
] as const;

export const IDENTITY_QUESTIONS = [
  {
    text: "When you're facing a big decision, you usually:",
    options: {
      A: 'Picture the future you want and move toward it boldly',
      B: 'Map out a plan and work through it step by step',
      C: 'Think about who it affects and how to take care of them',
      D: 'Gather information and optimize for the best outcome',
      E: 'Look for an angle no one else has considered',
    },
  },
  {
    text: 'Your greatest strength at work is:',
    options: {
      A: "Seeing what's possible and getting others excited about it",
      B: 'Following through and building things that actually work',
      C: 'Reading people and making them feel seen and supported',
      D: 'Thinking several steps ahead and solving hard problems',
      E: 'Coming up with ideas that nobody else would think of',
    },
  },
  {
    text: "You feel most like yourself when you're:",
    options: {
      A: 'Leading a change or building something from scratch',
      B: 'Making real progress on something that matters',
      C: 'Helping someone grow or get through something hard',
      D: 'Working out a strategy or making something run better',
      E: "Making something new that didn't exist before",
    },
  },
  {
    text: 'When you start something new, your first instinct is to focus on:',
    options: {
      A: "The vision — what it's for and why it matters",
      B: 'The plan — what to do and how to build it',
      C: 'The people — who it serves and how to support them',
      D: 'The strategy — what will actually work',
      E: 'The concept — what makes it different',
    },
  },
  {
    text: "People who know you well would say you're someone who:",
    options: {
      A: 'Pushes people to think bigger and challenges the way things are',
      B: 'Gets things done and builds things that last',
      C: 'Shows up for people and makes them feel like they belong',
      D: 'Always has a plan and knows how to make things work',
      E: 'Sees what others miss and brings something fresh to the table',
    },
  },
] as const;

export type OnboardingRouteKind = 'onboarding' | 'clarity-check' | 'other';

export function getOnboardingRedirect(
  status: OnboardingStatus,
  route: OnboardingRouteKind
): '/' | '/onboarding' | null {
  if (status !== 'complete' && route !== 'onboarding') return '/onboarding';
  if (status === 'complete' && route === 'onboarding') return '/';
  return null;
}
