export default function ClarityCheckLoading() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header skeleton */}
      <div
        className="w-full border-b border-white/20 p-4 sm:p-6"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
      >
        <div className="h-10 w-24 rounded-full bg-white/10 animate-pulse" />
      </div>

      {/* Hero loading state */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4 bg-warmCharcoal/90">
        {/* Progress bar */}
        <div className="w-48 h-1 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full animate-[loadSlide_1.2s_ease-in-out_infinite]"
            style={{ background: 'linear-gradient(90deg, transparent, #9C88FF, transparent)', width: '40%' }}
          />
        </div>
        <p
          className="font-marcellus text-sm tracking-wide"
          style={{ color: 'rgba(255,255,255,0.6)' }}
        >
          Loading your Clarity Check…
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
