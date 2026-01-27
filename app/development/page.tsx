import Link from "next/link";

export default function DevelopmentPage() {
  return (
    <div className="container max-w-4xl mx-auto px-6 md:px-10 py-12">
      <h1 className="text-4xl font-semibold text-warmCharcoal">Development Zone</h1>
      <p className="mt-3 text-sm text-warmCharcoal/70">
        This zone is locked. Complete Orientation to unlock it.
      </p>
      <Link href="/orientation" className="inline-flex mt-6 text-sm text-ip-accent underline">
        Back to Orientation
      </Link>
    </div>
  );
}
