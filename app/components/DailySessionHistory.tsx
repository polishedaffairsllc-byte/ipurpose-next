'use client';

import { useState, useEffect } from 'react';
import DailySessionViewer from './DailySessionViewer';
import Button from './Button';
import {
  getTodayDateString,
  parseDateString,
  getDateString,
} from '@/lib/types/dailySession';
import { getAllSessions } from '@/lib/dailySessionClient';
import type { DailySession } from '@/lib/types/dailySession';

export default function DailySessionHistory() {
  const [sessions, setSessions] = useState<DailySession[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const allSessions = await getAllSessions();
        setSessions(allSessions.sort((a, b) => b.date.localeCompare(a.date)));
        
        // Select today by default if available
        const today = getTodayDateString();
        const hasToday = allSessions.some(s => s.date === today);
        if (hasToday) {
          setSelectedDate(today);
        } else if (allSessions.length > 0) {
          setSelectedDate(allSessions[0].date);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load sessions');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const selectedSession = sessions.find(s => s.date === selectedDate);

  if (loading) {
    return <div className="text-center py-8 text-warmCharcoal/60">Loading sessions...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
        {error}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12 text-warmCharcoal/60">
        <p>No daily sessions yet. Start by completing a check-in or lab work today.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Session list */}
      <div className="md:col-span-1">
        <h3 className="font-semibold text-warmCharcoal mb-3">Session History</h3>
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {sessions.map(session => {
            const date = parseDateString(session.date);
            const isToday = session.date === getTodayDateString();
            const isSelected = session.date === selectedDate;
            const hasContent =
              session.checkIns.length > 0 ||
              session.labEntries.length > 0 ||
              session.reflections.length > 0;

            return (
              <button
                key={session.date}
                onClick={() => setSelectedDate(session.date)}
                className={`w-full text-left px-3 py-2 rounded text-sm transition ${
                  isSelected
                    ? 'bg-indigoDeep text-white'
                    : 'hover:bg-warmCharcoal/5 text-warmCharcoal'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="text-xs opacity-60">
                      {isToday ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                  </div>
                  {hasContent && (
                    <span className="text-lg">
                      {session.checkIns.length > 0 ? '✓' : ''}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Session detail */}
      <div className="md:col-span-3">
        {selectedSession ? (
          <DailySessionViewer session={selectedSession} />
        ) : (
          <div className="text-center py-8 text-warmCharcoal/60">
            Select a session to view details
          </div>
        )}
      </div>
    </div>
  );
}
