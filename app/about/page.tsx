export default function AboutPage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <div className="relative h-[50vh] flex items-center justify-center overflow-hidden mb-16">
        <img
          src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1920&q=80"
          alt="About background"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <h1 className="heading-hero mb-4 text-warmCharcoal drop-shadow-2xl">About the Founder</h1>
          <p className="text-xl md:text-2xl text-warmCharcoal/80 font-marcellus drop-shadow-lg">
            Purpose-driven entrepreneurship at the intersection of soul, systems, and AI
          </p>
        </div>
      </div>

      <div className="container max-w-5xl mx-auto px-6 md:px-10 py-8 md:py-12">
        
        {/* Founder Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div className="order-2 md:order-1">
            <h2 className="font-marcellus text-4xl md:text-5xl text-warmCharcoal mb-4">
              Renita Hamilton
            </h2>
            <p className="text-lg text-lavenderViolet font-semibold mb-6">
              Founder & Creator of iPurpose
            </p>
            
            <div className="space-y-4 text-base text-warmCharcoal/80 leading-relaxed">
              <p>
                Renita Hamilton is a purpose-driven entrepreneur and strategist whose work bridges spiritual alignment, business systems, and ethical AI. She founded iPurpose to help individuals remember their calling, build supportive structures, and create sustainable, aligned income without sacrificing integrity or soul.
              </p>
              <p>
                Her work sits at the intersection of intuition and implementation—helping founders move from inner clarity to practical execution using modern tools that feel grounded, humane, and accessible. Through iPurpose, Renita guides people to simplify what feels overwhelming, trust their inner knowing, and build businesses that reflect who they truly are.
              </p>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-lavenderViolet/20 to-salmonPeach/20 rounded-2xl transform rotate-3"></div>
              <img
                src="/images/IMG_8011 2.JPG"
                alt="Renita Hamilton"
                className="relative rounded-2xl shadow-2xl w-full object-cover aspect-[3/4]"
              />
            </div>
          </div>
        </div>

        {/* Quote Section */}
        <div className="mb-20">
          <div className="bg-gradient-to-br from-lavenderViolet/5 to-salmonPeach/5 rounded-3xl p-12 border border-lavenderViolet/10">
            <p className="text-2xl md:text-3xl font-marcellus text-warmCharcoal leading-relaxed mb-6 text-center italic">
              "Our purpose isn't discovered — it's remembered. iPurpose helps you return to that remembrance and build a business that reflects it."
            </p>
            <p className="text-center text-warmCharcoal/60 font-semibold">
              — Renita Hamilton
            </p>
          </div>
        </div>

        {/* Credentials Section */}
        <div className="mb-20">
          <h3 className="font-marcellus text-3xl text-warmCharcoal mb-8 text-center">
            Experience & Impact
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-lavenderViolet/10 hover:border-lavenderViolet/30 transition-colors">
              <div className="flex items-start gap-4">
                <div className="text-3xl">🌍</div>
                <div>
                  <h4 className="font-semibold text-warmCharcoal mb-2">Digital Transformation Leader</h4>
                  <p className="text-sm text-warmCharcoal/70">
                    Led digital transformation initiatives for 3 national nonprofits
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-salmonPeach/10 hover:border-salmonPeach/30 transition-colors">
              <div className="flex items-start gap-4">
                <div className="text-3xl">🎯</div>
                <div>
                  <h4 className="font-semibold text-warmCharcoal mb-2">Strategic Guide</h4>
                  <p className="text-sm text-warmCharcoal/70">
                    Guided 50+ leaders through strategic transitions and purpose pivots
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-softGold/10 hover:border-softGold/30 transition-colors">
              <div className="flex items-start gap-4">
                <div className="text-3xl">🎤</div>
                <div>
                  <h4 className="font-semibold text-warmCharcoal mb-2">National Speaker</h4>
                  <p className="text-sm text-warmCharcoal/70">
                    Speaker on spirituality, leadership, and technology at national events
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-lavenderViolet/10 hover:border-lavenderViolet/30 transition-colors">
              <div className="flex items-start gap-4">
                <div className="text-3xl">✨</div>
                <div>
                  <h4 className="font-semibold text-warmCharcoal mb-2">Method Creator</h4>
                  <p className="text-sm text-warmCharcoal/70">
                    Creator of the Soul → Systems → AI™ Method & iPurpose AI Mentor Ecosystem™
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h3 className="font-marcellus text-2xl text-warmCharcoal mb-4">
            Ready to align your purpose?
          </h3>
          <p className="text-warmCharcoal/70 mb-8 max-w-2xl mx-auto">
            Join the iPurpose community and start your journey of soul alignment, strategic systems, and AI-powered expansion.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="/signup"
              className="inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 ipurpose-button-gradient px-8 py-4 text-base"
            >
              Begin Your Journey
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 bg-gradient-to-r from-lavenderViolet/10 to-salmonPeach/10 text-indigoDeep hover:from-lavenderViolet/20 hover:to-salmonPeach/20 border border-lavenderViolet/20 px-8 py-4 text-base"
            >
              Get in Touch
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
