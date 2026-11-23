export const PURPOSE_BRIDGE_COPY = [
  'Your answers are clues about what matters, what feels out of alignment, and what keeps asking for your attention.',
  "You don’t have to invent your purpose. Begin by noticing the patterns already present in your life.",
  'Purpose is a direction, not one perfect answer. It gets clearer as you move toward it.',
] as const;

export const PURPOSE_STAGES = [
  {
    title: 'Notice the pattern',
    idea: 'Don’t try to invent your purpose. Notice it.',
    body: 'Look for what repeats. You don’t have to solve your whole life today.',
    fields: [
      { key: 'returns', label: 'What do you keep coming back to, even when nobody asks you to?' },
      { key: 'people', label: 'What do people naturally come to you for?' },
      { key: 'pattern', label: 'When did you last feel most like yourself? What pattern do you notice?' },
    ],
  },
  {
    title: 'Name what matters',
    idea: 'Your values show up in your best moments and your frustrations.',
    body: 'Notice what was present when you felt proud, and what felt ignored when you were frustrated.',
    fields: [
      { key: 'proud', label: 'When did you recently feel proud or deeply like yourself? What was present?' },
      { key: 'frustration', label: 'What recently frustrated you? What value might be underneath that reaction?' },
      { key: 'ownValue', label: 'A value in your own words (optional)' },
    ],
  },
  {
    title: 'Put your direction into words',
    idea: 'A working draft, in your own voice.',
    body: 'It can change. Let it guide real decisions. Titles and jobs may change; purpose can travel across roles.',
    fields: [
      { key: 'action', label: 'What do you want to do or bring?', placeholder: 'The action' },
      { key: 'who', label: 'Who do you want to serve or support?', placeholder: 'The people' },
      { key: 'result', label: 'What do you hope becomes possible?', placeholder: 'The result' },
      { key: 'mission', label: 'Your working purpose statement', placeholder: 'I exist to [action] for [who] so that [result], guided by [values].' },
    ],
  },
  {
    title: 'Separate purpose from goals',
    idea: 'Purpose is the direction. Goals are the steps.',
    body: 'Test one goal against what matters to you and the season you’re in.',
    fields: [
      { key: 'goal', label: 'What goal are you considering?' },
      { key: 'goalFit', label: 'Does this connect to something you actually care about?' },
      { key: 'privateGoal', label: 'Would you still want this if nobody knew you achieved it?' },
      { key: 'season', label: 'Does this fit your current season? What might need to change?' },
    ],
  },
  {
    title: 'Reflect without getting stuck',
    idea: 'Notice what you need. Then choose one small move.',
    body: 'A few honest observations are enough to begin.',
    fields: [
      { key: 'energy', label: 'What gave you energy this week? What drained it?' },
      { key: 'expectations', label: 'Are you doing anything mainly because someone else expects it of you? If so, what?' },
      { key: 'reflectionAction', label: 'What would you do if you trusted yourself a little more? Name one small action.' },
    ],
  },
  {
    title: 'Try a small experiment',
    idea: 'Clarity can come through movement.',
    body: 'Talk with someone you admire, volunteer once, teach one person, try a small project, or spend an hour exploring an interest.',
    fields: [
      { key: 'experiment', label: 'What small experiment will you try?' },
      { key: 'experimentLearning', label: 'After you try it: what did you learn? (You can return later.)' },
    ],
  },
  {
    title: 'Turn purpose into action',
    idea: 'Choose one real next step.',
    body: 'Bring purpose into the life you already have, explore a career shift, begin a project, help a person or community, or build something of your own.',
    fields: [
      { key: 'nextAction', label: 'What is your next aligned step?' },
      { key: 'support', label: 'When will you begin? What simple support would make it repeatable?' },
    ],
  },
] as const;

export const VALUE_WORDS = ['Care', 'Creativity', 'Freedom', 'Integrity', 'Learning', 'Connection', 'Justice', 'Stability'] as const;
export const ACTION_PATHS = ['Bring purpose into my life', 'Explore a career shift', 'Begin a personal project', 'Help a person or community', 'Build something of my own'] as const;
export const EXPERIMENT_SIGNALS = ['Energized me', 'Drained me', 'A mix of both', 'Haven’t tried it yet'] as const;
export const PURPOSE_FIELD_KEYS = [...PURPOSE_STAGES.flatMap((stage) => stage.fields.map((field) => field.key)), 'experimentSignal', 'keepGoing', 'actionPath'];

export interface PurposeProgress {
  version: 1;
  startedStages: number[];
  completedStages: number[];
  currentStage: number;
  values: string[];
  reflections: Record<string, string>;
}

export function emptyPurposeProgress(): PurposeProgress {
  return { version: 1, startedStages: [], completedStages: [], currentStage: 0, values: [], reflections: {} };
}

export function parsePurposeProgress(raw: string | null): PurposeProgress {
  if (!raw) return emptyPurposeProgress();
  const data = JSON.parse(raw);
  // Refuse unknown/corrupt records rather than silently overwriting saved work.
  if (!data || data.version !== 1 || !Array.isArray(data.startedStages) || !Array.isArray(data.completedStages)
    || !Number.isInteger(data.currentStage) || data.currentStage < 0 || data.currentStage >= PURPOSE_STAGES.length
    || !Array.isArray(data.values) || !data.reflections || typeof data.reflections !== 'object' || Array.isArray(data.reflections)) {
    throw new Error('Saved Purpose progress could not be read.');
  }
  const validStage = (value: unknown) => Number.isInteger(value) && Number(value) >= 0 && Number(value) < PURPOSE_STAGES.length;
  if (![...data.startedStages, ...data.completedStages].every(validStage)
    || !data.values.every((value: unknown) => typeof value === 'string')
    || !Object.values(data.reflections).every((value) => typeof value === 'string')) throw new Error('Saved Purpose progress could not be read.');
  return {
    version: 1,
    startedStages: [...new Set<number>(data.startedStages)],
    completedStages: [...new Set<number>(data.completedStages)],
    currentStage: data.currentStage,
    values: data.values.slice(0, 3).map((value: string) => value.slice(0, 60)),
    reflections: Object.fromEntries(Object.entries(data.reflections).filter(([key]) => PURPOSE_FIELD_KEYS.includes(key)).map(([key, value]) => [key, (value as string).slice(0, 1200)])),
  };
}

export function draftPurposeStatement(progress: PurposeProgress) {
  const { action, who, result, ownValue } = progress.reflections;
  const values = [...progress.values, ownValue?.trim()].filter(Boolean).join(', ');
  if (!action?.trim() || !who?.trim() || !result?.trim() || !values) return null;
  return `I exist to ${action.trim()} for ${who.trim()} so that ${result.trim()}, guided by ${values}.`;
}
