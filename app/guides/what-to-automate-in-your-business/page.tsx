import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '../../components/Footer';
import PublicHeader from '../../components/PublicHeader';

const title = 'What to Automate in Your Business First | iPurpose';
const description =
  'Use a practical framework to identify which business tasks are ready for automation, what needs clarification first, and where AI can help without adding complexity.';
const canonical = 'https://ipurposesoul.com/guides/what-to-automate-in-your-business';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical },
  openGraph: {
    title,
    description,
    url: canonical,
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
  robots: { index: true, follow: true },
};

const readinessSignals = [
  'It happens often enough that the time or friction adds up.',
  'The desired result is clear and easy to recognize.',
  'The steps are mostly consistent from one occurrence to the next.',
  'The information needed to begin the task is available and reliable.',
  'Exceptions are known, limited, and can be handed to a person.',
  'A mistake would be visible, reversible, and reasonably low-risk.',
  'Removing the manual work would create meaningful time or attention.',
];

const scorecardRows = [
  {
    factor: 'Outcome clarity',
    zero: 'The purpose or desired result is unclear.',
    one: 'The result is understood but not consistently defined.',
    two: 'A successful result is specific and easy to recognize.',
  },
  {
    factor: 'Repeatability',
    zero: 'The task is rare or different every time.',
    one: 'Some steps repeat, while others change often.',
    two: 'The same core steps happen regularly.',
  },
  {
    factor: 'Process stability',
    zero: 'The workflow is still being invented.',
    one: 'The workflow works but changes frequently.',
    two: 'The workflow is established and dependable.',
  },
  {
    factor: 'Rules and inputs',
    zero: 'Inputs are inconsistent and decisions are intuitive.',
    one: 'Some rules exist, but important gaps remain.',
    two: 'Inputs, triggers, and decision rules are clear.',
  },
  {
    factor: 'Risk and reversibility',
    zero: 'An error could cause serious or irreversible harm.',
    one: 'Errors are manageable but require careful review.',
    two: 'Errors are easy to detect, correct, and contain.',
  },
  {
    factor: 'Time and energy',
    zero: 'Automation would save little meaningful effort.',
    one: 'The task creates occasional friction or delay.',
    two: 'The task repeatedly consumes valuable time or attention.',
  },
  {
    factor: 'Need for human judgment',
    zero: 'Trust, nuance, or discernment is central to the work.',
    one: 'A person must review several important decisions.',
    two: 'Most decisions are routine; people can handle exceptions.',
  },
];

const examples = [
  {
    process: 'Lead intake',
    automate: 'Confirm receipt, organize form responses, and route the inquiry.',
    human: 'Assess fit and write the thoughtful personal response.',
  },
  {
    process: 'Scheduling',
    automate: 'Offer available times, send confirmations, and issue reminders.',
    human: 'Handle sensitive changes or conversations that need care.',
  },
  {
    process: 'Client onboarding',
    automate: 'Deliver standard documents, create tasks, and send next-step prompts.',
    human: 'Welcome the client and establish the relationship.',
  },
  {
    process: 'Recurring reporting',
    automate: 'Gather consistent data and prepare a repeatable summary.',
    human: 'Interpret what changed and decide what to do next.',
  },
  {
    process: 'Content repurposing',
    automate: 'Organize source material and prepare first-pass formats.',
    human: 'Protect the point of view, accuracy, judgment, and final voice.',
  },
];

