import Button from './components/Button';

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white m-0 p-0">
      <section className="w-full max-w-2xl mx-auto flex flex-col items-center text-center m-0 p-0">
        <h1 className="font-italiana text-4xl md:text-6xl text-warmCharcoal font-bold tracking-tight m-0 p-0">iPurpose Portal</h1>
        <p className="text-lg md:text-2xl text-warmCharcoal/80 font-marcellus max-w-xl m-0 p-0">
          Align your soul. Empower your systems. Expand through AI.<br />
          <span className="text-warmCharcoal/60 text-base md:text-lg block m-0 p-0">A transformation platform for visionary entrepreneurs.</span>
        </p>
        <Button href="/signup" size="xl" className="m-0 p-0 text-lg md:text-xl font-semibold">
          Get Started
        </Button>
      </section>
    </main>
  );
}
