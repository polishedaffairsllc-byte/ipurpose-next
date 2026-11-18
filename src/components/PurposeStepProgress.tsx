type PurposeStepProgressProps = {
  currentStep: number;
  totalSteps: number;
  label?: string;
};

export function PurposeStepProgress({
  currentStep,
  totalSteps,
  label,
}: PurposeStepProgressProps) {
  const total = Number.isFinite(totalSteps) ? Math.max(1, Math.trunc(totalSteps)) : 1;
  const current = Number.isFinite(currentStep)
    ? Math.min(total, Math.max(1, Math.trunc(currentStep)))
    : 1;
  const stepText = `Step ${current} of ${total}`;

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-neutral-700">{stepText}</p>
      <div
        role="progressbar"
        aria-label={label?.trim() || "Step progress"}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current}
        aria-valuetext={stepText}
        className="h-2 overflow-hidden rounded-full bg-neutral-200"
      >
        <div
          className="h-full rounded-full bg-neutral-600"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
