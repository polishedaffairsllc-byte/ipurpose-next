import Link from "next/link";

export default function OrientationPage() {
  return (
    <div className="container max-w-5xl mx-auto px-6 md:px-10 py-10">
      <div className="space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-warmCharcoal/60">Orientation</p>
        <h1 className="text-4xl font-semibold text-warmCharcoal">Orientation</h1>
        <p className="text-sm text-warmCharcoal/70">
          A guided development space to map Identity, Meaning, and Agency into something you can act on.
        </p>
      </div>

      <div className="mt-8 space-y-4 text-sm text-warmCharcoal/75">
        <p>
          <strong>What this is:</strong> A guided development space to map Identity, Meaning, and Agency into something you can act on.
        </p>
        <p>
          <strong>How it works:</strong> You’ll complete 3 labs (Identity → Meaning → Agency). Each lab saves progress. Your Dashboard reflects what’s complete and what’s next.
        </p>
        <p>
          <strong>What you’ll get:</strong> Clear self-language, priorities, and a simple next-step plan.
        </p>
        <p>
          <strong>Time:</strong> 20–40 minutes per lab (you can pause anytime).
        </p>
        <p>
          <strong>Start:</strong> Begin with the Identity Lab.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {[
          { title: "Identity", description: "Define who you are and what anchors you." },
          { title: "Meaning", description: "Clarify the impact and values that guide you." },
          { title: "Agency", description: "Identify the actions you’re ready to take." },
        ].map((card) => (
          <div key={card.title} className="rounded-2xl border border-ip-border bg-white/80 p-5">
            <h3 className="text-lg font-semibold text-warmCharcoal">{card.title}</h3>
            <p className="mt-2 text-sm text-warmCharcoal/70">{card.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/labs/identity" className="px-4 py-2 rounded-full bg-ip-accent text-white text-sm">
          Start Identity Lab
        </Link>
        <Link href="/learning-path" className="px-4 py-2 rounded-full border border-ip-border text-sm text-warmCharcoal/80">
          View Learning Path
        </Link>
        <Link href="/signup" className="px-4 py-2 rounded-full border border-ip-border text-sm text-warmCharcoal/80">
          Create Account
        </Link>
      </div>
    </div>
  );
}
