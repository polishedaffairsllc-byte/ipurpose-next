import Link from 'next/link';
import PublicHeader from '../components/PublicHeader';
import Footer from '../components/Footer';

type ClarityCheckPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const focusAreas = [
  {
    title: 'Clarity',
    copy: 'Are the direction, priorities, outcomes, and decisions clear enough to move forward?',
  },
  {
    title: 'Systems',
    copy: 'Is there enough structure to make the work repeatable, understandable, and sustainable?',
  },
  {
    title: 'AI',
    copy: 'Is technology supporting a clear workflow — or adding more complexity?',
  },
];

const learningAreas = [
  {
    title: 'Direction',
    intro: 'You may need greater clarity around:',
    items: ['the goal', 'the priority', 'the decision', 'the audience', 'or what should happen next'],
  },
  {
    title: 'Structure',
    intro: 'You may need a stronger system around:',
    items: ['workflow', 'ownership', 'consistency', 'handoffs', 'repeatable steps', 'or operational follow-through'],
  },
  {
    title: 'Technology',
    intro: 'You may need to reconsider:',
    items: ['where AI belongs', 'what should be automated', 'whether a tool is solving the right problem', 'or whether technology is currently creating more work than it removes'],
  },
];

const relatedGuidance = [
  {
    context: 'If Your Issue Is Systems',
    title: 'AI Tools vs. Business Systems: What Does Your Business Actually Need?',
    href: '/guides/ai-tools-vs-business-systems',
  },
  {
    context: 'If You Are Unsure What to Automate',
    title: 'How to Know What to Automate in Your Business',
    href: '/guides/what-to-automate-in-your-business',
  },
  {
    context: 'If AI Is Creating More Work',
    title: 'Why AI Is Not Saving You Time',
    href: '/guides/why-ai-is-not-saving-you-time',
  },
];

