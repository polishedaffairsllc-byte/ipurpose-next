'use client';

import { useState } from 'react';
import Button from './Button';
import {
  generateSessionPlainText,
  copyToClipboard,
  printSession,
  formatSessionDate,
} from '@/lib/sessionExport';
import type { DailySession } from '@/lib/types/dailySession';

interface Props {
  session: DailySession;
  showLockPrompt?: boolean;
  onLock?: () => Promise<void>;
}

export default function DailySessionViewer({
  session,
  showLockPrompt = false,
  onLock,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [locking, setLocking] = useState(false);

  const handleCopyToClipboard = async () => {
    try {
      const text = generateSessionPlainText(session);
      await copyToClipboard(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handlePrint = () => {
    printSession(session);
  };

  const handleLock = async () => {
    if (!onLock) return;
    setLocking(true);
    try {
      await onLock();
    } catch (err) {
      console.error('Failed to lock session:', err);
    } finally {
      setLocking(false);
    }
  };

  const hasContent =
    session.checkIns.length > 0 ||
    session.labEntries.length > 0 ||
    session.reflections.length > 0;

  return (
    <div className="space-y-6">
      {/* Header with date and status */}
      <div className="border-b border-warmCharcoal/10 pb-6">
        <h2 className="text-2xl font-semibold text-warmCharcoal">
          {formatSessionDate(session.date)}
        </h2>
        <p className="text-sm text-warmCharcoal/60 mt-1">{session.date}</p>
        
        {session.isLocked && (
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
            <span>✓</span>
            <span>Today's session is saved.</span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleCopyToClipboard}
          variant="secondary"
          className="text-sm"
        >
          {copied ? '✓ Copied' : 'Copy to Clipboard'}
        </Button>
        <Button onClick={handlePrint} variant="secondary" className="text-sm">
          🖨 Print
        </Button>
        {showLockPrompt && !session.isLocked && onLock && (
          <Button
            onClick={handleLock}
            disabled={locking}
            className="text-sm"
          >
            {locking ? 'Saving...' : 'Finish Today'}
          </Button>
        )}
      </div>

      {/* Content sections */}
      {!hasContent ? (
        <div className="text-center py-12 text-warmCharcoal/60">
          <p className="text-sm">No entries for this day yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Check-ins */}
          {session.checkIns.length > 0 && (
            <div>
              <h3 className="font-semibold text-warmCharcoal mb-4">
                Daily Check-ins ({session.checkIns.length})
              </h3>
              <div className="space-y-3">
                {session.checkIns.map((checkIn, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-white border border-warmCharcoal/10 rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-warmCharcoal">
                        Alignment Check
                      </h4>
                      <span className="text-xs text-warmCharcoal/60">
                        {new Date(checkIn.recordedAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-warmCharcoal/80">
                      <div>
                        <strong className="text-xs text-warmCharcoal/60 uppercase">
                          Alignment Score:
                        </strong>
                        <p>{checkIn.alignmentScore}/10</p>
                      </div>
                      <div>
                        <strong className="text-xs text-warmCharcoal/60 uppercase">
                          Emotions:
                        </strong>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {checkIn.emotions.map((e, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-amber-100 text-amber-900 rounded text-xs"
                            >
                              {e}
                            </span>
                          ))}
                        </div>
                      </div>
                      {checkIn.need && (
                        <div>
                          <strong className="text-xs text-warmCharcoal/60 uppercase">
                            What you need today:
                          </strong>
                          <p className="mt-1 italic">{checkIn.need}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lab entries */}
          {session.labEntries.length > 0 && (
            <div>
              <h3 className="font-semibold text-warmCharcoal mb-4">
                Lab Work ({session.labEntries.length})
              </h3>
              <div className="space-y-3">
                {session.labEntries.map((lab, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-white border border-warmCharcoal/10 rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-warmCharcoal">
                        {lab.labName}
                      </h4>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-900 rounded">
                        {lab.status === 'complete' ? '✓ Complete' : 'In Progress'}
                      </span>
                    </div>
                    <p className="text-xs text-warmCharcoal/60 mb-3">
                      {new Date(lab.recordedAt).toLocaleTimeString()}
                    </p>
                    <div className="space-y-2 text-sm text-warmCharcoal/80">
                      {Object.entries(lab.content).map(([key, val]) => (
                        <div key={key}>
                          <strong className="text-xs text-warmCharcoal/60 uppercase">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                          </strong>
                          <p className="mt-1 whitespace-pre-wrap">{val}</p>
                        </div>
                      ))}
                      {lab.notes && (
                        <div>
                          <strong className="text-xs text-warmCharcoal/60 uppercase">
                            Notes:
                          </strong>
                          <p className="mt-1 italic">{lab.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reflections */}
          {session.reflections.length > 0 && (
            <div>
              <h3 className="font-semibold text-warmCharcoal mb-4">
                Reflections ({session.reflections.length})
              </h3>
              <div className="space-y-3">
                {session.reflections.map((reflection) => (
                  <div
                    key={reflection.id}
                    className="p-4 bg-white border border-warmCharcoal/10 rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-warmCharcoal">
                        {reflection.labName || 'Personal Reflection'}
                      </h4>
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-900 rounded">
                        {reflection.type === 'lab-integration'
                          ? 'Lab Integration'
                          : 'Personal'}
                      </span>
                    </div>
                    <p className="text-xs text-warmCharcoal/60 mb-3">
                      {new Date(reflection.recordedAt).toLocaleTimeString()}
                    </p>
                    <div className="space-y-2 text-sm text-warmCharcoal/80">
                      <p>{reflection.summary}</p>
                      {Object.entries(reflection.fields).length > 0 && (
                        <div className="mt-3 pt-3 border-t border-warmCharcoal/10">
                          {Object.entries(reflection.fields).map(
                            ([key, val]) => (
                              <div key={key} className="mb-2">
                                <strong className="text-xs text-warmCharcoal/60 uppercase">
                                  {key}:
                                </strong>
                                <p className="mt-1">{String(val)}</p>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
