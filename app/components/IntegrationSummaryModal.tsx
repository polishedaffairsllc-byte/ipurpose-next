"use client";

import { useCallback } from "react";

interface JournalEntry {
  id: string;
  type: string;
  content: string;
}

interface LabResponses {
  identity: {
    selfPerceptionMap: string;
    selfConceptMap: string;
    selfNarrativeMap: string;
  };
  meaning: {
    valueStructure: string;
    coherenceStructure: string;
    directionStructure: string;
  };
  agency: {
    awarenessPatterns: string;
    decisionPatterns: string;
    actionPatterns: string;
  };
}

interface IntegrationData {
  coreTruth: string;
  primaryDirection: string;
  internalShift: string;
  sevenDayPlan: string[];
}

interface IntegrationSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userArchetype: string;
  todayDate: string;
  journalEntries: JournalEntry[];
  labResponses: LabResponses | null;
  integration: IntegrationData;
}

/**
 * Integration Summary Modal - displays integration reflection in a popup
 */
export function IntegrationSummaryModal({
  isOpen,
  onClose,
  userName,
  userArchetype,
  todayDate,
  journalEntries,
  labResponses,
  integration,
}: IntegrationSummaryModalProps) {
  const handlePrint = useCallback(() => {
    if (typeof window === 'undefined') return;

    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) return;

    const modalElement = document.querySelector('[data-print-modal]');
    if (!modalElement) return;

    const content = modalElement.cloneNode(true) as HTMLElement;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${userName}'s Integration Reflection</title>
        <link href="https://fonts.googleapis.com/css2?family=Italiana&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            line-height: 1.6;
            color: #2A2A2A;
            max-width: 800px;
            margin: 0;
            padding: 2rem;
          }
          h1 { font-size: 2rem; margin-top: 0; }
          h2 { font-size: 1.5rem; margin-top: 1.5rem; }
          h3 { font-weight: 600; margin-top: 1rem; }
          .section { margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid #e0e0e0; }
          .entry { margin-bottom: 1rem; }
          button { display: none; }
          .whitespace-pre-line { white-space: pre-line; }
        </style>
      </head>
      <body>
        ${content.innerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }, [userName]);

  const handleDownload = useCallback(() => {
    const separator = "=".repeat(60);
    let content = `Integration Reflection — ${todayDate}\n`;
    content += `${userName} the ${userArchetype || "Explorer"}\n`;
    content += `\n${separator}\n\n`;

    // Journal Entries
    if (journalEntries.length > 0) {
      content += `SESSION JOURNAL — TODAY\n\n`;
      journalEntries.forEach(entry => {
        content += `${entry.type === 'affirmation_reflection' ? 'AFFIRMATION' : 
                     entry.type === 'intention' ? 'INTENTION' :
                     entry.type === 'soul_reflection' ? 'SOUL REFLECTION' :
                     entry.type === 'free_journal' ? 'FREE JOURNAL' :
                     entry.type.toUpperCase()}:\n`;
        content += `${entry.content}\n\n`;
      });
      content += `${separator}\n\n`;
    }

    // Lab Responses
    if (labResponses) {
      content += `LAB RESPONSES\n\n`;
      
      content += `IDENTITY LAB\n`;
      if (labResponses.identity.selfPerceptionMap) {
        content += `Self-Perception Map:\n${labResponses.identity.selfPerceptionMap}\n\n`;
      }
      if (labResponses.identity.selfConceptMap) {
        content += `Self-Concept Map:\n${labResponses.identity.selfConceptMap}\n\n`;
      }
      if (labResponses.identity.selfNarrativeMap) {
        content += `Self-Narrative Map:\n${labResponses.identity.selfNarrativeMap}\n\n`;
      }

      content += `MEANING LAB\n`;
      if (labResponses.meaning.valueStructure) {
        content += `Value Structure:\n${labResponses.meaning.valueStructure}\n\n`;
      }
      if (labResponses.meaning.coherenceStructure) {
        content += `Coherence Structure:\n${labResponses.meaning.coherenceStructure}\n\n`;
      }
      if (labResponses.meaning.directionStructure) {
        content += `Direction Structure:\n${labResponses.meaning.directionStructure}\n\n`;
      }

      content += `AGENCY LAB\n`;
      if (labResponses.agency.awarenessPatterns) {
        content += `Awareness Patterns:\n${labResponses.agency.awarenessPatterns}\n\n`;
      }
      if (labResponses.agency.decisionPatterns) {
        content += `Decision Patterns:\n${labResponses.agency.decisionPatterns}\n\n`;
      }
      if (labResponses.agency.actionPatterns) {
        content += `Action Patterns:\n${labResponses.agency.actionPatterns}\n\n`;
      }
      
      content += `${separator}\n\n`;
    }

    // Emerging Themes
    content += `EMERGING THEMES\n\n`;
    content += `Core Truth (from Identity Lab):\n${integration.coreTruth}\n\n`;
    content += `Primary Direction (from Meaning Lab):\n${integration.primaryDirection}\n\n`;
    content += `Internal Shift (from Agency Lab):\n${integration.internalShift}\n\n`;
    content += `${separator}\n\n`;

    // 7-Day Plan
    content += `7-DAY ALIGNMENT PLAN\n`;
    content += `Guided by your ${userArchetype || "Explorer"} archetype\n\n`;
    integration.sevenDayPlan.forEach((day, index) => {
      content += `Day ${index + 1}: ${day}\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Integration-Reflection-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [userName, userArchetype, todayDate, journalEntries, labResponses, integration]);

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }} data-print-modal>
      <div style={{ backgroundColor: 'white', borderRadius: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', maxWidth: '56rem', width: '100%', maxHeight: '80vh', overflow: 'auto', margin: '2rem 0', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Actions - Top */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(42, 42, 42, 0.1)' }}>
          <p style={{ fontSize: '0.875rem', color: 'rgba(42, 42, 42, 0.6)', textAlign: 'center', margin: 0 }}>
            💡 <strong>Tip:</strong> Save your integration reflection to review later
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={handlePrint}
              style={{ flex: 1, padding: '0.875rem', backgroundColor: '#f0f0f0', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s ease', fontSize: '0.95rem' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e0e0e0')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
            >
              🖨 Print
            </button>
            <button
              onClick={handleDownload}
              style={{ flex: 1, padding: '0.875rem', backgroundColor: '#f0f0f0', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s ease', fontSize: '0.95rem' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e0e0e0')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
            >
              ⬇ Download
            </button>
            <button
              onClick={onClose}
              style={{ flex: 1, padding: '0.875rem', backgroundColor: '#9C88FF', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s ease', fontSize: '0.95rem' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#8577E8')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#9C88FF')}
            >
              Close
            </button>
          </div>
        </div>

        {/* Header */}
        <div style={{ borderBottom: '1px solid rgba(42, 42, 42, 0.1)', paddingBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#2A2A2A', marginBottom: '0.5rem' }}>
            ✨ Integration Reflection — {todayDate}
          </h1>
          <p style={{ color: 'rgba(42, 42, 42, 0.6)', fontSize: '50px', fontWeight: 'bold', fontFamily: 'Italiana, serif' }}>
            {userName} the {userArchetype || "Explorer"}
          </p>
        </div>

        {/* Session Journal */}
        <div className="section">
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#2A2A2A', marginBottom: '1rem' }}>
            Session Journal — Today
          </h2>
          {journalEntries.length === 0 ? (
            <p style={{ color: 'rgba(42, 42, 42, 0.6)', fontStyle: 'italic' }}>
              No journal entries yet today.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {journalEntries.map((entry) => {
                let entryType = "UNKNOWN";
                if (entry.type === "affirmation_reflection") entryType = "AFFIRMATION";
                else if (entry.type === "intention") entryType = "INTENTION";
                else if (entry.type === "soul_reflection") entryType = "SOUL REFLECTION";
                else if (entry.type === "free_journal") entryType = "FREE JOURNAL";
                else entryType = entry.type?.toUpperCase?.() || "";
                
                return (
                  <div key={entry.id} style={{ borderLeft: '4px solid rgba(156, 136, 255, 0.3)', paddingLeft: '1rem' }}>
                    <p style={{ fontWeight: '600', color: 'rgba(42, 42, 42, 0.6)', textTransform: 'uppercase', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                      {entryType}
                    </p>
                    <p style={{ color: '#2A2A2A', whiteSpace: 'pre-line' }}>{entry.content}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Lab Responses */}
        {labResponses && (
          <div className="section">
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#2A2A2A', marginBottom: '1rem' }}>
              Lab Responses
            </h2>
            
            {/* Identity Lab */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#2A2A2A', marginBottom: '0.75rem' }}>
                Identity Lab
              </h3>
              {labResponses.identity.selfPerceptionMap && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <p style={{ fontWeight: '500', color: 'rgba(42, 42, 42, 0.6)', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                    Self-Perception Map
                  </p>
                  <p style={{ color: 'rgba(42, 42, 42, 0.8)', whiteSpace: 'pre-line' }}>
                    {labResponses.identity.selfPerceptionMap}
                  </p>
                </div>
              )}
              {labResponses.identity.selfConceptMap && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <p style={{ fontWeight: '500', color: 'rgba(42, 42, 42, 0.6)', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                    Self-Concept Map
                  </p>
                  <p style={{ color: 'rgba(42, 42, 42, 0.8)', whiteSpace: 'pre-line' }}>
                    {labResponses.identity.selfConceptMap}
                  </p>
                </div>
              )}
              {labResponses.identity.selfNarrativeMap && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <p style={{ fontWeight: '500', color: 'rgba(42, 42, 42, 0.6)', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                    Self-Narrative Map
                  </p>
                  <p style={{ color: 'rgba(42, 42, 42, 0.8)', whiteSpace: 'pre-line' }}>
                    {labResponses.identity.selfNarrativeMap}
                  </p>
                </div>
              )}
            </div>

            {/* Meaning Lab */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#2A2A2A', marginBottom: '0.75rem' }}>
                Meaning Lab
              </h3>
              {labResponses.meaning.valueStructure && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <p style={{ fontWeight: '500', color: 'rgba(42, 42, 42, 0.6)', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                    Value Structure
                  </p>
                  <p style={{ color: 'rgba(42, 42, 42, 0.8)', whiteSpace: 'pre-line' }}>
                    {labResponses.meaning.valueStructure}
                  </p>
                </div>
              )}
              {labResponses.meaning.coherenceStructure && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <p style={{ fontWeight: '500', color: 'rgba(42, 42, 42, 0.6)', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                    Coherence Structure
                  </p>
                  <p style={{ color: 'rgba(42, 42, 42, 0.8)', whiteSpace: 'pre-line' }}>
                    {labResponses.meaning.coherenceStructure}
                  </p>
                </div>
              )}
              {labResponses.meaning.directionStructure && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <p style={{ fontWeight: '500', color: 'rgba(42, 42, 42, 0.6)', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                    Direction Structure
                  </p>
                  <p style={{ color: 'rgba(42, 42, 42, 0.8)', whiteSpace: 'pre-line' }}>
                    {labResponses.meaning.directionStructure}
                  </p>
                </div>
              )}
            </div>

            {/* Agency Lab */}
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#2A2A2A', marginBottom: '0.75rem' }}>
                Agency Lab
              </h3>
              {labResponses.agency.awarenessPatterns && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <p style={{ fontWeight: '500', color: 'rgba(42, 42, 42, 0.6)', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                    Awareness Patterns
                  </p>
                  <p style={{ color: 'rgba(42, 42, 42, 0.8)', whiteSpace: 'pre-line' }}>
                    {labResponses.agency.awarenessPatterns}
                  </p>
                </div>
              )}
              {labResponses.agency.decisionPatterns && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <p style={{ fontWeight: '500', color: 'rgba(42, 42, 42, 0.6)', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                    Decision Patterns
                  </p>
                  <p style={{ color: 'rgba(42, 42, 42, 0.8)', whiteSpace: 'pre-line' }}>
                    {labResponses.agency.decisionPatterns}
                  </p>
                </div>
              )}
              {labResponses.agency.actionPatterns && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <p style={{ fontWeight: '500', color: 'rgba(42, 42, 42, 0.6)', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                    Action Patterns
                  </p>
                  <p style={{ color: 'rgba(42, 42, 42, 0.8)', whiteSpace: 'pre-line' }}>
                    {labResponses.agency.actionPatterns}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Emerging Themes */}
        <div className="section">
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#2A2A2A', marginBottom: '1rem' }}>
            Emerging Themes
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <p style={{ fontWeight: '600', color: '#2A2A2A', marginBottom: '0.25rem' }}>
                Core Truth (from Identity Lab)
              </p>
              <p style={{ color: 'rgba(42, 42, 42, 0.8)', whiteSpace: 'pre-line' }}>
                {integration.coreTruth}
              </p>
            </div>
            <div>
              <p style={{ fontWeight: '600', color: '#2A2A2A', marginBottom: '0.25rem' }}>
                Primary Direction (from Meaning Lab)
              </p>
              <p style={{ color: 'rgba(42, 42, 42, 0.8)', whiteSpace: 'pre-line' }}>
                {integration.primaryDirection}
              </p>
            </div>
            <div>
              <p style={{ fontWeight: '600', color: '#2A2A2A', marginBottom: '0.25rem' }}>
                Internal Shift (from Agency Lab)
              </p>
              <p style={{ color: 'rgba(42, 42, 42, 0.8)', whiteSpace: 'pre-line' }}>
                {integration.internalShift}
              </p>
            </div>
          </div>
        </div>

        {/* 7-Day Alignment Plan */}
        <div className="section">
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#2A2A2A', marginBottom: '0.5rem' }}>
            7-Day Alignment Plan
          </h2>
          <p style={{ color: 'rgba(42, 42, 42, 0.6)', fontStyle: 'italic', marginBottom: '1rem' }}>
            Guided by your {userArchetype || "Explorer"} archetype
          </p>
          <ol style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {integration.sevenDayPlan.map((day, idx) => (
              <li key={idx} style={{ color: 'rgba(42, 42, 42, 0.8)' }}>
                {day}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
