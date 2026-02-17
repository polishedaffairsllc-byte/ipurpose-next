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
      <h3 className="text-h3 font-italiana text-warmCharcoal text-center mb-6">
        Live Integration Session
      </h3>

      <div className="text-center space-y-4">
        <p className="text-body font-marcellus text-warmCharcoal/70">
          {callDay}s — Week {weekNumber} Integration
        </p>

        <div className="flex flex-col items-center gap-4 sm:gap-6">
          {callTimes.map((time, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div
                className="text-body-small px-5 py-3 rounded-xl font-marcellus text-warmCharcoal"
                style={{ backgroundColor: 'rgba(156, 136, 255, 0.1)' }}
              >
                {time}
              </div>
              {zoomLinks[i] ? (
                <a
                  href={zoomLinks[i]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-body-small inline-block px-6 py-3 rounded-full font-marcellus text-white hover:opacity-90 transition-opacity"
                  style={{ background: 'linear-gradient(to right, #4B4E6D, rgba(75, 78, 109, 0.5))' }}
                >
                  Join {time.includes('AM') ? 'AM' : 'PM'} Session
                </a>
              ) : (
                <p className="text-body-small font-marcellus text-warmCharcoal/40">
                  Zoom link coming soon
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-warmCharcoal/10">
          <p className="text-body-small font-marcellus text-warmCharcoal/40">
            Both sessions cover the same integration focus. Attend whichever fits your schedule.
          </p>
          <p className="text-body-small font-marcellus text-warmCharcoal/40 mt-2">
            Replay available after each session.
          </p>
        </div>
      </div>
    </div>
  );
}
