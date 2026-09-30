/** Explicit types are authoritative; infer only unambiguous pre-type records. */
export function submissionType(data: Record<string, unknown>): 'questionnaire' | 'conversation' | undefined {
  if (data.type !== undefined && data.type !== null) {
    return data.type === 'questionnaire' || data.type === 'conversation' ? data.type : undefined;
  }
  const scores = data.scores;
  const questionnaire = !!scores && typeof scores === 'object' && !Array.isArray(scores)
    && typeof (scores as Record<string, unknown>).totalScore === 'number';
  const conversation = data.messageCount !== undefined || data.conversationSummary !== undefined
    || data.conversationHistory !== undefined;
  if (questionnaire === conversation) return undefined;
  return questionnaire ? 'questionnaire' : 'conversation';
}

export function isQuestionnaire(data: Record<string, unknown>): boolean {
  const scores = data.scores;
  return submissionType(data) === 'questionnaire'
    && !!scores && typeof scores === 'object' && !Array.isArray(scores)
    && Number.isFinite((scores as Record<string, unknown>).totalScore)
    && typeof data.resultSummary === 'string';
}
