export type NativeEvent = 'sign_up' | 'clarity_check_start' | 'clarity_check_complete';
export type EventSink = (name: NativeEvent) => void;

/** One attempt per mounted flow; resumed drafts already own their start event. */
export function createClarityAttempt(emit: EventSink) {
  let started = false;
  let completed = false;
  return {
    resume(step: number) { if (step > 0) started = true; },
    begin() {
      if (started) return;
      started = true;
      emit('clarity_check_start');
    },
    result(value: unknown) {
      if (completed || !value || typeof value !== 'object') return;
      const result = value as { scores?: { totalScore?: unknown }; resultSummary?: unknown; submissionId?: unknown };
      if (typeof result.scores?.totalScore !== 'number' || typeof result.resultSummary !== 'string' || !result.resultSummary || typeof result.submissionId !== 'string' || !result.submissionId) return;
      completed = true;
      emit('clarity_check_complete');
    },
  };
}
