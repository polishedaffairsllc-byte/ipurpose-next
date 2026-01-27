import Link from "next/link";

const steps = [
  { key: "identity", label: "Identity" },
  { key: "meaning", label: "Meaning" },
  { key: "agency", label: "Agency" },
  { key: "integration", label: "Integration" },
];

export default function OrientationMapPage() {
  return (
    <div className="container max-w-5xl mx-auto px-6 md:px-10 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold text-warmCharcoal">Orientation Map</h1>
          <p className="mt-2 text-sm text-warmCharcoal/70">
            Track your progress across the Orientation learning path.
          </p>
        </div>
        <Link href="/orientation" className="text-sm text-ip-accent underline">
          Back to Overview
        </Link>
      </div>

      <div className="mt-10 grid gap-6">
        {steps.map((step, index) => (
          <div key={step.key} className="flex items-center gap-4 p-4 rounded-2xl border border-ip-border bg-white/80">
            <div className="h-10 w-10 rounded-full border border-ip-border flex items-center justify-center text-sm text-warmCharcoal">
              {index + 1}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-warmCharcoal">{step.label}</h2>
              <p className="text-xs text-warmCharcoal/70">Status will appear here once progress tracking is connected.</p>
            </div>
            <Link
              href={step.key === "integration" ? "/integration" : `/labs/${step.key}`}
              className="text-sm text-ip-accent underline"
            >
              Open
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
