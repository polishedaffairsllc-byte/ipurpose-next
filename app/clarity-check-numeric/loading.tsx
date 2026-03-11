export default function ClarityCheckNumericLoading() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header skeleton */}
      <div
        className="w-full border-b border-white/20 p-4 sm:p-6"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
      >
        <div className="h-10 w-24 rounded-full bg-white/10 animate-pulse" />
      </div>

      {/* Content loading state */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
        {/* Animated progress bar */}
        <div className="w-64 h-2 rounded-full bg-lavenderViolet/10 overflow-hidden">
          <div
            className="h-full rounded-full animate-[loadSlide_1.2s_ease-in-out_infinite]"
            style={{ background: 'linear-gradient(90deg, transparent, #9C88FF, transparent)', width: '40%' }}
          />
        </div>

        {/* Skeleton question card */}
        <div className="w-full max-w-xl space-y-4 px-4">
          <div className="h-6 w-3/4 mx-auto rounded bg-lavenderViolet/10 animate-pulse" />
          <div className="space-y-3 pt-2">
            <div className="h-12 rounded-full bg-lavenderViolet/5 animate-pulse" />
            <div className="h-12 rounded-full bg-lavenderViolet/5 animate-pulse delay-75" />
            <div className="h-12 rounded-full bg-lavenderViolet/5 animate-pulse delay-150" />
          </div>
        </div>

        <p className="font-marcellus text-sm text-warmCharcoal/40 tracking-wide">
          Preparing your questions…
        </p>
      </div>

      <style>{`
        @keyframes loadSlide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
      `}</style>
    </div>
  );
}
