export const SIGNALS = ['Belonging', 'Teaching', 'Access', 'Creative expression', 'Justice', 'Stability', 'Healing', 'Problem solving', 'Independence'] as const;
export type PurposeSignal = typeof SIGNALS[number];
export type QuestionId = 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'q6';
export interface PurposeOption {
    id: string;
    label: string;
    signals: PurposeSignal[];
    impactPhrase?: string;
}
export interface PurposeQuestion {
    id: QuestionId;
    prompt: string;
    max: number;
    options: PurposeOption[];
}
const option = (id: string, label: string, signals: PurposeSignal[] = [], impactPhrase?: string): PurposeOption => ({ id, label, signals, ...(impactPhrase ? { impactPhrase } : {}) });
export const PURPOSE_QUESTIONS: PurposeQuestion[] = [
    { id: 'q1', max: 2, prompt: 'Over the past year, which kinds of moments left you feeling more alive, not just accomplished?', options: [
            option('understood', 'Helping someone feel understood or less alone', ['Belonging', 'Healing']),
            option('explain', 'Explaining something and watching it click', ['Teaching']),
            option('door', "Opening a door for someone who didn't have one", ['Access']),
            option('make', "Making something that wasn't there before", ['Creative expression']),
            option('untangle', 'Untangling a problem that had everyone stuck', ['Problem solving']),
            option('terms', 'Doing something on my own terms', ['Independence'])
        ] },
    { id: 'q2', max: 2, prompt: 'Which of these would be hardest to give up, even for a great opportunity?', options: [
            option('fair', 'Being fair and honest, even when it costs me', ['Justice']),
            option('freedom', 'Freedom to run my own life', ['Independence']),
            option('secure', 'Knowing the people I love are secure', ['Stability']),
            option('community', 'Being part of a community where I belong', ['Belonging']),
            option('learn', 'Helping people learn and grow', ['Teaching']),
            option('beauty', 'Beauty and originality in what I make', ['Creative expression']),
            option('care', "Caring for people when they're struggling", ['Healing'])
        ] },
    { id: 'q3', max: 2, prompt: 'What subject keeps tugging at you, even when you try to move on?', options: [
            option('heal', 'How people heal and get through hard things', ['Healing']),
            option('opportunity', "Why some people get opportunities and others don't", ['Access', 'Justice']),
            option('learn', 'How to help people learn and grow', ['Teaching']),
            option('home', 'What makes a family or community feel like home', ['Belonging', 'Stability']),
            option('fix', "How to fix what's broken or inefficient", ['Problem solving']),
            option('ideas', 'New ideas, stories, or ways of making things', ['Creative expression']),
            option('free', 'What it takes for people to live free and self-directed', ['Independence'])
        ] },
    { id: 'q4', max: 2, prompt: 'If you could spend more of your time helping one group, who would it be? Choose up to two.', options: [
            option('season', 'People in a hard season'), option('young', 'Young people'), option('excluded', 'People shut out of opportunity'), option('building', 'People building something of their own'), option('families', 'Families'), option('alone', 'People who feel alone'), option('community', 'My own community')
        ] },
    { id: 'q5', max: 2, prompt: 'When the work gets hard, what makes it still feel worth it?', options: [
            option('better', 'Someone is better off because of it', ['Healing', 'Belonging']),
            option('integrity', 'I did it with integrity', ['Justice']),
            option('real', "Something real exists that didn't before", ['Creative expression']),
            option('learn', 'I helped someone learn or grow', ['Teaching']),
            option('steady', 'It made life steadier for people I care about', ['Stability']),
            option('options', 'It opened up options for someone', ['Access', 'Independence']),
            option('solve', 'I solved something hard', ['Problem solving'])
        ] },
    { id: 'q6', max: 1, prompt: 'A few years from now, I hope ____ because of me.', options: [
            option('alone', 'fewer people feel alone', ['Belonging'], 'fewer people to feel alone'),
            option('start', "more people can get started who couldn't before", ['Access'], "more people to get started who couldn't before"),
            option('heal', 'people feel safe enough to heal', ['Healing'], 'people to feel safe enough to heal'),
            option('understand', 'more people understand something that changed their lives', ['Teaching'], 'more people to understand something that changes their lives'),
            option('fair', 'something unfair got fixed', ['Justice'], 'something unfair to be made right'),
            option('beauty', 'more beauty and new ideas exist', ['Creative expression'], 'more beauty and new ideas to exist'),
            option('steady', 'the people around me feel steady and secure', ['Stability'], 'the people around you to feel steady and secure'),
            option('free', 'people feel free to choose their own path', ['Independence'], 'people to feel free to choose their own path'),
            option('works', 'something that was stuck now works', ['Problem solving'], 'something that was stuck to finally work')
        ] },
];
export const SIGNAL_PHRASES: Record<PurposeSignal, string> = {
    Belonging: 'helping people feel they belong', Teaching: 'helping people learn and understand', Access: 'opening doors that were closed', 'Creative expression': 'making something new', Justice: 'making things fairer', Stability: 'creating steadiness for the people around you', Healing: 'helping people heal', 'Problem solving': "untangling what's stuck", Independence: 'helping people live on their own terms',
};
export const MERGED_PHRASES: [
    PurposeSignal,
    PurposeSignal,
    string
][] = [
    ['Belonging', 'Healing', 'helping people feel cared for and less alone'],
    ['Access', 'Justice', 'making sure opportunity is shared fairly'],
    ['Teaching', 'Access', 'helping more people gain knowledge and access to new possibilities'],
    ['Belonging', 'Stability', 'creating spaces where people feel they belong and can find stability'],
    ['Healing', 'Stability', 'helping people feel safe enough to find their footing'],
    ['Access', 'Independence', 'opening doors so people can choose their own path'],
];
export const purposeCopy = {
    tab: 'Purpose', title: 'What keeps drawing you forward', intro: 'Explore what keeps drawing you forward and why it matters. Six questions, followed by an optional reflection.', start: 'Take the Purpose Check', next: 'Continue', back: 'Back', chooseTwo: 'Choose one or two.', chooseOne: 'Choose one.', save: 'See my Purpose Direction', saving: 'Saving your Purpose results…', loading: 'Loading your Purpose results…', retry: 'Try again', cancel: 'Cancel', retake: 'Retake the Purpose Check', drawn: 'Drawn from your answers.', reflectionLabel: 'Saved reflection', reflection: 'In your own words: what do you want your life or work to make possible for other people?', reflectionSave: 'Save this reflection so Compass can remember it.', reflectionHelper: "If you leave this unchecked, your words aren't saved.", clarity: 'Take the Clarity Check', compass: 'Talk it through in Compass', path: 'Continue to the Purpose Path', pathPending: 'Available after the Purpose Path is integrated.', delete: 'Delete my Purpose results', deleteTitle: 'Delete your Purpose results?', deleteBody: 'This removes your Purpose Check results and saved reflection. Your account, Clarity, Identity, Purpose Path, and other profile fields stay intact.', deleting: 'Deleting your Purpose results…', deleted: 'Your Purpose results have been deleted.', invalid: 'Please answer each question with the allowed choices.', reflectionInvalid: 'A reflection can only be saved with explicit permission and must be at most 2,000 characters.', unavailable: 'Purpose results could not be loaded. Please try again.', saveError: 'Purpose results could not be saved. Please try again.', deleteError: 'Purpose results could not be deleted. Please try again.', unsupported: 'This Purpose Check version is not supported.',
    progress: (step: number) => `Question ${step} of 6`,
    direction: (signal: string, audience: string, impact: string) => `What keeps drawing you forward is ${signal}, especially for ${audience}. You want your contribution to help make it possible for ${impact}.`,
    pairing: (identity: string, signal: string) => `You tend to move like a ${identity}. You seem especially drawn to ${signal}.`,
};
