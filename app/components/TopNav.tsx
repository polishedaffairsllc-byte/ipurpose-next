import Link from "next/link";
import { canAccessTier, type EntitlementTier } from "@/app/lib/auth/entitlements";

type TopNavProps = {
  isAuthed: boolean;
  userTier?: EntitlementTier;
};

export default function TopNav({ isAuthed, userTier = "FREE" }: TopNavProps) {
  const navLinks: { label: string; href: string; required: EntitlementTier }[] = [
    { label: "Overview", href: "/dashboard", required: "FREE" },
    { label: "Soul", href: "/soul", required: "DEEPENING" },
    { label: "Systems", href: "/systems", required: "DEEPENING" },
    { label: "AI Coach", href: "/ai", required: "BASIC_PAID" },
    { label: "Insights", href: "/insights", required: "DEEPENING" },
    { label: "Labs", href: "/labs", required: "FREE" },
    { label: "Community", href: "/community", required: "BASIC_PAID" },
  ];

  return (
    <header className="w-full border-b border-ip-border bg-white/80 backdrop-blur-sm">
      <div className="container max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href={isAuthed ? "/dashboard" : "/"} className="text-xl font-semibold text-warmCharcoal">
          iPurpose
        </Link>

        <nav className="flex items-center gap-4 text-sm text-warmCharcoal/80">
          {navLinks
            .filter((link) => canAccessTier(userTier, link.required))
            .map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-warmCharcoal">
                {link.label}
              </Link>
            ))}
        </nav>

        <div className="flex items-center gap-3">
          {!isAuthed ? (
            <>
              <Link href="/login" className="text-sm text-warmCharcoal/70 hover:text-warmCharcoal">
                Login
              </Link>
              <Link
                href="/signup"
                className="px-3 py-1.5 rounded-full bg-ip-accent text-white text-sm"
              >
                Signup
              </Link>
            </>
          ) : (
            <details className="relative">
              <summary className="cursor-pointer list-none px-3 py-1.5 rounded-full border border-ip-border text-sm">
                Account
              </summary>
              <div className="absolute right-0 mt-2 w-40 rounded-xl border border-ip-border bg-white shadow-sm p-2 text-sm">
                <Link href="/settings" className="block px-3 py-2 rounded-lg hover:bg-ip-surface">
                  Settings
                </Link>
                <Link href="/profile" className="block px-3 py-2 rounded-lg hover:bg-ip-surface">
                  Profile
                </Link>
                <form action="/api/auth/logout" method="post">
                  <button type="submit" className="w-full text-left px-3 py-2 rounded-lg hover:bg-ip-surface">
                    Logout
                  </button>
                </form>
              </div>
            </details>
          )}
        </div>
      </div>
    </header>
  );
}
