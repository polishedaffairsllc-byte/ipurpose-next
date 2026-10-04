import { MERGED_PHRASES, PURPOSE_QUESTIONS, SIGNALS, SIGNAL_PHRASES, purposeCopy, type PurposeSignal, type QuestionId } from './purposeCheckCopy';
export const PURPOSE_CHECK_VERSION = 1;
export type PurposeAnswers = Record<QuestionId, string[]>;
export interface PurposeProfile {
    purposeCheckVersion: number;
    answers: PurposeAnswers;
    signals: {
        signal: PurposeSignal;
        points: number;
    }[];
    audience: string[];
    impact: {
        id: string;
        label: string;
        phrase: string;
    };
    direction: string;
    completedAt: string;
    updatedAt: string;
    reflectionSaved?: true;
    reflection?: string;
}
export interface PurposePayload {
    purposeCheckVersion: number;
    answers: PurposeAnswers;
    saveReflection?: true;
    reflection?: string;
}
export const emptyPurposeAnswers = (): PurposeAnswers => ({ q1: [], q2: [], q3: [], q4: [], q5: [], q6: [] });
export function validatePurposeAnswers(value: unknown): PurposeAnswers {
    if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length !== 6)
        throw new Error(purposeCopy.invalid);
    const input = value as Record<string, unknown>;
    const answers = emptyPurposeAnswers();
    for (const q of PURPOSE_QUESTIONS) {
        const selected = input[q.id];
        if (!Array.isArray(selected) || !selected.length || selected.length > q.max || new Set(selected).size !== selected.length || selected.some(id => !q.options.some(o => o.id === id)))
            throw new Error(purposeCopy.invalid);
        // Canonical option order makes taps/order and retries equivalent.
        answers[q.id] = q.options.filter(o => selected.includes(o.id)).map(o => o.id);
    }
    return answers;
}
export function rankPurposeSignals(answers: PurposeAnswers) {
    const contributions = PURPOSE_QUESTIONS.map(q => Object.fromEntries(SIGNALS.map(s => [s, q.options.filter(o => answers[q.id].includes(o.id) && o.signals.includes(s)).length])) as Record<PurposeSignal, number>);
    const scores = SIGNALS.map(signal => ({ signal, points: contributions.reduce((sum, c) => sum + c[signal], 0) }));
    return scores.filter(s => s.points > 0).sort((a, b) => {
        if (a.points !== b.points)
            return b.points - a.points;
        for (const index of [2, 4, 5, 1, 0]) {
            const delta = contributions[index][b.signal] - contributions[index][a.signal];
            if (delta)
                return delta;
        }
        return SIGNALS.indexOf(a.signal) - SIGNALS.indexOf(b.signal);
    });
}
export function purposeSignalPhrase(signals: PurposeSignal[], pairing = false): string {
    const [first, second] = signals;
    if (!first)
        return '';
    if (!second)
        return SIGNAL_PHRASES[first];
    const merged = MERGED_PHRASES.find(([a, b]) => signals.slice(0, 2).includes(a) && signals.slice(0, 2).includes(b));
    if (merged)
        return merged[2];
    const joined = `${SIGNAL_PHRASES[first]} and ${SIGNAL_PHRASES[second]}`;
    return !pairing && joined.split(/\s+/).length <= 14 ? joined : SIGNAL_PHRASES[first];
}
export function buildPurposePayload(answers: PurposeAnswers, reflection: string, saveReflection: boolean): PurposePayload {
    return { purposeCheckVersion: PURPOSE_CHECK_VERSION, answers, ...(saveReflection && reflection.trim() ? { saveReflection: true as const, reflection: reflection.trim() } : {}) };
}
export function generatePurposeProfile(input: unknown, now = new Date().toISOString()): PurposeProfile {
    if (!input || typeof input !== 'object' || Array.isArray(input))
        throw new Error(purposeCopy.invalid);
    const body = input as Record<string, unknown>;
    if (Object.keys(body).some(k => !['answers', 'purposeCheckVersion', 'reflection', 'saveReflection'].includes(k)))
        throw new Error(purposeCopy.invalid);
    if (body.purposeCheckVersion !== PURPOSE_CHECK_VERSION)
        throw new Error(purposeCopy.unsupported);
    const answers = validatePurposeAnswers(body.answers);
    if ((body.reflection !== undefined && (body.saveReflection !== true || typeof body.reflection !== 'string' || body.reflection.length > 2000)) || (body.saveReflection !== undefined && body.saveReflection !== true))
        throw new Error(purposeCopy.reflectionInvalid);
    const ranked = rankPurposeSignals(answers);
    const signals = ranked.slice(0, ranked.length > 2 && ranked[2].points === ranked[1].points ? 3 : 2);
    const audience = PURPOSE_QUESTIONS[3].options.filter(o => answers.q4.includes(o.id)).map(o => o.label);
    const audiencePhrase = audience.map(s => s === 'My own community' ? 'your own community' : s[0].toLowerCase() + s.slice(1)).join(' and ');
    const impactOption = PURPOSE_QUESTIONS[5].options.find(o => o.id === answers.q6[0])!;
    const impact = { id: impactOption.id, label: impactOption.label, phrase: impactOption.impactPhrase! };
    const reflection = typeof body.reflection === 'string' ? body.reflection.trim() : '';
    return { purposeCheckVersion: PURPOSE_CHECK_VERSION, answers, signals, audience, impact, direction: purposeCopy.direction(purposeSignalPhrase(signals.map(s => s.signal)), audiencePhrase, impact.phrase), completedAt: now, updatedAt: now, ...(body.saveReflection === true && reflection ? { reflectionSaved: true as const, reflection } : {}) };
}
export function readPurposeProfile(value: unknown): PurposeProfile | null {
    if (!value || typeof value !== 'object')
        return null;
    const p = value as PurposeProfile;
    try {
        if (typeof p.completedAt !== 'string' || typeof p.updatedAt !== 'string')
            return null;
        const generated = generatePurposeProfile({ purposeCheckVersion: p.purposeCheckVersion, answers: p.answers, ...(p.reflectionSaved === true && typeof p.reflection === 'string' ? { saveReflection: true, reflection: p.reflection } : {}) }, p.completedAt);
        return { ...generated, updatedAt: p.updatedAt };
    }
    catch {
        return null;
    }
}
export function purposePairing(profile: PurposeProfile, identity: string | null) {
    return identity && ['Visionary', 'Builder', 'Nurturer', 'Strategist', 'Creator'].includes(identity) ? purposeCopy.pairing(identity, purposeSignalPhrase(profile.signals.map(s => s.signal), true)) : null;
}
export function purposeCompassContext(value: unknown) {
    const p = readPurposeProfile(value);
    return p ? { signals: p.signals.map(s => s.signal), audience: p.audience, impact: p.impact.label, direction: p.direction, ...(p.reflectionSaved && p.reflection ? { reflection: p.reflection } : {}) } : undefined;
}
