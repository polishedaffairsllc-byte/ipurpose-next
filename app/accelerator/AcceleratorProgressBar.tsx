'use client';

import { ACCELERATOR_STAGES } from "@/lib/accelerator/stages";

interface ProgressBarProps {
  currentWeek: number;
  completedWeeks: number[];
}

export default function AcceleratorProgressBar({ currentWeek, completedWeeks }: ProgressBarProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-1 sm:gap-2">
        {ACCELERATOR_STAGES.map((stage) => {
          const isCompleted = completedWeeks.includes(stage.week);
          const isCurrent = stage.week === currentWeek;
          const isLocked = stage.week > currentWeek;

          return (
            <div key={stage.week} className="flex-1 flex flex-col items-center gap-2">
              {/* Bar segment */}
              <div
                className="w-full h-2 sm:h-3 rounded-full transition-all duration-500"
                style={{
                  backgroundColor: isCompleted
                    ? stage.color
                    : isCurrent
                    ? `${stage.color}80`
                    : '#e5e7eb',
                  boxShadow: isCurrent ? `0 0 8px ${stage.color}60` : 'none',
                }}
              />
              {/* Week label */}
              <span
                className={`font-marcellus text-center leading-tight ${
                  isLocked ? 'text-warmCharcoal/30' : 'text-warmCharcoal/60'
                }`}
                style={{ fontSize: '12px' }}
              >
                {isCompleted ? '✓' : stage.week}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
