import { redirect } from "next/navigation";
import Link from "next/link";
import { checkEntitlement, canAccessTier, EntitlementTier } from "@/lib/entitlementCheck";
import Card from "../components/Card";
import SectionHeading from "../components/SectionHeading";

const premiumModules = [
  {
    key: "soul",
    name: "Soul",
    description: "Alignment practices, archetypes, and daily check-ins.",
    href: "/soul",
    requiredTier: "DEEPENING" as EntitlementTier,
  },
  {
    key: "systems",
    name: "Systems",
    description: "Offer architecture, workflows, calendar, and monetization.",
    href: "/systems",
    requiredTier: "DEEPENING" as EntitlementTier,
  },
  {
    key: "reflections",
    name: "Reflections",
    description: "Reflections dashboard and read-only metrics.",
    href: "/insights",
    requiredTier: "DEEPENING" as EntitlementTier,
  },
  {
    key: "community",
    name: "Community",
    description: "Private community spaces and conversations.",
    href: "/community",
    requiredTier: "BASIC_PAID" as EntitlementTier,
  },
];

export default async function DeepenPage() {
  const entitlement = await checkEntitlement();

  // Not authenticated -> login
  if (!entitlement.uid) {
    return redirect("/login");
  }

  const { tier } = entitlement;

  return (
    <div className="container max-w-6xl mx-auto px-6 md:px-10 py-10 space-y-10">
      <div className="space-y-3">
        <p className="text-xs font-semibold tracking-[0.2em] text-warmCharcoal/60 uppercase">Premium</p>
        <h1 className="heading-hero text-warmCharcoal">Deepen</h1>
        <p className="text-lg text-warmCharcoal/75 max-w-3xl">
          One place to access premium modules. If something is locked, use Upgrade to add access.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {premiumModules.map((module) => {
          const unlocked = canAccessTier(tier, module.requiredTier);
          return (
            <Card key={module.key} className="flex flex-col justify-between h-full border border-ip-border">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-marcellus text-warmCharcoal">{module.name}</h2>
                  <span
                    className={`text-xs px-3 py-1 rounded-full border ${
                      unlocked
                        ? "border-emerald-500 text-emerald-700 bg-emerald-50"
                        : "border-amber-400 text-amber-700 bg-amber-50"
                    }`}
                  >
                    {unlocked ? "Unlocked" : "Locked"}
                  </span>
                </div>
                <p className="text-sm text-warmCharcoal/75">{module.description}</p>
                {!unlocked && (
                  <p className="text-xs text-warmCharcoal/60">
                    Requires {module.requiredTier === "DEEPENING" ? "Deepening" : "Basic"} access.
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 pt-4">
                {unlocked ? (
                  <Link
                    href={module.href}
                    className="px-4 py-2 rounded-full bg-ip-accent text-white text-sm hover:opacity-90"
                  >
                    Enter
                  </Link>
                ) : (
                  <Link
                    href="/upgrade"
                    className="px-4 py-2 rounded-full bg-warmCharcoal text-white text-sm hover:opacity-90"
                  >
                    Upgrade
                  </Link>
                )}
                {!unlocked && (
                  <span className="text-xs text-warmCharcoal/60">Preview content available inside.</span>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
