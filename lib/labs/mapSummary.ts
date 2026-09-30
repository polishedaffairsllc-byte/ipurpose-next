// Only these structured fields are content. Never include UID, version, or legacy text.
const FIELDS = {
  identity: [['selfPerceptionMap', 'Self-Perception'], ['selfConceptMap', 'Self-Concept'], ['selfNarrativeMap', 'Self-Narrative']],
  meaning: [['valueStructure', 'Values'], ['coherenceStructure', 'Coherence'], ['directionStructure', 'Direction']],
  agency: [['awarenessPatterns', 'Awareness'], ['decisionPatterns', 'Decision'], ['actionPatterns', 'Action']],
} as const;

export function summarizeLabMap(lab: keyof typeof FIELDS, map: Record<string, unknown> | null | undefined): string {
  return FIELDS[lab].flatMap(([field, label]) => {
    const value = map?.[field];
    return typeof value === 'string' && value.trim() ? [`${label}: ${value.trim()}`] : [];
  }).join(' | ');
}
