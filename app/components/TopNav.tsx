import Link from "next/link";
import { canAccessTier, type EntitlementTier } from "@/app/lib/auth/entitlements";

type TopNavProps = {
  isAuthed: boolean;
  userTier?: EntitlementTier;
};

export default function TopNav({ isAuthed, userTier = "FREE" }: TopNavProps) {
  // Show full navigation; gating happens at route level
  const navLinks: { label: string; href: string }[] = [
    { label: "Overview", href: "/dashboard" },
    { label: "Soul", href: "/soul" },
    { label: "Systems", href: "/systems" },
    { label: "Compass", href: "/ai" },
    { label: "Insights", href: "/insights" },
    { label: "Labs", href: "/labs" },
    { label: "Community", href: "/community" },
  ];

  return (
    <header
      className="w-full border-b border-white/10 text-white"
      style={{ backgroundColor: '#0f1017' }}
    >
      <div className="container max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href={isAuthed ? "/dashboard" : "/"} className="text-xl font-semibold text-white">
          iPurpose
        </Link>

        <nav className="flex items-center gap-4 text-sm text-white/75">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {!isAuthed ? (
            <>
              <Link href="/login" className="text-sm text-white/75 hover:text-white">
                Login
              </Link>
              <Link
                href="/signup"
                className="px-3 py-1.5 rounded-full bg-lavenderViolet text-[#0f1017] text-sm font-semibold hover:brightness-110"
              >
                Signup
              </Link>
            </>
          ) : (
            <details className="relative">
              <summary className="cursor-pointer list-none px-3 py-1.5 rounded-full border border-white/15 text-sm text-white/85">
                Account
              </summary>
              <div className="absolute right-0 mt-2 w-40 rounded-xl border border-white/10 bg-[#111324] shadow-lg p-2 text-sm text-white/80">
                <Link href="/settings" className="block px-3 py-2 rounded-lg hover:bg-white/5">
                  Settings
                </Link>
                <Link href="/profile" className="block px-3 py-2 rounded-lg hover:bg-white/5">
                  Profile
                </Link>
                <form action="/api/auth/logout" method="post">
                  <button type="submit" className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5">
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
