import type { PurposeProfile } from './purposeCheck';
import { SIGNAL_PHRASES, type PurposeSignal } from './purposeCheckCopy';

// These are interpretations of the approved signals and answer wording, not
// additional archetypes. Audience, impact, and direction always come from the
// saved assessment; no second profile is persisted.
export const PURPOSE_SIGNAL_PROFILES: Record<PurposeSignal, { strengths: string[]; interpretation: string }> = {
  Belonging: { strengths: ['Helping people feel understood', 'Building connection', 'Making community feel like home'], interpretation: 'You are drawn to moments when someone feels understood or less alone. Your contribution can create room for people to feel part of a community.' },
  Teaching: { strengths: ['Explaining clearly', 'Helping understanding click', 'Supporting learning and growth'], interpretation: 'You return to helping people learn and understand. Sharing what you know can help someone see a new possibility and take their next step.' },
  Access: { strengths: ['Noticing closed doors', 'Opening opportunities', 'Helping people get started'], interpretation: 'You notice who has opportunities and who is left outside them. Opening a door or widening someone’s options can make your work feel worth doing.' },
  'Creative expression': { strengths: ['Making something new', 'Bringing ideas and stories to life', 'Valuing beauty and originality'], interpretation: 'You are drawn to making things that were not there before. Ideas, stories, beauty, and original work can carry your contribution into the world.' },
  Justice: { strengths: ['Acting with integrity', 'Noticing unfairness', 'Working toward fairer opportunity'], interpretation: 'Fairness and honesty matter to you, even when they cost something. Your direction can involve making something unfair right and sharing opportunity more fairly.' },
  Stability: { strengths: ['Creating steadiness', 'Caring about security', 'Helping people find their footing'], interpretation: 'You care about the people around you feeling steady and secure. Reliable support and spaces that feel like home can be meaningful expressions of this direction.' },
  Healing: { strengths: ['Caring during hard seasons', 'Helping people feel safe', 'Supporting people through difficulty'], interpretation: 'You keep returning to how people get through hard things. Care, understanding, and safety can help others find room to heal; this signal does not imply a clinical role or qualification.' },
  'Problem solving': { strengths: ['Untangling what is stuck', 'Noticing what is broken or inefficient', 'Making things work'], interpretation: 'You are drawn to problems that leave people stuck. Working through difficulty and making something function again can be a practical way to contribute.' },
  Independence: { strengths: ['Valuing self-direction', 'Expanding people’s choices', 'Respecting freedom to choose a path'], interpretation: 'Living on your own terms matters to you. Your contribution can help people gain the options and freedom to choose a path of their own.' },
};

export function purposeProfileDetails(profile: PurposeProfile) {
  return {
    name: profile.signals.map(({ signal }) => signal).join(' · '),
    direction: profile.direction,
    audience: profile.audience,
    impact: profile.impact.label,
    signals: profile.signals.map(({ signal }) => ({ name: signal, direction: SIGNAL_PHRASES[signal], ...PURPOSE_SIGNAL_PROFILES[signal] })),
  };
}