export default function WhatToAutomateGuidePage() {
  return (
    <div className="min-h-screen bg-white text-warmCharcoal">
      <PublicHeader />

      <main>
        <article>
          <header className="relative overflow-hidden bg-gradient-to-br from-indigoDeep via-warmCharcoal to-indigoDeep px-4 py-20 text-center sm:px-6 sm:py-28">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(156,136,255,0.24),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(252,196,183,0.18),transparent_42%)]" />
            <div className="relative mx-auto max-w-4xl">
              <p className="mb-5 font-marcellus text-sm uppercase tracking-[0.25em] text-softGold">
                iPurpose Guide
              </p>
              <h1 className="font-italiana text-4xl leading-tight text-white sm:text-5xl md:text-6xl">
                How to Know What to Automate in Your Business
              </h1>
              <p className="mx-auto mt-7 max-w-2xl font-marcellus text-lg leading-relaxed text-white/80 sm:text-xl">
                A practical way to identify which work is ready for automation, what needs a clearer system first, and where human judgment still matters most.
              </p>
            </div>
          </header>

          <div className="mx-auto max-w-4xl space-y-16 px-4 py-14 sm:px-6 sm:py-20">
            <section
              aria-labelledby="quick-answer"
              className="rounded-2xl border border-lavenderViolet/20 bg-lavenderViolet/5 p-7 sm:p-10"
            >
              <h2 id="quick-answer" className="font-italiana text-3xl text-indigoDeep">
                The short answer
              </h2>
              <p className="mt-5 font-marcellus text-lg leading-relaxed text-warmCharcoal/80">
                Automate work that is repetitive, stable, clearly defined, and low-risk. If a process still depends on unresolved decisions, changing expectations, or nuanced human judgment, automation is not the first move. Clarity is.
              </p>
            </section>

            <section aria-labelledby="wrong-process" className="space-y-5">
              <h2 id="wrong-process" className="font-italiana text-3xl text-indigoDeep sm:text-4xl">
                Why automating the wrong process creates more work
              </h2>
              <p className="font-marcellus text-lg leading-relaxed text-warmCharcoal/75">
                It is tempting to begin with the task that feels most annoying or the tool that looks most impressive. But automation does not repair a confused workflow. It repeats that workflow faster and at greater scale.
              </p>
              <p className="font-marcellus text-lg leading-relaxed text-warmCharcoal/75">
                A useful automation removes predictable work while leaving judgment with the person responsible for the outcome. Before choosing software, make sure you understand the decision being supported, the system carrying it, and the role technology should play.
              </p>
            </section>

            <section aria-labelledby="framework" className="space-y-8">
              <div>
                <p className="mb-3 font-marcellus text-sm uppercase tracking-[0.2em] text-lavenderViolet">
                  Soul → Systems → AI™
                </p>
                <h2 id="framework" className="font-italiana text-3xl text-indigoDeep sm:text-4xl">
                  Use the right sequence
                </h2>
              </div>
              <div className="grid gap-5 md:grid-cols-3">
                <div className="rounded-2xl border border-salmonPeach/30 bg-salmonPeach/5 p-6">
                  <p className="font-italiana text-2xl text-indigoDeep">1. Soul</p>
                  <p className="mt-3 font-marcellus leading-relaxed text-warmCharcoal/75">
                    Clarify what outcome matters, why it matters, and what responsibility should remain human.
                  </p>
                </div>
                <div className="rounded-2xl border border-softGold/40 bg-softGold/10 p-6">
                  <p className="font-italiana text-2xl text-indigoDeep">2. Systems</p>
                  <p className="mt-3 font-marcellus leading-relaxed text-warmCharcoal/75">
                    Define the trigger, inputs, steps, owner, result, and exceptions before adding technology.
                  </p>
                </div>
                <div className="rounded-2xl border border-lavenderViolet/30 bg-lavenderViolet/5 p-6">
                  <p className="font-italiana text-2xl text-indigoDeep">3. AI</p>
                  <p className="mt-3 font-marcellus leading-relaxed text-warmCharcoal/75">
                    Choose the smallest reliable support for the parts that are repeatable and safe to delegate.
                  </p>
                </div>
              </div>
              <p className="font-marcellus text-lg leading-relaxed text-warmCharcoal/75">
                This sequence is part of the broader{' '}
                <Link href="/discover" className="font-semibold text-lavenderViolet underline underline-offset-4">
                  Soul → Systems → AI™ framework
                </Link>
                : technology follows clarity instead of trying to replace it.
              </p>
            </section>

            <section aria-labelledby="ready-signs" className="space-y-7">
              <h2 id="ready-signs" className="font-italiana text-3xl text-indigoDeep sm:text-4xl">
                Seven signs a process is ready for automation
              </h2>
              <ol className="grid gap-4 sm:grid-cols-2">
                {readinessSignals.map((signal, index) => (
                  <li key={signal} className="flex gap-4 rounded-xl border border-warmCharcoal/10 p-5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigoDeep font-marcellus text-sm text-white">
                      {index + 1}
                    </span>
                    <span className="font-marcellus leading-relaxed text-warmCharcoal/75">{signal}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section aria-labelledby="scorecard" className="space-y-7">
              <div>
                <p className="mb-3 font-marcellus text-sm uppercase tracking-[0.2em] text-lavenderViolet">
                  Five-minute exercise
                </p>
                <h2 id="scorecard" className="font-italiana text-3xl text-indigoDeep sm:text-4xl">
                  Automation-readiness scorecard
                </h2>
                <p className="mt-4 font-marcellus text-lg leading-relaxed text-warmCharcoal/75">
                  Choose one real workflow—not your whole business. Give it 0, 1, or 2 points for each factor, then add the seven scores. The goal is not to justify automation. It is to see the process clearly enough to make a sound decision.
                </p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-warmCharcoal/10">
                <table className="w-full min-w-[760px] border-collapse text-left font-marcellus">
                  <thead className="bg-indigoDeep text-white">
                    <tr>
                      <th scope="col" className="px-5 py-4 font-normal">Factor</th>
                      <th scope="col" className="px-5 py-4 font-normal">0 points</th>
                      <th scope="col" className="px-5 py-4 font-normal">1 point</th>
                      <th scope="col" className="px-5 py-4 font-normal">2 points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scorecardRows.map((row) => (
                      <tr key={row.factor} className="border-t border-warmCharcoal/10 align-top even:bg-warmCharcoal/[0.025]">
                        <th scope="row" className="px-5 py-5 font-semibold text-indigoDeep">{row.factor}</th>
                        <td className="px-5 py-5 leading-relaxed text-warmCharcoal/70">{row.zero}</td>
                        <td className="px-5 py-5 leading-relaxed text-warmCharcoal/70">{row.one}</td>
                        <td className="px-5 py-5 leading-relaxed text-warmCharcoal/70">{row.two}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-salmonPeach/10 p-5">
                  <p className="font-italiana text-2xl text-indigoDeep">0–6</p>
                  <p className="mt-2 font-marcellus leading-relaxed text-warmCharcoal/75">
                    Clarify or redesign the workflow before automating it.
                  </p>
                </div>
                <div className="rounded-xl bg-softGold/15 p-5">
                  <p className="font-italiana text-2xl text-indigoDeep">7–10</p>
                  <p className="mt-2 font-marcellus leading-relaxed text-warmCharcoal/75">
                    Document the process and test a small, reversible step.
                  </p>
                </div>
                <div className="rounded-xl bg-lavenderViolet/10 p-5">
                  <p className="font-italiana text-2xl text-indigoDeep">11–14</p>
                  <p className="mt-2 font-marcellus leading-relaxed text-warmCharcoal/75">
                    This may be a strong candidate for carefully designed automation.
                  </p>
                </div>
              </div>
            </section>

            <section aria-labelledby="not-yet" className="space-y-6">
              <h2 id="not-yet" className="font-italiana text-3xl text-indigoDeep sm:text-4xl">
                What not to automate yet
              </h2>
              <div className="rounded-2xl border border-salmonPeach/30 bg-salmonPeach/5 p-7 sm:p-9">
                <ul className="space-y-4 font-marcellus text-lg leading-relaxed text-warmCharcoal/75">
                  <li><strong className="text-warmCharcoal">An unclear offer:</strong> automation cannot decide what you are promising or who it serves.</li>
                  <li><strong className="text-warmCharcoal">A changing process:</strong> stabilize the workflow before encoding it into tools.</li>
                  <li><strong className="text-warmCharcoal">Sensitive relationships:</strong> trust, conflict, care, and accountability often need a person.</li>
                  <li><strong className="text-warmCharcoal">High-risk judgment:</strong> financial, legal, ethical, or consequential decisions require appropriate human review.</li>
                  <li><strong className="text-warmCharcoal">Work you do not understand:</strong> document the process yourself before delegating it to technology.</li>
                </ul>
              </div>
            </section>

            <section aria-labelledby="examples" className="space-y-7">
              <h2 id="examples" className="font-italiana text-3xl text-indigoDeep sm:text-4xl">
                Practical examples for creators and small businesses
              </h2>
              <div className="space-y-4">
                {examples.map((example) => (
                  <div key={example.process} className="rounded-2xl border border-warmCharcoal/10 p-6 sm:p-7">
                    <h3 className="font-italiana text-2xl text-indigoDeep">{example.process}</h3>
                    <div className="mt-4 grid gap-3 md:grid-cols-2 md:gap-8">
                      <p className="font-marcellus leading-relaxed text-warmCharcoal/75">
                        <strong className="text-lavenderViolet">Automate:</strong> {example.automate}
                      </p>
                      <p className="font-marcellus leading-relaxed text-warmCharcoal/75">
                        <strong className="text-indigoDeep">Keep human:</strong> {example.human}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section aria-labelledby="first-automation" className="space-y-7">
              <h2 id="first-automation" className="font-italiana text-3xl text-indigoDeep sm:text-4xl">
                Choose your first automation
              </h2>
              <ol className="space-y-4 font-marcellus text-lg leading-relaxed text-warmCharcoal/75">
                <li><strong className="text-warmCharcoal">1. Name one workflow.</strong> Be specific: “responding to new inquiries,” not “sales.”</li>
                <li><strong className="text-warmCharcoal">2. Write the current steps.</strong> Include the trigger, information required, decisions, result, and owner.</li>
                <li><strong className="text-warmCharcoal">3. Remove unnecessary work.</strong> A simpler process is easier to automate and easier to trust.</li>
                <li><strong className="text-warmCharcoal">4. Test the process manually.</strong> Make sure the workflow works before asking a tool to repeat it.</li>
                <li><strong className="text-warmCharcoal">5. Automate one low-risk portion.</strong> Keep a person responsible for review and exceptions.</li>
                <li><strong className="text-warmCharcoal">6. Review the result.</strong> Confirm that the change saved meaningful effort without weakening quality or care.</li>
              </ol>
            </section>

            <aside className="rounded-2xl bg-gradient-to-br from-indigoDeep to-warmCharcoal px-6 py-12 text-center sm:px-10 sm:py-16">
              <p className="font-marcellus text-sm uppercase tracking-[0.22em] text-softGold">
                Find the real starting point
              </p>
              <h2 className="mt-4 font-italiana text-3xl text-white sm:text-4xl">
                Is the blocker clarity, systems, or AI?
              </h2>
              <p className="mx-auto mt-5 max-w-2xl font-marcellus text-lg leading-relaxed text-white/75">
                If you are unsure whether automation is actually the next step, the free iPurpose Clarity Check can help you identify what needs attention first.
              </p>
              <Link
                href="/clarity-check"
                className="mt-8 inline-block rounded-full bg-lavenderViolet px-8 py-4 font-marcellus text-lg font-semibold text-white transition-opacity hover:opacity-90"
              >
                Take the Free Clarity Check
              </Link>
              <p className="mt-6 font-marcellus text-sm text-white/60">
                Looking for guided implementation?{' '}
                <Link href="/program" className="underline underline-offset-4 hover:text-white">
                  Explore the iPurpose Accelerator™
                </Link>
                .
              </p>
            </aside>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
