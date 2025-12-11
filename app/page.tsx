import Link from "next/link";

const sections = [
  {
    id: "soul",
    label: "Soul Alignment",
    description: "Begin your inner alignment journey and uncover your clarity.",
    cta: "Go to Soul",
    href: "/soul",
    tone: "bg-lavenderViolet/10 text-lavenderViolet border-lavenderViolet/30",
  },
  {
    id: "systems",
    label: "Systems",
    description: "Structure your workflows, offers, and strategic foundation.",
    cta: "Go to Systems",
    href: "/systems",
    tone: "bg-indigoDeep/20 text-offWhite border-indigoDeep/50",
  },
  {
    id: "ai",
    label: "AI Tools",
    description: "Expand your capacity with aligned automation and powerful prompts.",
    cta: "Go to AI",
    href: "/ai",
    tone: "bg-salmonPeach/15 text-salmonPeach border-salmonPeach/40",
  },
  {
    id: "dashboard",
    label: "Dashboard",
    description: "Access your home base and track your aligned progress.",
    cta: "Go to Dashboard",
    href: "/dashboard",
    tone: "bg-softGold/10 text-softGold border-softGold/40",
  },
  {
    id: "insights",
    label: "Insights",
    description: "Review reflections, trends, and alignment reports.",
    cta: "Go to Insights",
    href: "/insights",
    tone: "bg-white/5 text-white border-white/10",
  },
];

export default function HomePage() {
  return (
    <div className="container max-w-6xl py-10 md:py-14 lg:py-16">
      {/* Top pill */}
      <div className="flex justify-between items-center gap-4 mb-6">
        <span className="ipurpose-pill">
          <span className="h-1.5 w-1.5 rounded-full bg-lavenderViolet" />
          Soul → Systems → AI
        </span>
        <span className="hidden sm:inline-flex text-[11px] text-white/50 uppercase tracking-[0.2em]">
          TAILWIND TEST · NOW ACTUALLY LAVENDER
        </span>
      </div>

      {/* Hero */}
      <section className="grid md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-8 md:gap-10 items-start mb-10 md:mb-12">
        <div className="space-y-5">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-offWhite">
            Welcome to{" "}
            <span className="font-italiana text-lavenderViolet drop-shadow-[0_0_22px_rgba(156,136,255,0.6)]">
              iPurpose
            </span>
          </h1>
          <p className="text-sm md:text-base text-white/75 max-w-xl leading-relaxed">
            Align your <span className="font-semibold text-salmonPeach">Soul</span>.
            Empower your <span className="font-semibold text-softGold">Systems</span>.
            Expand through <span className="font-semibold text-lavenderViolet">AI</span>.
          </p>

          <div className="flex flex-wrap gap-3 mt-4">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-lavenderViolet px-5 py-2.5 text-sm font-semibold text-[#0f1017] shadow-soft hover:brightness-110 transition"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-offWhite bg-white/5 hover:bg-white/10 transition"
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* Side highlight card */}
        <div className="ipurpose-card border-l-2 border-lavenderViolet/70">
          <p className="text-xs font-medium tracking-[0.2em] text-white/55 uppercase">
            YOUR ALIGNMENT HUB
          </p>
          <p className="mt-3 text-sm text-white/80">
            This is your control center for building a soul-aligned business
            that's supported by systems and amplified by AI.
          </p>
          <ul className="mt-4 space-y-2 text-xs text-white/65">
            <li>• Centralize your offers, clients, and content.</li>
            <li>• Track progress in one calming dashboard.</li>
            <li>• Let AI handle the busywork, you hold the vision.</li>
          </ul>
        </div>
      </section>

      {/* Framework tiles */}
      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {sections.map((section) => (
          <div key={section.id} className="ipurpose-card">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium border ${section.tone}`}
            >
              {section.label}
            </span>
            <p className="text-xs text-white/75">{section.description}</p>
            <div className="mt-3">
              <Link
                href={section.href}
                className="inline-flex text-xs font-semibold text-lavenderViolet hover:text-[#C8BCFF] transition"
              >
                {section.cta} →
              </Link>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
