import Link from "next/link";
import { canAccessTier, type EntitlementTier } from "@/app/lib/auth/entitlements";

type TopNavProps = {
  isAuthed: boolean;
  userTier?: EntitlementTier;
};

export default function TopNav({ isAuthed, userTier = "FREE" }: TopNavProps) {
  const canSeeCommunity = canAccessTier(userTier, "BASIC_PAID");

  return (
    <header className="w-full border-b border-ip-border bg-white/80 backdrop-blur-sm">
      <div className="container max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href={isAuthed ? "/dashboard" : "/"} className="text-xl font-semibold text-warmCharcoal">
          iPurpose
        </Link>

        <nav className="flex items-center gap-4 text-sm text-warmCharcoal/80">
          <Link href="/orientation" className="hover:text-warmCharcoal">Orientation</Link>
          <Link href="/learning-path" className="hover:text-warmCharcoal">Learning Path</Link>
          <Link href="/labs" className="hover:text-warmCharcoal">Labs</Link>
          <Link href="/ethics" className="hover:text-warmCharcoal">Ethics</Link>
          {canSeeCommunity ? (
            <Link href="/community" className="hover:text-warmCharcoal">Community</Link>
          ) : null}
          <Link href="/dashboard" className="hover:text-warmCharcoal">Dashboard</Link>
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
