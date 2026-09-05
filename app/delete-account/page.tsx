import type { Metadata } from "next";
import PublicHeader from "../components/PublicHeader";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Delete Your Account | iPurpose",
  description:
    "Learn how to delete your iPurpose account and associated user data from the mobile app or request help from iPurpose support.",
  alternates: {
    canonical: "https://ipurposesoul.com/delete-account",
  },
  robots: "index, follow",
  openGraph: {
    title: "Delete Your Account | iPurpose",
    description:
      "Instructions for deleting an iPurpose account and requesting account deletion support.",
    type: "website",
  },
};

const supportEmail = "info@ipurposesoul.com";
const supportHref =
  "mailto:info@ipurposesoul.com?subject=iPurpose%20account%20deletion%20request";

export default function DeleteAccountPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#1B1D33] text-white">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(156,136,255,0.24),_transparent_48%),_radial-gradient(circle_at_bottom_right,_rgba(252,196,183,0.15),_transparent_42%)]"
      />

      <div className="relative">
        <PublicHeader />

        <main className="mx-auto max-w-4xl space-y-8 px-6 py-12 sm:px-10 sm:py-16 lg:px-12 lg:py-20">
          <header className="mx-auto max-w-3xl space-y-4 text-center">
            <p className="text-caption uppercase tracking-[0.2em] text-white/60">
              Account &amp; privacy
            </p>
            <h1 className="font-italiana text-4xl text-white sm:text-5xl">
              Delete your iPurpose account
            </h1>
            <p className="text-body mx-auto max-w-2xl text-white/80">
              You can permanently delete your account and associated iPurpose user data from
              inside the mobile app. This action cannot be undone.
            </p>
          </header>

          <section className="rounded-3xl border border-white/15 bg-white/10 p-6 shadow-xl backdrop-blur-sm sm:p-8">
            <p className="text-caption uppercase tracking-[0.16em] text-[#E6C87C]">
              Delete in the mobile app
            </p>
            <h2 className="mt-2 font-marcellus text-2xl text-white">The fastest option</h2>
            <ol className="mt-5 space-y-3 text-body text-white/80">
              <li><strong className="text-white">1.</strong> Sign in to the iPurpose mobile app.</li>
              <li><strong className="text-white">2.</strong> Open the <strong>Account</strong> tab and scroll to <strong>Delete account</strong>.</li>
              <li><strong className="text-white">3.</strong> Read the warning and enter your password to confirm your identity.</li>
              <li><strong className="text-white">4.</strong> Select <strong>Permanently delete account</strong>.</li>
            </ol>
          </section>

          <section className="rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-sm sm:p-8">
            <h2 className="font-marcellus text-2xl text-white">If you cannot access the app</h2>
            <p className="mt-3 text-body text-white/80">
              Email us from the address associated with your iPurpose account and ask us to
              delete your account and associated user data. We may need to verify that you own
              the account before completing the request.
            </p>
            <a
              className="mt-6 inline-flex rounded-full bg-white px-5 py-3 font-marcellus text-[#1B1D33] shadow-lg transition-opacity hover:opacity-90"
              href={supportHref}
            >
              Email {supportEmail}
            </a>
            <p className="mt-4 text-body-small text-white/60">
              Include the email address used for the account. Do not email your password,
              payment-card details, or identity documents.
            </p>
          </section>

          <div className="grid gap-6 md:grid-cols-2">
            <section className="rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-sm sm:p-8">
              <h2 className="font-marcellus text-2xl text-white">What is deleted</h2>
              <p className="mt-3 text-body text-white/75">
                Account deletion removes your sign-in account and user data associated with it,
                including your profile and preferences, Clarity Check and onboarding data,
                Current Focus, Compass conversations, and saved progress or responses.
              </p>
            </section>

            <section className="rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-sm sm:p-8">
              <h2 className="font-marcellus text-2xl text-white">Limited data retention</h2>
              <p className="mt-3 text-body text-white/75">
                We may retain limited records only when required or permitted for legal,
                accounting, fraud-prevention, dispute-resolution, or security obligations, and
                only for as long as those obligations reasonably require.
              </p>
            </section>
          </div>

          <section className="rounded-3xl border border-[#E6C87C]/30 bg-[#E6C87C]/10 p-6 sm:p-8">
            <h2 className="font-marcellus text-2xl text-white">Purchases and shared spaces</h2>
            <div className="mt-3 space-y-3 text-body text-white/80">
              <p>
                Purchase records may be retained for legal, accounting, fraud-prevention, or
                security obligations. When retained, they are disconnected from the deleted
                account identity.
              </p>
              <p>
                Where needed to preserve the integrity of shared community conversations, a
                non-identifying deletion marker may remain after the account identity and the
                deleted user&apos;s post content are removed.
              </p>
            </div>
          </section>

          <section className="text-center text-body text-white/75">
            <p>
              Questions about account deletion? Contact{" "}
              <a className="text-[#E6C87C] underline underline-offset-4" href={supportHref}>
                {supportEmail}
              </a>
              .
            </p>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}
