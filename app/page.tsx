import Button from './components/Button';

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-softGold/10 to-lavenderViolet/10 px-4">
      <section className="w-full max-w-2xl mx-auto flex flex-col items-center text-center py-20 md:py-32">
        <h1 className="font-italiana text-4xl md:text-6xl text-warmCharcoal mb-6 font-bold tracking-tight">iPurpose Portal</h1>
        <p className="text-lg md:text-2xl text-warmCharcoal/80 font-marcellus mb-10 max-w-xl">
          Align your soul. Empower your systems. Expand through AI.<br />
          <span className="text-warmCharcoal/60 text-base md:text-lg block mt-2">A transformation platform for visionary entrepreneurs.</span>
        </p>
        <Button href="/signup" size="xl" className="px-10 py-5 text-lg md:text-xl font-semibold">
          Get Started
        </Button>
      </section>
    </main>
  );
}
