'use client';

interface LiveCallPanelProps {
  callDay: string;
  callTimes: string[];
  zoomLinks: string[];
  weekNumber: number;
}

export default function LiveCallPanel({ callDay, callTimes, zoomLinks, weekNumber }: LiveCallPanelProps) {
  return (
    <div className="rounded-2xl p-6 sm:p-8 border-2 border-warmCharcoal/10" style={{ background: 'linear-gradient(135deg, rgba(75, 78, 109, 0.06), rgba(75, 78, 109, 0.02))' }}>
      <h3 className="font-italiana text-warmCharcoal text-center mb-6" style={{ fontSize: '24px' }}>
        Live Integration Session
      </h3>

      <div className="text-center space-y-4">
        <p className="font-marcellus text-warmCharcoal/70" style={{ fontSize: '16px' }}>
          {callDay}s — Week {weekNumber} Integration
        </p>

        <div className="flex flex-col items-center gap-4 sm:gap-6">
          {callTimes.map((time, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div
                className="px-5 py-3 rounded-xl font-marcellus text-warmCharcoal"
                style={{ fontSize: '16px', backgroundColor: 'rgba(156, 136, 255, 0.1)' }}
              >
                {time}
              </div>
              {zoomLinks[i] ? (
                <a
                  href={zoomLinks[i]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-3 rounded-full font-marcellus text-white hover:opacity-90 transition-opacity"
                  style={{ background: 'linear-gradient(to right, #4B4E6D, rgba(75, 78, 109, 0.5))', fontSize: '14px' }}
                >
                  Join {time.includes('AM') ? 'AM' : 'PM'} Session
                </a>
              ) : (
                <p className="font-marcellus text-warmCharcoal/40" style={{ fontSize: '14px' }}>
                  Zoom link coming soon
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-warmCharcoal/10">
          <p className="font-marcellus text-warmCharcoal/40" style={{ fontSize: '14px' }}>
            Both sessions cover the same integration focus. Attend whichever fits your schedule.
          </p>
          <p className="font-marcellus text-warmCharcoal/40 mt-2" style={{ fontSize: '14px' }}>
            Replay available after each session.
          </p>
        </div>
      </div>
    </div>
  );
}
