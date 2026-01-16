import Link from 'next/link';

export default function EnrollmentRequiredPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-lavenderViolet/10 px-6">
      <div className="w-full max-w-md">
        <div className="ipurpose-glow-container">
          <div className="relative ipurpose-card px-6 py-8 text-center space-y-8">
            <div>
              <h1 className="text-3xl font-marcellus text-warmCharcoal mb-2">
                Enrollment Required
              </h1>
              <p className="text-warmCharcoal/70">
                Access to this page requires active enrollment in our program.
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/program"
                className="block px-6 py-3 bg-lavenderViolet text-white rounded-lg font-marcellus hover:bg-indigoDeep transition"
              >
                View Program
              </Link>
              <Link
                href="/info-session"
                className="block px-6 py-3 border-2 border-lavenderViolet text-lavenderViolet rounded-lg font-marcellus hover:bg-lavenderViolet/5 transition"
              >
                Join Info Session
              </Link>
              <Link
                href="/clarity-check"
                className="block px-6 py-3 border-2 border-warmCharcoal/20 text-warmCharcoal rounded-lg font-marcellus hover:bg-warmCharcoal/5 transition"
              >
                Take Clarity Check
              </Link>
              <Link
                href="/login"
                className="block px-6 py-3 border-2 border-warmCharcoal/20 text-warmCharcoal rounded-lg font-marcellus hover:bg-warmCharcoal/5 transition"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
