import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '../../components/Footer';
import PublicHeader from '../../components/PublicHeader';
import styles from '../GuideArticle.module.css';

const title = 'How to Use AI in Your Business Without Adding More Chaos | iPurpose';
const description =
  'Learn a practical way to use AI in your business by starting with clarity, building the right systems, and applying AI only where it genuinely reduces work.';
const canonical = 'https://ipurposesoul.com/guides/how-to-use-ai-in-your-business';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical },
  openGraph: { title, description, url: canonical, type: 'article' },
  twitter: { card: 'summary_large_image', title, description },
  robots: { index: true, follow: true },
};

const shortAnswerSteps = [
  'Define the outcome.',
  'Understand the current workflow.',
  'Simplify the process.',
  'Identify repetitive or information-heavy work.',
  'Decide what should remain human.',
  'Introduce AI into one clear part of the process.',
  'Review whether it actually improved the work.',
];

const aiStrengths = [
  {
    title: 'Organizing Information',
    intro: 'AI can help sort, group, summarize, or structure existing information.',
    items: ['grouping survey responses', 'organizing meeting notes', 'categorizing ideas', 'summarizing long documents', 'extracting recurring themes'],
  },
  {
    title: 'First-Draft Support',
    intro: 'AI can help create a starting point.',
    items: ['email drafts', 'outlines', 'standard operating procedures', 'descriptions', 'internal documentation'],
    outro: 'A first draft is not the same as a final answer. Human review still matters.',
  },
  {
    title: 'Reformatting Existing Work',
    intro: 'AI can transform approved information into another useful form.',
    items: ['turning a transcript into notes', 'turning notes into an outline', 'turning a long explanation into a short internal summary', 'adapting existing material for another format'],
  },
  {
    title: 'Pattern Recognition',
    intro: 'AI can help identify repeated themes or patterns within a body of information.',
    items: ['customer feedback', 'intake responses', 'support questions', 'recurring operational issues'],
  },
  {
    title: 'Repetitive Administrative Work',
    intro: 'When the rules are clear, AI or automation may help reduce routine work such as:',
    items: ['routing information', 'preparing summaries', 'classifying requests', 'generating standardized first-pass responses', 'assisting with recurring reports'],
    outro: 'The key phrase is: when the rules are clear.',
  },
];

const opportunities = [
  {
    title: '1. Repetitive Writing',
    intro: 'Look for writing that follows a repeatable pattern.',
    items: ['confirmation messages', 'standard follow-ups', 'recurring internal summaries', 'first-pass descriptions'],
    outro: 'Do not automate sensitive relationship-based communication simply because AI can produce words.',
  },
  {
    title: '2. Information Overload',
    intro: 'Look for places where you spend too much time reading, sorting, or condensing information.',
    items: ['meeting notes', 'survey responses', 'research', 'client intake', 'customer feedback'],
    outro: 'AI may reduce the time required to find the useful signal inside a large amount of information.',
  },
  {
    title: '3. Repeated Research Tasks',
    intro: 'If you repeatedly gather the same categories of information, AI may help organize the process.',
    outro: 'Human verification is still important when accuracy matters.',
  },
  {
    title: '4. Content Repurposing',
    intro: 'If you already have strong original material, AI can help transform it into other useful formats. For example, a long-form article might become:',
    items: ['an internal summary', 'an email outline', 'short educational points', 'FAQ ideas', 'a video outline'],
    outro: 'AI should preserve the original thinking rather than manufacture a point of view you never created.',
  },
  {
    title: '5. Routine Classification',
    intro: 'AI can help sort information when categories are already defined.',
    items: ['inquiry type', 'topic category', 'urgency level', 'content theme', 'request type'],
    outro: 'The categories should come from the business. AI should not invent the operating rules.',
  },
  {
    title: '6. Repetitive Workflow Support',
    intro: 'Some workflows include administrative steps that happen the same way every time. AI or automation may help with:',
    items: ['data transfer', 'status updates', 'reminders', 'document preparation', 'first-pass processing'],
    outro: 'Before automating, confirm that the workflow itself is stable.',
  },
];

