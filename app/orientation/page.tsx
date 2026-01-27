import Link from "next/link";

const zones = [
  { name: "Orientation", href: "/orientation", status: "active" },
  { name: "Interpretation", href: "/interpretation", status: "locked" },
  { name: "Development", href: "/development", status: "locked" },
  { name: "Creation", href: "/creation", status: "locked" },
  { name: "Legacy", href: "/legacy", status: "locked" },
];

export default function OrientationOverviewPage() {
  return (
    <div className="container max-w-5xl mx-auto px-6 md:px-10 py-10">
      <div className="flex flex-col gap-6">
        <h1 className="text-4xl font-semibold text-warmCharcoal">Orientation Zone</h1>
        <p className="text-sm text-warmCharcoal/70">
          Start here to establish clarity and alignment before moving forward.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {zones.map((zone) => (
          <Link
            key={zone.name}
            href={zone.href}
            className={`px-4 py-2 rounded-full border text-sm ${
              zone.status === "active"
                ? "bg-ip-accent text-white border-transparent"
                : "border-ip-border text-warmCharcoal/60"
            }`}
          >
            {zone.name}
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="p-6 rounded-2xl border border-ip-border bg-white/80 backdrop-blur-sm">
          <h2 className="text-2xl font-semibold text-warmCharcoal">Your Orientation Map</h2>
          <p className="mt-3 text-sm text-warmCharcoal/70">
            Follow the learning path to move from identity → meaning → agency → integration.
          </p>
          <Link
            href="/orientation/map"
            className="inline-flex items-center mt-5 px-4 py-2 rounded-full bg-ip-accent text-white text-sm"
          >
            Open Map
          </Link>
        </div>
        <div className="p-6 rounded-2xl border border-ip-border bg-white/80 backdrop-blur-sm">
          <h2 className="text-2xl font-semibold text-warmCharcoal">Labs</h2>
          <p className="mt-3 text-sm text-warmCharcoal/70">
            Complete the Identity, Meaning, and Agency labs to unlock integration.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/labs/identity" className="px-3 py-1 rounded-full border border-ip-border text-sm">Identity</Link>
            <Link href="/labs/meaning" className="px-3 py-1 rounded-full border border-ip-border text-sm">Meaning</Link>
            <Link href="/labs/agency" className="px-3 py-1 rounded-full border border-ip-border text-sm">Agency</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
