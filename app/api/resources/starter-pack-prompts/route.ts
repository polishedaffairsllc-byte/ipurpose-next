import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Returns canonical Starter Pack prompts (source of truth for the workbook UI).
 * This endpoint stands in for an automated PDF import. The PDF import
 * process can call this endpoint to populate UI prompts. Prompts here
 * are already cleaned to remove Jotform footer text and sample export lines.
 */
export async function GET() {
  const prompts = {
    steps: [
      {
        key: 'grounding',
        title: 'Grounding in the Present',
        intro: 'Take a moment to pause and check in with yourself. Be honest—there are no wrong answers.',
        example: {
          threeWords: 'Three words: “Tired, hopeful, curious.”',
          groundingStatement: 'Grounding statement: “Today, I choose to stay present and kind to myself.”',
        },
        fields: [
          { name: 'threeWords', label: 'Three Words', type: 'short' },
          { name: 'groundingStatement', label: 'Grounding Statement: “Today, I choose to…”', type: 'long' },
        ],
      },
      {
        key: 'vision',
        title: 'Vision Alignment',
        intro: 'Imagine the best possible version of your life. Answer from your heart, not from logic.',
        example: { boldVision: 'Bold vision: “Launching my dream business and traveling.”', top3Desires: 'Top 3 desires: “Freedom, stability, community.”' },
        fields: [
          { name: 'boldVision', label: 'Bold Vision', type: 'long' },
          { name: 'top3Desires', label: 'Top 3 Desires', type: 'list', items: 3 },
        ],
      },
      {
        key: 'selfDiscovery',
        title: 'Self-Discovery & Alignment',
        intro: 'Notice the patterns that keep showing up and where you feel out of sync. This reflection is not about judgment — it\'s about awareness, which is the first step to change.',
        example: { pattern: 'Pattern: ‘I keep overcommitting my time.’', outOfAlignment: 'Out of alignment: ‘When I\'m working late and skipping family time.’', smallStep: 'Small step: ‘Set boundaries around my workday.’', alignmentStatement: 'Alignment statement: ‘I am most myself when I am encouraging others to grow.’' },
        fields: [
          { name: 'repeatingPattern', label: 'Repeating Pattern', type: 'long' },
          { name: 'outOfAlignment', label: 'Out of Alignment', type: 'long' },
          { name: 'smallStep', label: 'Small Step', type: 'long' },
          { name: 'alignmentStatement', label: 'Alignment Statement: “I am most myself when…”', type: 'long' },
        ],
      },
      {
        key: 'coreValues',
        title: 'Core Values & Passions',
        intro: 'Your values are the compass that guide your decisions. Choose the ones that matter most, then reflect on how they show up in your daily life.',
        example: { activities: 'Activities: “Singing and writing make me feel most alive.”', advice: 'Advice: “Friends often come to me for encouragement when they feel stuck.”', values: 'Values Chosen: Creativity, Family, Integrity.' },
        fields: [
          { name: 'activitiesThatEnergize', label: 'Activities That Energize You', type: 'long' },
          { name: 'whatPeopleAskMeFor', label: 'What People Ask Me For', type: 'long' },
          { name: 'top3Values', label: 'Which 3 values do you want to guide your choices?', type: 'list', items: 3 },
          { name: 'valuesReflection', label: 'Values Reflection', type: 'long' },
        ],
      },
      {
        key: 'energyFlow',
        title: 'Energy & Flow',
        intro: 'Map out how your energy rises and falls during the day. This helps you plan with purpose.',
        instructions: 'Fill in how you want to spend your energy during each part of the day. Use the Focus column for activities that move your purpose forward, and the Rest column for practices that restore you.',
        example: { morning: { focus: 'Creative writing', rest: 'Stretch + tea' }, afternoon: { focus: 'Meetings', rest: 'Short walk' }, evening: { focus: 'Reading', rest: 'Meditation' } },
        fields: [
          { name: 'morningFocus', label: 'Morning — Focus', type: 'short' },
          { name: 'morningRest', label: 'Morning — Rest', type: 'short' },
          { name: 'afternoonFocus', label: 'Afternoon — Focus', type: 'short' },
          { name: 'afternoonRest', label: 'Afternoon — Rest', type: 'short' },
          { name: 'eveningFocus', label: 'Evening — Focus', type: 'short' },
          { name: 'eveningRest', label: 'Evening — Rest', type: 'short' },
        ],
      },
      {
        key: 'purposeAction',
        title: 'Purpose in Action',
        intro: 'Think about your impact—the people, message, and legacy that matter to you.',
        example: { purposeStatement: 'My purpose is to teach and inspire so that others believe in their potential.' },
        fields: [
          { name: 'purposeStatement', label: 'Purpose Statement: “My purpose is to… so that…”', type: 'long' },
        ],
        sanitizeIgnoreVulgar: true,
      },
      {
        key: 'integration',
        title: 'Integration & Commitment',
        intro: 'Bring it all together. This is your commitment to yourself.',
        example: { commitment: 'I commit to living in alignment with my purpose, even in small daily choices.' },
        fields: [
          { name: 'commitmentLetter', label: 'Commitment Letter', type: 'long', hint: 'Close with: I commit to living in alignment with my purpose.' },
        ],
      },
    ],
  };

  return NextResponse.json(prompts);
}
