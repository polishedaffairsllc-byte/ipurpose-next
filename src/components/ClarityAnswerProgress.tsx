type ClarityAnswerProgressProps = {
  answeredCount: number;
  totalCount: number;
};

export function ClarityAnswerProgress({
  answeredCount,
  totalCount,
}: ClarityAnswerProgressProps) {
  const total = Number.isFinite(totalCount) ? Math.max(0, Math.trunc(totalCount)) : 0;
  const answered = Number.isFinite(answeredCount)
    ? Math.min(total, Math.max(0, Math.trunc(answeredCount)))
    : 0;
  const progressText = `${answered} of ${total} questions answered`;
  const percentage = total > 0 ? (answered / total) * 100 : 0;

  return (
    <div className="mb-4 space-y-1.5">
      <p className="text-sm font-medium text-neutral-700">{progressText}</p>
      <div
        role="progressbar"
        aria-label="Clarity Check progress"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={answered}
        aria-valuetext={progressText}
        className="h-2 overflow-hidden rounded-full bg-neutral-200"
      >
        <div
          className="h-full rounded-full bg-neutral-600"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