const opportunityTest = [
  ['1. Frequency', 'How often does the task happen?', 'A task that happens once every few months may not need automation. A small task repeated every day may be a better opportunity.'],
  ['2. Stability', 'Does the process happen roughly the same way each time?', 'If the workflow changes constantly, AI may create maintenance instead of relief.'],
  ['3. Judgment', 'How much human discernment does the task require?', 'The more nuanced, sensitive, or consequential the work, the more human involvement should remain.'],
  ['4. Reviewability', 'Can you easily tell when the output is wrong?', 'Tasks with clear, reviewable outputs are generally safer places to begin.'],
];

export default function HowToUseAiInYourBusinessPage() {
  return (
    <div className={styles.page}>
      <PublicHeader />
      <main>
        <article>
          <header className={styles.hero}>
            <div className={styles.heroInner}>
              <p className={styles.eyebrow}>iPurpose Guide</p>
              <h1 className={styles.heroTitle}>How to Use AI in Your Business Without Adding More Chaos</h1>
              <p className={styles.heroLead}>You do not need AI everywhere.</p>
              <p className={styles.heroLead}>You need it in the right places.</p>
              <p className={styles.heroLead}>
                The most useful AI strategy starts with the business problem, builds the workflow, and then uses technology to reduce the work that should not require so much of your time.
              </p>
            </div>
          </header>

          <div className={styles.content}>
            <section aria-labelledby="short-answer" className={`${styles.section} ${styles.summary}`}>
              <h2 id="short-answer" className={styles.sectionTitle}>The Short Answer</h2>
              <p className={styles.paragraph}>To use AI effectively in your business:</p>
              <ol className={styles.numberedList}>
                {shortAnswerSteps.map((step) => <li key={step}>{step}</li>)}
              </ol>
              <p className={styles.paragraph}>The order matters.</p>
              <p className={styles.paragraph}>AI should support your business system.</p>
              <p className={styles.paragraph}>It should not become the system.</p>
            </section>

            <section aria-labelledby="start-with-business" className={styles.section}>
              <h2 id="start-with-business" className={styles.sectionTitle}>Start With the Business, Not the Tool</h2>
              <p className={styles.paragraph}>The AI marketplace can make the process feel backwards.</p>
              <p className={styles.paragraph}>You hear about a new tool.</p>
              <p className={styles.paragraph}>You see what it can do.</p>
              <p className={styles.paragraph}>Then you begin searching your business for somewhere to use it.</p>
              <p className={styles.paragraph}>That can lead to unnecessary software, disconnected workflows, and automation that solves problems you did not actually have.</p>
              <p className={styles.paragraph}>A better sequence is:</p>
              <p className={styles.statement}><strong>Business need → workflow → appropriate technology</strong></p>
              <p className={styles.paragraph}>Instead of asking:</p>
              <p className={styles.statement}><strong>“What can this AI tool do?”</strong></p>
              <p className={styles.paragraph}>Ask:</p>
              <p className={styles.statement}><strong>“What work in my business is consuming time, attention, or energy — and why?”</strong></p>
              <p className={styles.paragraph}>That question often reveals whether the problem is actually:</p>
              <ul className={styles.list}>
                <li>a decision problem,</li><li>a systems problem,</li><li>a capacity problem,</li><li>a repetitive task,</li><li>or something AI can genuinely help with.</li>
              </ul>
            </section>

            <section aria-labelledby="better-way" className={styles.section}>
              <p className={styles.frameworkLabel}>Soul → Systems → AI™</p>
              <h2 id="better-way" className={styles.sectionTitle}>A Better Way to Introduce AI Into Your Business</h2>
              <div className={styles.frameworkGrid}>
                <div className={styles.frameworkCard}>
                  <h3 className={styles.cardTitle}>1. Soul — Get Clear About the Outcome</h3>
                  <p className={styles.paragraph}>Before choosing technology, decide what you are trying to accomplish.</p>
                  <p className={styles.paragraph}>Ask:</p>
                  <ul className={styles.list}><li>What result matters?</li><li>Why does this process exist?</li><li>Who does it serve?</li><li>What does “good” look like?</li><li>What responsibility should remain human?</li></ul>
                  <p className={styles.paragraph}>This is the clarity layer.</p>
                  <p className={styles.paragraph}>Without it, AI may give you more output without moving you closer to the right outcome.</p>
                </div>
                <div className={styles.frameworkCard}>
                  <h3 className={styles.cardTitle}>2. Systems — Define How the Work Should Happen</h3>
                  <p className={styles.paragraph}>Next, create structure.</p>
                  <p className={styles.paragraph}>Identify:</p>
                  <ul className={styles.list}><li>what starts the process,</li><li>what information is needed,</li><li>what steps happen,</li><li>who owns each step,</li><li>what decisions are made,</li><li>what exceptions exist,</li><li>and how the process ends.</li></ul>
                  <p className={styles.paragraph}>This is the systems layer.</p>
                  <p className={styles.paragraph}>A stable process makes it much easier to identify what technology should and should not do.</p>
                </div>
                <div className={styles.frameworkCard}>
                  <h3 className={styles.cardTitle}>3. AI — Support the Appropriate Work</h3>
                  <p className={styles.paragraph}>Now ask:</p>
                  <ul className={styles.list}><li>Which steps repeat?</li><li>Which steps are time-consuming?</li><li>Which steps rely heavily on organizing information?</li><li>Which steps are easy to review?</li><li>Which steps do not require deep human judgment?</li></ul>
                  <p className={styles.paragraph}>This is where AI can become useful.</p>
                </div>
              </div>
              <p className={styles.paragraph}>Learn more about the <Link href="/discover">Soul → Systems → AI™ framework</Link>.</p>
            </section>

            <section aria-labelledby="ai-good-at" className={styles.section}>
              <h2 id="ai-good-at" className={styles.sectionTitle}>What AI Is Actually Good At</h2>
              <p className={styles.paragraph}>AI is especially useful when the work involves patterns, language, large amounts of information, or repetitive transformation.</p>
              <div className={styles.cardGrid}>
                {aiStrengths.map((item) => (
                  <div className={styles.card} key={item.title}>
                    <h3 className={styles.cardTitle}>{item.title}</h3>
                    <p className={styles.paragraph}>{item.intro}</p>
                    <p className={styles.paragraph}>Examples:</p>
                    <ul className={styles.list}>{item.items.map((value) => <li key={value}>{value},</li>)}</ul>
                    {item.outro ? <p className={styles.paragraph}>{item.outro}</p> : null}
                  </div>
                ))}
              </div>
            </section>

            <section aria-labelledby="not-decide" className={styles.section}>
              <h2 id="not-decide" className={styles.sectionTitle}>What AI Should Not Be Expected to Decide for You</h2>
              <p className={styles.paragraph}>AI can support decisions.</p>
              <p className={styles.paragraph}>It should not become a substitute for responsibility.</p>
              <p className={styles.paragraph}>Be cautious about handing over work involving:</p>
              <ul className={styles.list}><li>major financial decisions,</li><li>legal judgment,</li><li>sensitive personnel issues,</li><li>ethical decisions,</li><li>relationship-based communication,</li><li>high-consequence customer situations,</li><li>final strategic direction,</li><li>or anything where the cost of error is difficult to reverse.</li></ul>
              <p className={styles.paragraph}>AI may assist with information.</p>
              <p className={styles.paragraph}>A person should remain accountable for the decision.</p>
            </section>

            <section aria-labelledby="six-places" className={styles.section}>
              <h2 id="six-places" className={styles.sectionTitle}>Six Places to Look for Useful AI Opportunities</h2>
              <div className={styles.cardGrid}>
                {opportunities.map((item) => (
                  <div className={styles.card} key={item.title}>
                    <h3 className={styles.cardTitle}>{item.title}</h3>
                    <p className={styles.paragraph}>{item.intro}</p>
                    {item.items ? <><p className={styles.paragraph}>Examples:</p><ul className={styles.list}>{item.items.map((value) => <li key={value}>{value},</li>)}</ul></> : null}
                    <p className={styles.paragraph}>{item.outro}</p>
                  </div>
                ))}
              </div>
              <p className={styles.paragraph}>Use this guide to learn <Link href="/guides/what-to-automate-in-your-business">how to know what to automate in your business</Link>.</p>
            </section>

            <section aria-labelledby="opportunity-test" className={styles.section}>
              <h2 id="opportunity-test" className={styles.sectionTitle}>Use This Four-Part AI Opportunity Test</h2>
              <p className={styles.paragraph}>Before adding AI to a task, evaluate four things.</p>
              <div className={styles.cardGrid}>
                {opportunityTest.map(([heading, question, answer]) => (
                  <div className={styles.card} key={heading}>
                    <h3 className={styles.cardTitle}>{heading}</h3>
                    <p className={styles.paragraph}><strong>{question}</strong></p>
                    <p className={styles.paragraph}>{answer}</p>
                  </div>
                ))}
              </div>
            </section>

            <section aria-labelledby="lead-management" className={styles.section}>
              <h2 id="lead-management" className={styles.sectionTitle}>Example: Using AI in Lead Management</h2>
              <p className={styles.paragraph}>Imagine a new inquiry comes into your business.</p>
              <p className={styles.paragraph}>AI might help:</p>
              <ul className={styles.list}><li>summarize the inquiry,</li><li>classify the request,</li><li>organize the information,</li><li>prepare a first-pass response,</li><li>or route the inquiry to the appropriate workflow.</li></ul>
              <p className={styles.paragraph}>But AI should not automatically decide whether a relationship is valuable, whether a sensitive client is a good fit, or how a high-stakes situation should be handled unless the business has appropriate human review.</p>
              <p className={styles.paragraph}>The system still needs:</p>
              <ul className={styles.list}><li>qualification rules,</li><li>ownership,</li><li>response expectations,</li><li>escalation paths,</li><li>and a defined next step.</li></ul>
              <p className={styles.paragraph}>AI supports the system.</p><p className={styles.paragraph}>It does not replace it.</p>
            </section>

            <section aria-labelledby="content-example" className={styles.section}>
              <h2 id="content-example" className={styles.sectionTitle}>Example: Using AI for Content</h2>
              <p className={styles.paragraph}>AI can help with content when the thinking already belongs to you.</p>
              <p className={styles.paragraph}>It may help:</p>
              <ul className={styles.list}><li>organize ideas,</li><li>structure a draft,</li><li>extract key points,</li><li>prepare alternate formats,</li><li>or identify gaps.</li></ul>
              <p className={styles.paragraph}>But your business still needs clarity around:</p>
              <ul className={styles.list}><li>who you are speaking to,</li><li>what you believe,</li><li>what you want people to understand,</li><li>what your brand sounds like,</li><li>and why the content exists.</li></ul>
              <p className={styles.paragraph}>Without that foundation, AI may create more content but not stronger communication.</p>
            </section>

            <section aria-labelledby="onboarding-example" className={styles.section}>
              <h2 id="onboarding-example" className={styles.sectionTitle}>Example: Using AI in Client Onboarding</h2>
              <p className={styles.paragraph}>A defined onboarding workflow might include:</p>
              <ol className={styles.numberedList}><li>signed agreement,</li><li>payment confirmation,</li><li>welcome message,</li><li>intake form,</li><li>project setup,</li><li>scheduling,</li><li>first-session preparation.</li></ol>
              <p className={styles.paragraph}>AI or automation might support several administrative steps.</p>
              <p className={styles.paragraph}>But first, the business must decide what the onboarding experience should actually be.</p>
              <p className={styles.paragraph}>That is the system.</p><p className={styles.paragraph}>The technology comes afterward.</p>
            </section>

            <section aria-labelledby="automate-everything" className={styles.section}>
              <h2 id="automate-everything" className={styles.sectionTitle}>The Mistake of Trying to Automate Everything</h2>
              <p className={styles.paragraph}>Not every manual task is a problem.</p>
              <p className={styles.paragraph}>Some manual work creates:</p>
              <ul className={styles.list}><li>trust,</li><li>insight,</li><li>connection,</li><li>accountability,</li><li>quality,</li><li>or learning.</li></ul>
              <p className={styles.paragraph}>If you automate something simply because it can be automated, you may remove a part of the experience that mattered.</p>
              <p className={styles.paragraph}>The goal is not maximum automation.</p>
              <p className={styles.paragraph}>The goal is intentional automation.</p>
            </section>

            <section aria-labelledby="start-small" className={styles.section}>
              <h2 id="start-small" className={styles.sectionTitle}>Start Small</h2>
              <p className={styles.paragraph}>You do not need an AI transformation plan for your entire business.</p>
              <p className={styles.paragraph}>Choose one process.</p>
              <p className={styles.paragraph}>A good starting process is:</p>
              <ul className={styles.list}><li>frequent,</li><li>understandable,</li><li>stable,</li><li>low-risk,</li><li>easy to review,</li><li>and annoying enough that improving it would matter.</li></ul>
              <p className={styles.paragraph}>Then improve one part.</p><p className={styles.paragraph}>Observe the result.</p><p className={styles.paragraph}>Only expand once the change genuinely works.</p>
            </section>

            <section aria-labelledby="tool-system" className={styles.section}>
              <h2 id="tool-system" className={styles.sectionTitle}>Do Not Confuse an AI Tool With a Business System</h2>
              <p className={styles.paragraph}>A tool performs a function.</p><p className={styles.paragraph}>A system defines how the work moves.</p>
              <p className={styles.paragraph}>You can have excellent AI tools and still have a disorganized business.</p>
              <p className={styles.paragraph}>If information is scattered, responsibilities are unclear, or work regularly falls through the cracks, the priority may be better systems before more AI.</p>
              <p className={styles.paragraph}><Link href="/guides/ai-tools-vs-business-systems">AI tools and business systems solve different problems</Link>.</p>
            </section>

            <section aria-labelledby="ai-busier" className={styles.section}>
              <h2 id="ai-busier" className={styles.sectionTitle}>If AI Is Making You Busier</h2>
              <p className={styles.paragraph}>That is a signal worth examining.</p>
              <p className={styles.paragraph}>AI may be adding work because:</p>
              <ul className={styles.list}><li>you are using too many tools,</li><li>every output requires heavy editing,</li><li>you are generating more content than you can use,</li><li>the workflow is still unstable,</li><li>or the business has not defined what AI is responsible for.</li></ul>
              <p className={styles.paragraph}>Learn <Link href="/guides/why-ai-is-not-saving-you-time">why AI may not be saving you time</Link>.</p>
            </section>

            <section aria-labelledby="operating-agreement" className={styles.section}>
              <h2 id="operating-agreement" className={styles.sectionTitle}>Build a Simple AI Operating Agreement</h2>
              <p className={styles.paragraph}>Before introducing AI into a workflow, write down:</p>
              <div className={styles.exampleGrid}>
                <div className={styles.exampleCard}><h3 className={styles.cardTitle}>AI May:</h3><ul className={styles.list}><li>organize information,</li><li>prepare first drafts,</li><li>identify patterns,</li><li>support repetitive tasks,</li><li>summarize approved source material.</li></ul></div>
                <div className={styles.exampleCard}><h3 className={styles.cardTitle}>A Human Must:</h3><ul className={styles.list}><li>verify important information,</li><li>make consequential decisions,</li><li>review sensitive communication,</li><li>approve final outputs where quality matters,</li><li>remain responsible for the result.</li></ul></div>
              </div>
              <p className={styles.paragraph}>Your exact agreement will vary by process.</p>
              <p className={styles.paragraph}>The purpose is to make the boundary visible.</p>
            </section>

            <section aria-labelledby="seven-step-process" className={styles.section}>
              <h2 id="seven-step-process" className={styles.sectionTitle}>A Practical Seven-Step Process</h2>
              <ol className={styles.questionList}>
                <li><strong>Step 1 — Identify the Friction</strong>What repeatedly consumes time or attention?</li>
                <li><strong>Step 2 — Diagnose the Problem</strong>Is this actually an AI opportunity, or is the workflow unclear?</li>
                <li><strong>Step 3 — Define the Outcome</strong>What should happen when the process works correctly?</li>
                <li><strong>Step 4 — Document the Current Workflow</strong>Write down the trigger, steps, decisions, owner, and result.</li>
                <li><strong>Step 5 — Simplify</strong>Remove unnecessary steps before automating anything.</li>
                <li><strong>Step 6 — Introduce AI Into One Defined Role</strong>Start with the smallest useful piece.</li>
                <li><strong>Step 7 — Measure What Changed</strong>Did this reduce time? Did quality remain acceptable? Did it create new work? Is the process easier to manage? Should we keep it?</li>
              </ol>
              <p className={styles.paragraph}>If the answer is no, change or remove the automation.</p>
              <p className={styles.paragraph}>Technology is allowed to fail the test.</p>
            </section>

            <section aria-labelledby="related-guides" className={`${styles.section} ${styles.related}`}>
              <h2 id="related-guides" className={styles.sectionTitle}>Related Guides</h2>
              <div className={styles.stack}>
                <div><h3 className={styles.cardTitle}>Before You Add Another Tool</h3><p className={styles.paragraph}><Link href="/guides/ai-tools-vs-business-systems">AI Tools vs. Business Systems: What Does Your Business Actually Need?</Link></p></div>
                <div><h3 className={styles.cardTitle}>If AI Is Creating More Work</h3><p className={styles.paragraph}><Link href="/guides/why-ai-is-not-saving-you-time">Why AI Is Not Saving You Time</Link></p></div>
                <div><h3 className={styles.cardTitle}>If You Have a Stable Process</h3><p className={styles.paragraph}><Link href="/guides/what-to-automate-in-your-business">How to Know What to Automate in Your Business</Link></p></div>
              </div>
            </section>

            <section aria-labelledby="support-business" className={`${styles.section} ${styles.closing}`}>
              <h2 id="support-business" className={styles.sectionTitle}>Use AI to Support the Business You Intend to Build</h2>
              <p className={styles.paragraph}>AI is not the starting point.</p><p className={styles.paragraph}>Your judgment is.</p>
              <p className={styles.paragraph}>The clearer you are about:</p>
              <ul className={styles.list}><li>what matters,</li><li>how work should happen,</li><li>what deserves your attention,</li><li>and what can safely be delegated,</li></ul>
              <p className={styles.paragraph}>the easier it becomes to use AI intentionally.</p>
              <p className={styles.paragraph}>That is the logic behind:</p><p className={styles.statement}><strong>Soul → Systems → AI™</strong></p>
              <p className={styles.paragraph}>Clarity gives you direction.</p><p className={styles.paragraph}>Systems create consistency.</p><p className={styles.paragraph}>AI helps reduce the work that no longer needs to be manual.</p>
            </section>

            <aside className={styles.cta}>
              <p className={styles.ctaEyebrow}>Start with clarity</p>
              <h2 className={styles.ctaTitle}>Where does AI actually belong in your business?</h2>
              <p className={styles.ctaBody}>The free iPurpose Clarity Check can help you identify whether your next move is clearer direction, stronger systems, or more intentional use of AI.</p>
              <Link href="/clarity-check" className={styles.primaryCta}>Take the Free Clarity Check</Link>
              <p className={styles.secondaryCta}>Want help turning the right decisions into practical systems? <Link href="/program">Explore the iPurpose Accelerator™</Link></p>
            </aside>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
