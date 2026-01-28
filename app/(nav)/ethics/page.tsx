export default function EthicsPage() {
  return (
    <div className="container max-w-4xl mx-auto px-6 md:px-10 py-10">
      <h1 className="text-4xl font-semibold text-warmCharcoal">Ethics & Community Charter</h1>
      <p className="mt-3 text-sm text-warmCharcoal/70">
        iPurpose is designed to be grounded, supportive, and human-first. These principles guide how we build
        the experience and how we show up for one another.
      </p>

      <div className="mt-8 grid gap-4">
        <div className="rounded-2xl border border-ip-border bg-white/80 p-5">
          <h2 className="text-lg font-semibold text-warmCharcoal">1. Safety and dignity first</h2>
          <p className="mt-2 text-sm text-warmCharcoal/70">
            We prioritize safety, respect, and emotional care. We do not tolerate harassment, coercion, or
            manipulation of any kind.
          </p>
        </div>
        <div className="rounded-2xl border border-ip-border bg-white/80 p-5">
          <h2 className="text-lg font-semibold text-warmCharcoal">2. Personal agency matters</h2>
          <p className="mt-2 text-sm text-warmCharcoal/70">
            You are the authority on your life. iPurpose supports clarity and reflection but never replaces
            your intuition, discernment, or lived experience.
          </p>
        </div>
        <div className="rounded-2xl border border-ip-border bg-white/80 p-5">
          <h2 className="text-lg font-semibold text-warmCharcoal">3. Honest work, ethical use</h2>
          <p className="mt-2 text-sm text-warmCharcoal/70">
            We use technology in a way that is transparent, responsible, and aligned. We avoid hype and focus
            on real, grounded outcomes.
          </p>
        </div>
        <div className="rounded-2xl border border-ip-border bg-white/80 p-5">
          <h2 className="text-lg font-semibold text-warmCharcoal">4. Community with care</h2>
          <p className="mt-2 text-sm text-warmCharcoal/70">
            We listen well, honor confidentiality, and speak from lived experience. We choose curiosity over
            judgment and collaboration over competition.
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-ip-border bg-ip-surface/60 p-5">
        <h3 className="text-lg font-semibold text-warmCharcoal">Need support?</h3>
        <p className="mt-2 text-sm text-warmCharcoal/70">
          If something feels off or you need help, reach out to our team. We take concerns seriously and will
          respond with care.
        </p>
      </div>
    </div>
  );
}
