import Link from 'next/link';
import PublicHeader from '../components/PublicHeader';
import Footer from '../components/Footer';

export default function ClarityCheckPage() {
  return (
    <div className="relative min-h-screen bg-white">
      {/* Public Header */}
      <PublicHeader />
      
      {/* Main Content */}
      <div className="container max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        <section 
          className="relative text-center space-y-4 sm:space-y-6 py-16 sm:py-24 px-4 sm:px-6 rounded-2xl overflow-hidden mb-8"
          style={{
            backgroundImage: 'url(/images/cosmic-timetraveler-Gg6Oz8026C8-unsplash.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/50"></div>
          
          <h1 className="heading-hero mb-6 text-white relative z-10 text-display-hero">
            Take Your Clarity Check
          </h1>
          <p className="text-white relative z-10 font-italiana px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-display-emphasis" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', color: '#FFFFFF' }}>
            Twelve questions to unlock your direction
          </p>
        </section>

        <div className="text-center space-y-6 bg-gradient-to-br from-lavenderViolet/5 to-salmonPeach/5 rounded-2xl p-4 sm:p-6 md:p-8 border border-lavenderViolet/10">
          <p className="text-warmCharcoal/80 font-marcellus text-display-emphasis leading-relaxed">
            7 state questions + 5 identity questions. No sign-up required — just honest answers. 
            Find out where you truly stand in under 3 minutes.
          </p>

          <Link
            href="/clarity-check-numeric"
            className="inline-block w-full px-6 sm:px-8 py-3 sm:py-4 rounded-full font-marcellus text-white text-center text-display-emphasis hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(to right, #9C88FF, rgba(156, 136, 255, 0))' }}
          >
            Start the Clarity Check →
          </Link>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
