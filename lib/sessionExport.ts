/**
 * Print and export utilities for daily sessions
 */

import type { DailySession } from './types/dailySession';

/**
 * Format date string (YYYY-MM-DD) to readable format
 */
export function formatSessionDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00Z');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format timestamp (ISO) to readable time
 */
export function formatTime(isoStr: string): string {
  const date = new Date(isoStr);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Generate HTML for printing a daily session
 */
export function generateSessionHTML(session: DailySession): string {
  const { date, checkIns, labEntries, reflections, isLocked } = session;
  const formattedDate = formatSessionDate(date);

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Daily Session - ${date}</title>
      <style>
        @media print {
          body { margin: 0; padding: 0; }
          .page-break { page-break-after: always; }
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          line-height: 1.6;
          color: #2c2c2c;
          background: white;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .header {
          border-bottom: 3px solid #4a5568;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        
        .session-date {
          font-size: 28px;
          font-weight: 600;
          color: #2c2c2c;
          margin: 0 0 8px 0;
        }
        
        .session-date-secondary {
          font-size: 14px;
          color: #718096;
        }
        
        .locked-badge {
          display: inline-block;
          background: #e0e7ff;
          color: #4c51bf;
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          margin-top: 12px;
        }
        
        .section {
          margin: 30px 0;
        }
        
        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #2c2c2c;
          border-left: 4px solid #4a5568;
          padding-left: 12px;
          margin: 20px 0 15px 0;
        }
        
        .entry {
          background: #f7fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 15px;
          margin: 12px 0;
        }
        
        .entry-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 10px;
        }
        
        .entry-title {
          font-weight: 600;
          color: #2c2c2c;
        }
        
        .entry-time {
          font-size: 12px;
          color: #718096;
        }
        
        .entry-content {
          margin: 10px 0;
          color: #4a5568;
          white-space: pre-wrap;
          word-break: break-word;
        }
        
        .tag {
          display: inline-block;
          background: #e0e7ff;
          color: #4c51bf;
          padding: 4px 8px;
          border-radius: 3px;
          font-size: 11px;
          margin: 2px 4px 2px 0;
        }
        
        .emotions-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        
        .emotion-tag {
          background: #fef3c7;
          color: #78350f;
          padding: 4px 8px;
          border-radius: 3px;
          font-size: 12px;
        }
        
        .score-display {
          font-size: 14px;
          color: #4a5568;
          margin: 5px 0;
        }
        
        .empty-message {
          color: #a0aec0;
          font-style: italic;
          padding: 15px;
        }
        
        .no-entries {
          color: #a0aec0;
          font-size: 14px;
          padding: 20px;
          text-align: center;
        }
        
        @media print {
          body { padding: 0; }
          .header { border-bottom: 2px solid #4a5568; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 class="session-date">${formattedDate}</h1>
        <p class="session-date-secondary">${date}</p>
        ${isLocked ? '<div class="locked-badge">✓ Session Locked</div>' : '<div class="locked-badge" style="background: #e0f2fe; color: #0369a1;">Current Day</div>'}
      </div>
  `;

  // Check-ins section
  if (checkIns.length > 0) {
    html += '<div class="section"><h2 class="section-title">Daily Check-ins</h2>';
    checkIns.forEach(checkIn => {
      html += `
        <div class="entry">
          <div class="entry-header">
            <div class="entry-title">Alignment Check</div>
            <div class="entry-time">${formatTime(checkIn.recordedAt)}</div>
          </div>
          <div class="score-display">Alignment Score: ${checkIn.alignmentScore}/10</div>
          <div style="margin: 8px 0;">
            <strong style="font-size: 12px; color: #718096; text-transform: uppercase;">Emotions</strong>
            <div class="emotions-list" style="margin-top: 6px;">
              ${checkIn.emotions.map(e => `<span class="emotion-tag">${e}</span>`).join('')}
            </div>
          </div>
          ${checkIn.need ? `<div class="entry-content" style="margin-top: 10px; border-top: 1px solid #cbd5e1; padding-top: 10px;"><strong style="display: block; margin-bottom: 4px; font-size: 12px; color: #718096; text-transform: uppercase;">What you need today:</strong> ${escapeHtml(checkIn.need)}</div>` : ''}
        </div>
      `;
    });
    html += '</div>';
  }

  // Lab entries section
  if (labEntries.length > 0) {
    html += '<div class="section"><h2 class="section-title">Lab Work</h2>';
    labEntries.forEach(lab => {
      const contentEntries = Object.entries(lab.content)
        .map(([key, val]) => `<div style="margin: 8px 0;"><strong style="font-size: 12px; color: #718096; text-transform: uppercase;">${formatLabFieldName(key)}</strong><div class="entry-content" style="margin-top: 4px;">${escapeHtml(String(val))}</div></div>`)
        .join('');
      
      html += `
        <div class="entry">
          <div class="entry-header">
            <div>
              <div class="entry-title">${lab.labName}</div>
              <span class="tag">${lab.status === 'complete' ? '✓ Complete' : 'In Progress'}</span>
            </div>
            <div class="entry-time">${formatTime(lab.recordedAt)}</div>
          </div>
          ${contentEntries}
          ${lab.notes ? `<div class="entry-content" style="margin-top: 10px; border-top: 1px solid #cbd5e1; padding-top: 10px;"><strong style="display: block; margin-bottom: 4px; font-size: 12px; color: #718096; text-transform: uppercase;">Notes</strong>${escapeHtml(lab.notes)}</div>` : ''}
        </div>
      `;
    });
    html += '</div>';
  }

  // Reflections section
  if (reflections.length > 0) {
    html += '<div class="section"><h2 class="section-title">Reflections</h2>';
    reflections.forEach(reflection => {
      const fieldEntries = Object.entries(reflection.fields)
        .map(([key, val]) => `<div style="margin: 8px 0;"><strong style="font-size: 12px; color: #718096; text-transform: uppercase;">${key}</strong><div class="entry-content" style="margin-top: 4px;">${escapeHtml(String(val))}</div></div>`)
        .join('');
      
      html += `
        <div class="entry">
          <div class="entry-header">
            <div>
              <div class="entry-title">${reflection.labName || 'Personal Reflection'}</div>
              <span class="tag">${reflection.type === 'lab-integration' ? 'Lab Integration' : 'Personal'}</span>
            </div>
            <div class="entry-time">${formatTime(reflection.recordedAt)}</div>
          </div>
          <div class="entry-content" style="margin: 10px 0; border-top: 1px solid #cbd5e1; padding-top: 10px;">${escapeHtml(reflection.summary)}</div>
          ${fieldEntries}
        </div>
      `;
    });
    html += '</div>';
  }

  // Empty state if nothing
  if (checkIns.length === 0 && labEntries.length === 0 && reflections.length === 0) {
    html += '<div class="section"><div class="no-entries">No entries for this day yet.</div></div>';
  }

  html += '</body></html>';

  return html;
}

/**
 * Generate plain text for copying to clipboard
 */
export function generateSessionPlainText(session: DailySession): string {
  const { date, checkIns, labEntries, reflections, isLocked } = session;
  const formattedDate = formatSessionDate(date);

  let text = `
═══════════════════════════════════════════════════════════════
  ${formattedDate}
  ${date}
  ${isLocked ? '✓ Session Locked' : 'Current Day'}
═══════════════════════════════════════════════════════════════

`;

  // Check-ins
  if (checkIns.length > 0) {
    text += `DAILY CHECK-INS\n${'─'.repeat(60)}\n`;
    checkIns.forEach((checkIn, idx) => {
      text += `
[${idx + 1}] Alignment Check at ${formatTime(checkIn.recordedAt)}
    Alignment Score: ${checkIn.alignmentScore}/10
    Emotions: ${checkIn.emotions.join(', ')}
${checkIn.need ? `    What you need today: ${checkIn.need}` : ''}

`;
    });
  }

  // Lab entries
  if (labEntries.length > 0) {
    text += `\nLAB WORK\n${'─'.repeat(60)}\n`;
    labEntries.forEach((lab, idx) => {
      text += `
[${idx + 1}] ${lab.labName} (${lab.status === 'complete' ? 'Complete' : 'In Progress'}) at ${formatTime(lab.recordedAt)}
`;
      Object.entries(lab.content).forEach(([key, val]) => {
        text += `    ${formatLabFieldName(key)}: ${val}\n`;
      });
      if (lab.notes) {
        text += `    Notes: ${lab.notes}\n`;
      }
    });
  }

  // Reflections
  if (reflections.length > 0) {
    text += `\nREFLECTIONS\n${'─'.repeat(60)}\n`;
    reflections.forEach((reflection, idx) => {
      text += `
[${idx + 1}] ${reflection.labName || 'Personal Reflection'} (${reflection.type === 'lab-integration' ? 'Lab Integration' : 'Personal'}) at ${formatTime(reflection.recordedAt)}
    ${reflection.summary}
`;
      Object.entries(reflection.fields).forEach(([key, val]) => {
        text += `    ${key}: ${val}\n`;
      });
    });
  }

  text += '\n';
  return text;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (navigator?.clipboard) {
    await navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}

/**
 * Open print dialog for session HTML
 */
export function printSession(session: DailySession): void {
  const html = generateSessionHTML(session);
  const printWindow = window.open('', '', 'height=800,width=1000');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }
}

/**
 * Format lab field names for display
 */
function formatLabFieldName(fieldName: string): string {
  return fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, char => char.toUpperCase())
    .trim();
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, char => map[char]);
}
