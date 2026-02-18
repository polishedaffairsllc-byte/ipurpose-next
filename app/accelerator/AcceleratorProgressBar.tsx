'use client';

import { ACCELERATOR_STAGES } from "@/lib/accelerator/stages";

interface ProgressBarProps {
  currentWeek: number;
  completedWeeks: number[];
}

export default function AcceleratorProgressBar({ currentWeek, completedWeeks }: ProgressBarProps) {
  const totalCompleted = completedWeeks.length;
  const progressPercentage = (totalCompleted / 6) * 100;

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Main gradient progress bar */}
      <div className="mb-6 rounded-full overflow-hidden" style={{
        height: '12px',
        background: '#e5e7eb',
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
      }}>
        <div
          style={{
            height: '100%',
            width: `${progressPercentage}%`,
            background: totalCompleted === 0 
              ? '#e5e7eb'
              : totalCompleted === 6
              ? 'linear-gradient(90deg, #9C88FF, #FCC4B7, #d4af37, #88b04b, #d4af37, #9C88FF)'
              : totalCompleted === 1
              ? '#9C88FF'
              : totalCompleted === 2
              ? 'linear-gradient(90deg, #9C88FF, #FCC4B7)'
              : totalCompleted === 3
              ? 'linear-gradient(90deg, #9C88FF, #FCC4B7, #d4af37)'
              : totalCompleted === 4
              ? 'linear-gradient(90deg, #9C88FF, #FCC4B7, #d4af37, #88b04b)'
              : totalCompleted === 5
              ? 'linear-gradient(90deg, #9C88FF, #FCC4B7, #d4af37, #88b04b, #d4af37)'
              : '#9C88FF',
            transition: 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
            borderRadius: '9999px',
            boxShadow: progressPercentage > 0 ? `0 0 12px rgba(212, 175, 55, 0.4)` : 'none',
          }}
        />
      </div>

      {/* Individual stage indicators */}
      <div className="flex items-center gap-1 sm:gap-2">
        {ACCELERATOR_STAGES.map((stage) => {
          const isCompleted = completedWeeks.includes(stage.week);
          const isCurrent = stage.week === currentWeek;
          const isLocked = stage.week > currentWeek;

          return (
            <div key={stage.week} className="flex-1 flex flex-col items-center gap-2">
              {/* Stage dot */}
              <div
                className="w-4 h-4 sm:w-5 sm:h-5 rounded-full transition-all duration-500"
                style={{
                  backgroundColor: isCompleted ? stage.color : isCurrent ? stage.color : '#d1d5db',
                  boxShadow: isCompleted 
                    ? `0 0 8px ${stage.color}, 0 0 16px ${stage.color}40`
                    : isCurrent 
                    ? `0 0 8px ${stage.color}80`
                    : 'none',
                  opacity: isLocked ? 0.4 : 1,
                }}
              />
              {/* Stage label */}
              <span
                className={`text-xs sm:text-sm font-marcellus text-center leading-tight ${
                  isLocked ? 'text-warmCharcoal/30' : 'text-warmCharcoal/60'
                }`}
              >
                {isCompleted ? '✓' : ['I', 'II', 'III', 'IV', 'V', 'VI'][stage.week - 1]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
