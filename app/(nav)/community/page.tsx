import Link from "next/link";

export default function CommunityPage() {
  const discordUrl = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL;

  return (
    <div className="container max-w-5xl mx-auto px-6 md:px-10 py-10">
      <h1 className="text-4xl font-semibold text-warmCharcoal">Community</h1>
      <p className="mt-3 text-sm text-warmCharcoal/70">
        This is your space to connect, reflect, and grow alongside others on the iPurpose path.
      </p>

      <div className="mt-8 grid gap-4">
        <div className="rounded-2xl border border-ip-border bg-white/80 p-5">
          <h2 className="text-lg font-semibold text-warmCharcoal">Join the Discord</h2>
          <p className="mt-2 text-sm text-warmCharcoal/70">
            Our community is Discord-first right now. Join the live conversations, group reflections, and
            accountability circles.
          </p>
          {discordUrl ? (
            <Link
              href={discordUrl}
              className="inline-flex mt-4 px-4 py-2 rounded-full bg-ip-accent text-white text-sm"
              target="_blank"
              rel="noreferrer"
            >
              Join Discord
            </Link>
          ) : (
            <p className="mt-4 text-xs text-warmCharcoal/60">
              Discord invite link coming soon. Add `NEXT_PUBLIC_DISCORD_INVITE_URL` to enable the CTA.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-ip-border bg-ip-surface/60 p-5">
          <h3 className="text-lg font-semibold text-warmCharcoal">Community values</h3>
          <p className="mt-2 text-sm text-warmCharcoal/70">
            Keep it kind, stay grounded, and speak from lived experience. We hold space for clarity, respect,
            and growth.
          </p>
        </div>
      </div>
    </div>
  );
}