export default async function ClarityCheckPage({ searchParams }: ClarityCheckPageProps) {
  const params = await searchParams;
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value.forEach((item) => query.append(key, item));
    } else if (value !== undefined) {
      query.set(key, value);
    }
  }

  const qs = query.toString();
  const ctaHref = qs ? `/clarity-check-quiz?${qs}` : '/clarity-check-quiz';

  return (
    <div className="relative min-h-screen bg-white text-warmCharcoal">
      <PublicHeader />

      <main>
        <header
          className="relative flex min-h-[calc(82svh-64px)] items-center justify-center overflow-hidden px-4 py-20 text-center sm:px-6"
          style={{
            backgroundImage: 'url(/images/cosmic-timetraveler-Gg6Oz8026C8-unsplash.jpg)',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 mx-auto max-w-4xl">
            <p className="font-marcellus text-sm uppercase tracking-[0.24em] text-softGold">
              iPurpose Clarity Check
            </p>
            <h1 className="mt-5 font-italiana text-4xl leading-tight text-white sm:text-5xl md:text-6xl">
              Find the Real Source of What&rsquo;s Slowing You Down
            </h1>
            <p className="mx-auto mt-7 max-w-3xl font-marcellus text-lg leading-relaxed text-white/85 sm:text-xl">
              When everything feels connected, it can be hard to tell whether the problem is your direction, your systems, or the way you are using AI. The iPurpose Clarity Check helps you identify which layer may need attention first.
            </p>
            <Link
              href={ctaHref}
              className="mt-9 inline-block rounded-full bg-lavenderViolet px-8 py-4 font-marcellus text-lg font-semibold text-white transition-opacity hover:opacity-90"
            >
              Start the Free Clarity Check
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-4xl space-y-16 px-4 py-16 sm:px-6 sm:py-20">
          <section aria-labelledby="what-is-clarity-check" className="space-y-7">
            <h2 id="what-is-clarity-check" className="font-italiana text-3xl text-indigoDeep sm:text-4xl">
              What Is the iPurpose Clarity Check?
            </h2>
            <p className="font-marcellus text-lg leading-relaxed text-warmCharcoal/75">
              The iPurpose Clarity Check is a guided diagnostic experience designed to help you identify where business friction may be coming from.
            </p>
            <p className="font-marcellus text-lg leading-relaxed text-warmCharcoal/75">
              It looks at three connected areas:
            </p>
            <div className="grid gap-5 md:grid-cols-3">
              {focusAreas.map((area) => (
                <div key={area.title} className="rounded-2xl border border-warmCharcoal/10 p-6">
                  <h3 className="font-italiana text-2xl text-indigoDeep">{area.title}</h3>
                  <p className="mt-3 font-marcellus leading-relaxed text-warmCharcoal/75">{area.copy}</p>
                </div>
              ))}
            </div>
            <p className="font-marcellus text-lg leading-relaxed text-warmCharcoal/75">
              The goal is not to label your entire business.
            </p>
            <p className="font-marcellus text-lg leading-relaxed text-warmCharcoal/75">
              It is to help you identify the most useful place to focus next.
            </p>
          </section>

          <section
            id="clarity-check-experience"
            aria-labelledby="begin-clarity-check"
            className="rounded-2xl border border-lavenderViolet/25 bg-lavenderViolet/5 p-8 text-center sm:p-10"
          >
            <h2 id="begin-clarity-check" className="font-italiana text-3xl text-indigoDeep">
              Ready to identify the right starting point?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl font-marcellus text-lg leading-relaxed text-warmCharcoal/75">
              Begin the existing interactive Clarity Check and answer each question as honestly as you can.
            </p>
            <Link
              href={ctaHref}
              className="mt-7 inline-block rounded-full bg-lavenderViolet px-8 py-4 font-marcellus text-lg font-semibold text-white transition-opacity hover:opacity-90"
            >
              Start the Free Clarity Check
            </Link>
          </section>

          <section aria-labelledby="problem-not-where-it-appears" className="space-y-5">
            <h2 id="problem-not-where-it-appears" className="font-italiana text-3xl text-indigoDeep sm:text-4xl">
              Sometimes the Problem Is Not Where It Appears to Be
            </h2>
            <p className="font-marcellus text-lg leading-relaxed text-warmCharcoal/75">You may think you need:</p>
            <ul className="list-disc space-y-2 pl-6 font-marcellus text-lg leading-relaxed text-warmCharcoal/75">
              <li>another AI tool,</li>
              <li>better automation,</li>
              <li>a new strategy,</li>
              <li>more discipline,</li>
              <li>a different workflow,</li>
              <li>or simply more time.</li>
            </ul>
            <p className="font-marcellus text-lg leading-relaxed text-warmCharcoal/75">But the friction may be happening earlier.</p>
            <p className="font-marcellus text-lg leading-relaxed text-warmCharcoal/75">A process can feel inefficient because the underlying decision is unclear.</p>
            <p className="font-marcellus text-lg leading-relaxed text-warmCharcoal/75">AI can feel overwhelming because the business system beneath it is unstable.</p>
            <p className="font-marcellus text-lg leading-relaxed text-warmCharcoal/75">A workflow can feel broken because nobody ever decided what the workflow should accomplish.</p>
            <p className="font-marcellus text-lg leading-relaxed text-warmCharcoal/75">The purpose of the iPurpose Clarity Check is to help separate those layers.</p>
          </section>

          <section aria-labelledby="who-is-it-for" className="space-y-5">
            <h2 id="who-is-it-for" className="font-italiana text-3xl text-indigoDeep sm:text-4xl">Who Is It For?</h2>
            <p className="font-marcellus text-lg leading-relaxed text-warmCharcoal/75">
              The Clarity Check is for creators, entrepreneurs, and business owners who may be experiencing things like:
            </p>
            <ul className="grid list-disc gap-2 pl-6 font-marcellus text-lg leading-relaxed text-warmCharcoal/75 sm:grid-cols-2">
              <li>too many ideas and no clear priority,</li><li>repeated second-guessing,</li><li>inconsistent workflows,</li><li>work falling through the cracks,</li><li>difficulty deciding what to automate,</li><li>too many tools,</li><li>AI overwhelm,</li><li>duplicated effort,</li><li>unclear next steps,</li><li>or the feeling that everything needs attention at once.</li>
            </ul>
            <p className="font-marcellus text-lg leading-relaxed text-warmCharcoal/75">You do not need to be using advanced AI or automation.</p>
            <p className="font-marcellus text-lg leading-relaxed text-warmCharcoal/75">You only need a real business challenge you are trying to understand more clearly.</p>
          </section>

          <section aria-labelledby="what-will-i-learn" className="space-y-7">
            <h2 id="what-will-i-learn" className="font-italiana text-3xl text-indigoDeep sm:text-4xl">What Will I Learn?</h2>
            <p className="font-marcellus text-lg leading-relaxed text-warmCharcoal/75">
              The Clarity Check is designed to help you identify whether your current friction appears most connected to:
            </p>
            <div className="grid gap-5 md:grid-cols-3">
              {learningAreas.map((area) => (
                <div key={area.title} className="rounded-2xl border border-warmCharcoal/10 p-6">
                  <h3 className="font-italiana text-2xl text-indigoDeep">{area.title}</h3>
                  <p className="mt-3 font-marcellus leading-relaxed text-warmCharcoal/75">{area.intro}</p>
                  <ul className="mt-3 list-disc space-y-2 pl-5 font-marcellus leading-relaxed text-warmCharcoal/75">
                    {area.items.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              ))}
            </div>
            <p className="font-marcellus text-lg leading-relaxed text-warmCharcoal/75">
              The result should give you a clearer starting point — not another list of things to do.
            </p>
          </section>

          <section aria-labelledby="why-order-matters" className="space-y-7">
            <p className="font-marcellus text-sm uppercase tracking-[0.2em] text-lavenderViolet">Soul → Systems → AI™</p>
            <h2 id="why-order-matters" className="font-italiana text-3xl text-indigoDeep sm:text-4xl">Why the Order Matters</h2>
            <p className="font-marcellus text-lg leading-relaxed text-warmCharcoal/75">iPurpose uses a simple sequence:</p>
            <p className="rounded-xl border-l-4 border-lavenderViolet bg-lavenderViolet/5 p-5 font-italiana text-2xl text-indigoDeep"><strong>Soul → Systems → AI™</strong></p>
            <div className="grid gap-5 md:grid-cols-3">
              <div className="rounded-2xl border border-salmonPeach/30 bg-salmonPeach/5 p-6"><h3 className="font-italiana text-2xl text-indigoDeep">Soul</h3><p className="mt-3 font-marcellus leading-relaxed text-warmCharcoal/75">Clarify what matters.</p><p className="mt-3 font-marcellus leading-relaxed text-warmCharcoal/75">What are you trying to accomplish?</p><p className="mt-3 font-marcellus leading-relaxed text-warmCharcoal/75">What decision needs to be made?</p><p className="mt-3 font-marcellus leading-relaxed text-warmCharcoal/75">What deserves your attention?</p></div>
              <div className="rounded-2xl border border-softGold/40 bg-softGold/10 p-6"><h3 className="font-italiana text-2xl text-indigoDeep">Systems</h3><p className="mt-3 font-marcellus leading-relaxed text-warmCharcoal/75">Create structure around the work.</p><p className="mt-3 font-marcellus leading-relaxed text-warmCharcoal/75">How should the process happen?</p><p className="mt-3 font-marcellus leading-relaxed text-warmCharcoal/75">Who owns it?</p><p className="mt-3 font-marcellus leading-relaxed text-warmCharcoal/75">What needs to repeat consistently?</p></div>
              <div className="rounded-2xl border border-lavenderViolet/30 bg-lavenderViolet/5 p-6"><h3 className="font-italiana text-2xl text-indigoDeep">AI</h3><p className="mt-3 font-marcellus leading-relaxed text-warmCharcoal/75">Use technology where it genuinely helps.</p><p className="mt-3 font-marcellus leading-relaxed text-warmCharcoal/75">What work can be reduced, supported, or automated without weakening judgment or accountability?</p></div>
            </div>
            <p className="font-marcellus text-lg leading-relaxed text-warmCharcoal/75">
              This sequence is designed to prevent technology from being used as a substitute for clarity. Explore the{' '}
              <Link href="/discover" className="font-semibold text-lavenderViolet underline underline-offset-4">Soul → Systems → AI™ framework</Link>.
            </p>
          </section>

          <section aria-labelledby="after-finish" className="space-y-5">
            <h2 id="after-finish" className="font-italiana text-3xl text-indigoDeep sm:text-4xl">What Happens After I Finish?</h2>
            <p className="font-marcellus text-lg leading-relaxed text-warmCharcoal/75">After completing the Clarity Check, you should have a clearer sense of which area deserves attention first.</p>
            <p className="font-marcellus text-lg leading-relaxed text-warmCharcoal/75">Depending on the result, the next step may involve:</p>
            <ul className="list-disc space-y-2 pl-6 font-marcellus text-lg leading-relaxed text-warmCharcoal/75"><li>clarifying a decision,</li><li>simplifying a workflow,</li><li>documenting a system,</li><li>reducing unnecessary tools,</li><li>identifying a process that may be ready for automation,</li><li>or using AI more intentionally.</li></ul>
            <p className="font-marcellus text-lg leading-relaxed text-warmCharcoal/75">The purpose is not to push you toward more technology.</p>
            <p className="font-marcellus text-lg leading-relaxed text-warmCharcoal/75">The purpose is to help you choose the right next move.</p>
            <p className="font-marcellus text-lg leading-relaxed text-warmCharcoal/75">Where appropriate, the experience may also point you toward relevant iPurpose guides or resources that can help you go deeper.</p>
          </section>

          <section aria-labelledby="related-guidance" className="rounded-2xl border border-softGold/60 bg-softGold/10 p-7 sm:p-10">
            <h2 id="related-guidance" className="font-italiana text-3xl text-indigoDeep sm:text-4xl">Related Guidance</h2>
            <div className="mt-7 grid gap-5 md:grid-cols-3">
              {relatedGuidance.map((guide) => (
                <div key={guide.href} className="rounded-xl border border-warmCharcoal/10 bg-white p-5">
                  <h3 className="font-marcellus text-sm uppercase tracking-[0.12em] text-lavenderViolet">{guide.context}</h3>
                  <p className="mt-3 font-marcellus leading-relaxed">
                    <Link href={guide.href} className="font-semibold text-indigoDeep underline underline-offset-4">{guide.title}</Link>
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="clarity-check-faq" className="space-y-7">
            <h2 id="clarity-check-faq" className="font-italiana text-3xl text-indigoDeep sm:text-4xl">Clarity Check FAQ</h2>
            <div className="space-y-6">
              <div><h3 className="font-italiana text-2xl text-indigoDeep">Is the Clarity Check free?</h3><p className="mt-2 font-marcellus text-lg leading-relaxed text-warmCharcoal/75">Yes. The iPurpose Clarity Check is free to use.</p></div>
              <div><h3 className="font-italiana text-2xl text-indigoDeep">How long does the Clarity Check take?</h3><p className="mt-2 font-marcellus text-lg leading-relaxed text-warmCharcoal/75">It is designed to be a focused experience rather than a long assessment.</p></div>
              <div><h3 className="font-italiana text-2xl text-indigoDeep">Do I need to use AI in my business to take it?</h3><p className="mt-2 font-marcellus text-lg leading-relaxed text-warmCharcoal/75">No.</p><p className="mt-2 font-marcellus text-lg leading-relaxed text-warmCharcoal/75">The Clarity Check can still be useful if you are trying to understand your direction, priorities, workflows, or systems.</p><p className="mt-2 font-marcellus text-lg leading-relaxed text-warmCharcoal/75">AI is only one part of the framework.</p></div>
              <div><h3 className="font-italiana text-2xl text-indigoDeep">Is this an AI readiness assessment?</h3><p className="mt-2 font-marcellus text-lg leading-relaxed text-warmCharcoal/75">Not exactly.</p><p className="mt-2 font-marcellus text-lg leading-relaxed text-warmCharcoal/75">The Clarity Check looks at a broader question:</p><p className="mt-2 font-marcellus text-lg leading-relaxed text-indigoDeep"><strong>What needs attention first?</strong></p><p className="mt-2 font-marcellus text-lg leading-relaxed text-warmCharcoal/75">Sometimes the answer may involve AI.</p><p className="mt-2 font-marcellus text-lg leading-relaxed text-warmCharcoal/75">Other times, the more important issue is clarity or systems.</p></div>
              <div><h3 className="font-italiana text-2xl text-indigoDeep">Will the Clarity Check tell me what tools to buy?</h3><p className="mt-2 font-marcellus text-lg leading-relaxed text-warmCharcoal/75">No.</p><p className="mt-2 font-marcellus text-lg leading-relaxed text-warmCharcoal/75">Its purpose is to help identify the underlying area of friction before you add more technology.</p></div>
              <div><h3 className="font-italiana text-2xl text-indigoDeep">Will it automate my business?</h3><p className="mt-2 font-marcellus text-lg leading-relaxed text-warmCharcoal/75">No.</p><p className="mt-2 font-marcellus text-lg leading-relaxed text-warmCharcoal/75">It is a diagnostic starting point, not an automation platform.</p></div>
              <div><h3 className="font-italiana text-2xl text-indigoDeep">What should I do with my result?</h3><p className="mt-2 font-marcellus text-lg leading-relaxed text-warmCharcoal/75">Use it to identify the next area to work on.</p><p className="mt-2 font-marcellus text-lg leading-relaxed text-warmCharcoal/75">That may mean:</p><ul className="mt-2 list-disc space-y-2 pl-6 font-marcellus text-lg leading-relaxed text-warmCharcoal/75"><li>clarifying a decision,</li><li>defining a workflow,</li><li>strengthening a business system,</li><li>simplifying your current tools,</li><li>or evaluating where AI may help.</li></ul></div>
              <div><h3 className="font-italiana text-2xl text-indigoDeep">Does the Clarity Check replace professional advice?</h3><p className="mt-2 font-marcellus text-lg leading-relaxed text-warmCharcoal/75">No.</p><p className="mt-2 font-marcellus text-lg leading-relaxed text-warmCharcoal/75">It is a business clarity and workflow diagnostic tool.</p><p className="mt-2 font-marcellus text-lg leading-relaxed text-warmCharcoal/75">It is not legal, financial, medical, tax, or other regulated professional advice.</p></div>
            </div>
          </section>

          <aside className="rounded-2xl bg-gradient-to-br from-indigoDeep to-warmCharcoal px-6 py-12 text-center sm:px-10 sm:py-16">
            <p className="font-marcellus text-sm uppercase tracking-[0.22em] text-softGold">Start with the right problem</p>
            <h2 className="mt-4 font-italiana text-3xl text-white sm:text-4xl">Find out what needs attention first.</h2>
            <p className="mx-auto mt-5 max-w-2xl font-marcellus text-lg leading-relaxed text-white/75">Take the free iPurpose Clarity Check to identify whether your next step is clearer direction, stronger systems, or more intentional use of AI.</p>
            <Link href={ctaHref} className="mt-8 inline-block rounded-full bg-lavenderViolet px-8 py-4 font-marcellus text-lg font-semibold text-white transition-opacity hover:opacity-90">Start the Free Clarity Check</Link>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
