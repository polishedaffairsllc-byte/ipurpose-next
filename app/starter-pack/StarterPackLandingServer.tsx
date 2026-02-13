import Link from 'next/link';

export default function StarterPackLandingServer() {
  return (
    <div className="relative z-10 min-h-screen bg-white">
      <header className="py-6 border-b">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-2xl font-bold">iPurpose Starter Pack</h1>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Begin your clarity journey. Start simple. Start grounded.</h2>
          <p className="text-base text-warmCharcoal/80 leading-relaxed">
            If you're feeling pulled in a hundred directions, unsure where to focus, or ready to finally get intentional about your next season — this is your first step.
          </p>
        </div>

        <section className="mb-12">
          <h3 className="text-2xl font-bold mb-4">What You'll Receive</h3>
          <ul className="space-y-2 text-base text-warmCharcoal/80">
            <li>✦ Clarity Check Experience — a guided reflection on your current life and direction</li>
            <li>✦ Purpose Reflection Prompts — thoughtful prompts to slow down and listen inward</li>
            <li>✦ Personal Insight Snapshot — a grounded look at where you are right now</li>
            <li>✦ Gentle Direction Forward — clarity on what to build, heal, or explore next</li>
          </ul>
        </section>

        <div className="text-center">
          <form method="post" action="/api/stripe/create-checkout-session/form">
            <input type="hidden" name="product" value="starter_pack" />
            <button
              type="submit"
              className="px-8 py-4 rounded-full text-white text-lg"
              style={{ background: 'linear-gradient(135deg, #9C88FF, #E6C87C)' }}
            >
              Start with the Starter Pack — $27
            </button>
          </form>
          <p className="mt-4 text-sm text-warmCharcoal/50">
            Not ready? <Link href="/clarity-check" className="underline">Try the free Clarity Check first</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
