import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '../../components/Footer';
import PublicHeader from '../../components/PublicHeader';
import RelatedGuides from '../RelatedGuides';
import styles from '../GuideArticle.module.css';

const title = 'How to Build a Business Decision-Making System | iPurpose';
const description =
  'Learn how to build a simple business decision-making system that reduces second-guessing, clarifies priorities, and helps you make consistent decisions before adding automation or AI.';
const canonical = 'https://ipurposesoul.com/guides/business-decision-making-system';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical },
  openGraph: { title, description, url: canonical, type: 'article' },
  twitter: { card: 'summary_large_image', title, description },
  robots: { index: true, follow: true },
};

const recurringQuestions = [
  'Should I say yes to this opportunity?', 'Should I create this offer?', 'Should I buy this tool?',
  'Should I automate this process?', 'Should I change the workflow?', 'Is this customer a good fit?',
  'Is this project worth the time?', 'Which priority comes first?',
];

const systemParts = [
  {
    title: '1. Define the Decision',
    intro: ['Be precise.', 'Do not ask:', '“What should I do with my business?”', 'Ask:', '“Should I invest in this specific tool for this specific workflow?”', 'A clear decision is easier to evaluate.'],
    listIntro: null,
    items: null,
    outro: [],
  },
  {
    title: '2. Define the Desired Outcome',
    intro: ['What are you trying to accomplish?'],
    listIntro: 'Examples:',
    items: ['save time', 'improve customer experience', 'increase revenue', 'reduce risk', 'simplify operations', 'protect capacity', 'improve quality', 'create consistency'],
    outro: ['A decision cannot be evaluated well if success is undefined.'],
  },
  {
    title: '3. Identify the Constraints',
    intro: ['Every decision happens within limits.'],
    listIntro: 'Those may include:',
    items: ['budget', 'time', 'staffing', 'technical capability', 'risk tolerance', 'contractual obligations', 'customer expectations', 'current priorities'],
    outro: ['Constraints are not necessarily obstacles.', 'They are part of the decision.'],
  },
  {
    title: '4. Choose the Criteria',
    intro: ['Criteria are the questions each option must answer.', 'For example:'],
    listIntro: null,
    items: null,
    outro: ['The criteria should reflect your business.'],
  },
  {
    title: '5. Decide Who Owns the Decision',
    intro: ['Many decisions stall because responsibility is unclear.'],
    listIntro: 'Identify:',
    items: ['who gathers information', 'who provides input', 'who makes the final decision', 'who implements it'],
    outro: ['Collaboration does not mean everyone owns the final choice.'],
  },
  {
    title: '6. Set a Decision Deadline',
    intro: ['Without a deadline, analysis can continue indefinitely.', 'Not every decision needs the same amount of time.', 'A reversible low-risk decision may be made quickly.', 'A consequential decision may deserve deeper review.', 'Match the decision process to the level of risk.'],
    listIntro: null,
    items: null,
    outro: [],
  },
  {
    title: '7. Define the Next Action',
    intro: ['A decision is not complete until something happens.'],
    listIntro: 'After deciding:',
    items: ['what action begins', 'who owns it', 'when it starts', 'when the result will be reviewed'],
    outro: ['This prevents decisions from becoming documents instead of movement.'],
  },
];

const decisionFilter = [
  ['Is it aligned?', 'Does this support what the business is currently trying to accomplish?'],
  ['Is it necessary?', 'Does this solve an actual problem or only create another option?'],
  ['Is it feasible?', 'Do we have the time, money, capacity, and skills required?'],
  ['Is it valuable?', 'What meaningful benefit would this create?'],
  ['What does it cost beyond money?', 'Consider attention, complexity, maintenance, opportunity cost, and emotional energy.'],
  ['Is it reversible?', 'A reversible decision can often be tested. An irreversible or high-consequence decision deserves more scrutiny.'],
];

const decisionLevels = [
  ['Low-Risk and Reversible', ['testing a template', 'changing an internal meeting format', 'trying a short pilot'], 'These can often be decided quickly.'],
  ['Moderate Impact', ['adopting a new recurring software tool', 'adjusting an onboarding workflow', 'changing a regular business process'], 'These deserve structured review.'],
  ['High-Consequence or Difficult to Reverse', ['major financial commitments', 'legal commitments', 'significant staffing decisions', 'major strategic changes'], 'These require deeper information, appropriate professional input where necessary, and clear human accountability.'],
];

const relatedGuides = [
  {
    href: '/guides/ai-tools-vs-business-systems',
    title: 'AI Tools vs. Business Systems: What Does Your Business Actually Need?',
  },
  {
    href: '/guides/what-to-automate-in-your-business',
    title: 'How to Know What to Automate in Your Business',
  },
  {
    href: '/guides/ai-for-overwhelmed-entrepreneurs',
    title: 'AI for Overwhelmed Entrepreneurs: Start With Less, Not More',
  },
] as const;

export default function BusinessDecisionMakingSystemPage() {
  return (
    <div className={styles.page}>
      <PublicHeader />
      <main>
        <article>
          <header className={styles.hero}>
            <div className={styles.heroInner}>
              <p className={styles.eyebrow}>iPurpose Guide</p>
              <h1 className={styles.heroTitle}>How to Build a Business Decision-Making System</h1>
              <p className={styles.heroLead}>If every opportunity, idea, request, or problem sends you back to zero, decision-making becomes exhausting.</p>
              <p className={styles.heroLead}>A simple decision system helps you evaluate what matters, apply consistent criteria, and move forward without reinventing the process every time.</p>
            </div>
          </header>

          <div className={styles.content}>
            <section aria-labelledby="short-answer" className={`${styles.section} ${styles.summary}`}>
              <h2 id="short-answer" className={styles.sectionTitle}>The Short Answer</h2>
              <p className={styles.paragraph}>A business decision-making system is a repeatable way to evaluate choices.</p>
              <p className={styles.paragraph}>It should help you answer:</p>
              <ul className={styles.list}><li>What decision are we actually making?</li><li>What outcome matters?</li><li>What criteria should guide the choice?</li><li>What information is required?</li><li>Who owns the final decision?</li><li>When does the decision need to be made?</li><li>What happens after the decision?</li></ul>
              <p className={styles.paragraph}>The purpose is not to remove intuition.</p>
              <p className={styles.paragraph}>It is to give intuition structure.</p>
            </section>

            <section aria-labelledby="why-exhausting" className={styles.section}>
              <h2 id="why-exhausting" className={styles.sectionTitle}>Why Business Decisions Become Exhausting</h2>
              <p className={styles.paragraph}>Many business owners do not actually have a decision problem.</p>
              <p className={styles.paragraph}>They have a repeated-decision problem.</p>
              <p className={styles.paragraph}>The same kinds of questions keep returning:</p>
              <ul className={styles.list}>{recurringQuestions.map((question) => <li key={question}>{question}</li>)}</ul>
              <p className={styles.paragraph}>Without a system, each decision can feel brand new.</p>
              <p className={styles.paragraph}>That means you repeatedly gather information, reconsider your priorities, revisit your values, and question whether you are making the right choice.</p>
              <p className={styles.paragraph}>Eventually, decision fatigue becomes part of how the business operates.</p>
              <p className={styles.paragraph}>A system reduces that repetition.</p>
            </section>

            <section aria-labelledby="before-technology" className={styles.section}>
              <p className={styles.frameworkLabel}>Soul → Systems → AI™</p>
              <h2 id="before-technology" className={styles.sectionTitle}>Decision-Making Starts Before Technology</h2>
              <div className={styles.frameworkGrid}>
                <div className={styles.frameworkCard}>
                  <h3 className={styles.cardTitle}>1. Soul — Clarify What Matters</h3>
                  <p className={styles.paragraph}>Every useful decision system begins with criteria.</p>
                  <p className={styles.paragraph}>Those criteria should reflect:</p>
                  <ul className={styles.list}><li>the outcome you are trying to create,</li><li>who you serve,</li><li>your constraints,</li><li>your values,</li><li>your current priorities,</li><li>and what you are unwilling to compromise.</li></ul>
                  <p className={styles.paragraph}>Without this layer, the loudest option can easily become the default.</p>
                </div>
                <div className={styles.frameworkCard}>
                  <h3 className={styles.cardTitle}>2. Systems — Turn the Criteria Into a Repeatable Process</h3>
                  <p className={styles.paragraph}>Once the criteria are clear, define how decisions will be evaluated.</p>
                  <p className={styles.paragraph}>A system can include:</p>
                  <ul className={styles.list}><li>required questions,</li><li>information sources,</li><li>scoring or thresholds where appropriate,</li><li>decision ownership,</li><li>review points,</li><li>and next actions.</li></ul>
                  <p className={styles.paragraph}>The purpose is consistency.</p>
                </div>
                <div className={styles.frameworkCard}>
                  <h3 className={styles.cardTitle}>3. AI — Support the Analysis</h3>
                  <p className={styles.paragraph}>AI may help:</p>
                  <ul className={styles.list}><li>organize information,</li><li>summarize options,</li><li>compare criteria,</li><li>surface tradeoffs,</li><li>prepare decision briefs,</li><li>or document the reasoning.</li></ul>
                  <p className={styles.paragraph}>But the final responsibility remains human.</p>
                </div>
              </div>
              <p className={styles.paragraph}>Learn more about the <Link href="/discover">Soul → Systems → AI™ framework</Link>.</p>
            </section>

            <section aria-labelledby="what-system-is" className={styles.section}>
              <h2 id="what-system-is" className={styles.sectionTitle}>What a Decision-Making System Is</h2>
              <p className={styles.paragraph}>A decision system is not a spreadsheet for every choice.</p>
              <p className={styles.paragraph}>It is a repeatable structure for choices that occur often enough to matter.</p>
              <p className={styles.paragraph}>For example, a business might create systems for:</p>
              <ul className={styles.list}><li>evaluating new opportunities,</li><li>selecting tools,</li><li>prioritizing projects,</li><li>deciding what to automate,</li><li>assessing partnerships,</li><li>qualifying clients,</li><li>allocating limited time,</li><li>or deciding which ideas move forward.</li></ul>
              <p className={styles.paragraph}>The system should be simple enough that you will actually use it.</p>
            </section>

            <section aria-labelledby="what-not" className={styles.section}>
              <h2 id="what-not" className={styles.sectionTitle}>What It Is Not</h2>
              <p className={styles.paragraph}>A decision-making system is not:</p>
              <ul className={styles.list}><li>a way to guarantee the perfect answer,</li><li>a substitute for experience,</li><li>a replacement for intuition,</li><li>an excuse to avoid responsibility,</li><li>or a scoring formula that automatically makes every choice for you.</li></ul>
              <p className={styles.paragraph}>Some decisions will always require judgment.</p>
              <p className={styles.paragraph}>The system exists to improve the quality and consistency of that judgment.</p>
            </section>

            <section aria-labelledby="seven-parts" className={styles.section}>
              <h2 id="seven-parts" className={styles.sectionTitle}>The Seven Parts of a Useful Decision System</h2>
              <div className={styles.stack}>
                {systemParts.map((part) => (
                  <div className={styles.card} key={part.title}>
                    <h3 className={styles.cardTitle}>{part.title}</h3>
                    {part.intro.map((paragraph) => <p className={styles.paragraph} key={paragraph}>{paragraph}</p>)}
                    {part.items ? <>{part.listIntro ? <p className={styles.paragraph}>{part.listIntro}</p> : null}<ul className={styles.list}>{part.items.map((item) => <li key={item}>{item},</li>)}</ul></> : null}
                    {part.title === '4. Choose the Criteria' ? (
                      <div className={styles.exampleGrid}>
                        <div><p className={styles.splitLabel}>If evaluating a new tool:</p><ul className={styles.list}><li>Does it solve a current problem?</li><li>Does it fit the existing workflow?</li><li>Will it save meaningful time?</li><li>Can the team realistically maintain it?</li><li>Does it duplicate something already in use?</li><li>Is the cost justified?</li></ul></div>
                        <div><p className={styles.splitLabel}>If evaluating a new opportunity:</p><ul className={styles.list}><li>Does it support the current business direction?</li><li>Is the audience aligned?</li><li>Is the time commitment realistic?</li><li>What would need to be delayed or dropped?</li><li>What is the potential upside?</li><li>What risk does it create?</li></ul></div>
                      </div>
                    ) : null}
                    {part.outro.map((paragraph) => <p className={styles.paragraph} key={paragraph}>{paragraph}</p>)}
                  </div>
                ))}
              </div>
            </section>

            <section aria-labelledby="decision-filter" className={styles.section}>
              <h2 id="decision-filter" className={styles.sectionTitle}>A Simple Decision Filter</h2>
              <p className={styles.paragraph}>For recurring opportunities, use a simple filter.</p>
              <div className={styles.cardGrid}>
                {decisionFilter.map(([question, answer]) => <div className={styles.card} key={question}><h3 className={styles.cardTitle}>{question}</h3><p className={styles.paragraph}>{answer}</p></div>)}
              </div>
            </section>

            <section aria-labelledby="opportunity-cost" className={styles.section}>
              <h2 id="opportunity-cost" className={styles.sectionTitle}>Decision-Making and Opportunity Cost</h2>
              <p className={styles.paragraph}>Every yes contains another decision.</p>
              <p className={styles.paragraph}>If you say yes to:</p>
              <ul className={styles.list}><li>a new tool,</li><li>a new project,</li><li>a new partnership,</li><li>a new offer,</li><li>a new marketing channel,</li><li>or a new workflow,</li></ul>
              <p className={styles.paragraph}>you are also choosing where time and attention will go.</p>
              <p className={styles.paragraph}>A decision system should therefore ask:</p>
              <p className={styles.statement}><strong>What does this choice displace?</strong></p>
              <p className={styles.paragraph}>That question protects businesses from accumulating more priorities than they can actually execute.</p>
            </section>

            <section aria-labelledby="not-equal" className={styles.section}>
              <h2 id="not-equal" className={styles.sectionTitle}>Stop Treating Every Decision as Equal</h2>
              <p className={styles.paragraph}>Not every decision deserves the same amount of analysis.</p>
              <p className={styles.paragraph}>A useful decision system separates decisions by consequence.</p>
              <div className={styles.cardGrid}>
                {decisionLevels.map(([heading, examples, note]) => <div className={styles.card} key={heading as string}><h3 className={styles.cardTitle}>{heading}</h3><p className={styles.paragraph}>Examples:</p><ul className={styles.list}>{(examples as string[]).map((example) => <li key={example}>{example},</li>)}</ul><p className={styles.paragraph}>{note}</p></div>)}
              </div>
              <p className={styles.paragraph}>The system should create more scrutiny where the consequences justify it.</p>
            </section>

            <section aria-labelledby="buy-ai-tool" className={styles.section}>
              <h2 id="buy-ai-tool" className={styles.sectionTitle}>Example: Should We Buy Another AI Tool?</h2>
              <p className={styles.paragraph}>Instead of deciding from excitement or fear of missing out, evaluate it through the system.</p>
              <div className={styles.stack}>
                <div className={styles.exampleCard}><h3 className={styles.cardTitle}>Decision</h3><p className={styles.paragraph}>Should we add this AI tool to our business?</p></div>
                <div className={styles.exampleCard}><h3 className={styles.cardTitle}>Desired Outcome</h3><p className={styles.paragraph}>Reduce the time spent on a specific recurring process.</p></div>
                <div className={styles.exampleCard}><h3 className={styles.cardTitle}>Criteria</h3><ul className={styles.list}><li>solves a documented problem,</li><li>fits current workflow,</li><li>saves meaningful time,</li><li>does not duplicate existing software,</li><li>cost is justified,</li><li>output can be reviewed,</li><li>maintenance burden is acceptable.</li></ul></div>
                <div className={styles.exampleCard}><h3 className={styles.cardTitle}>Constraints</h3><ul className={styles.list}><li>budget,</li><li>available setup time,</li><li>technical ability,</li><li>privacy/security requirements.</li></ul></div>
                <div className={styles.exampleCard}><h3 className={styles.cardTitle}>Decision Owner</h3><p className={styles.paragraph}>One clearly identified person.</p></div>
                <div className={styles.exampleCard}><h3 className={styles.cardTitle}>Deadline</h3><p className={styles.paragraph}>A defined review date.</p></div>
                <div className={styles.exampleCard}><h3 className={styles.cardTitle}>Next Step</h3><p className={styles.paragraph}>Pilot or reject.</p></div>
              </div>
              <p className={styles.paragraph}>This is far more useful than:</p><p className={styles.statement}><strong>“Everyone seems to be using it.”</strong></p>
              <p className={styles.paragraph}><Link href="/guides/ai-tools-vs-business-systems">AI tools and business systems solve different problems</Link>.</p>
            </section>

            <section aria-labelledby="automate-process" className={styles.section}>
              <h2 id="automate-process" className={styles.sectionTitle}>Example: Should We Automate This Process?</h2>
              <p className={styles.paragraph}>Use the same structure.</p><p className={styles.paragraph}>First ask:</p>
              <ul className={styles.list}><li>Does the process already work?</li><li>Is it repeatable?</li><li>Is the outcome clear?</li><li>Are the inputs reliable?</li><li>Can exceptions be identified?</li><li>Would automation save meaningful effort?</li><li>Can errors be detected and corrected?</li></ul>
              <p className={styles.paragraph}>If not, the next step may be improving the process rather than automating it.</p>
              <p className={styles.paragraph}>Learn <Link href="/guides/what-to-automate-in-your-business">how to know what to automate in your business</Link>.</p>
            </section>

            <section aria-labelledby="more-data" className={styles.section}>
              <h2 id="more-data" className={styles.sectionTitle}>Why More Data Does Not Always Create a Better Decision</h2>
              <p className={styles.paragraph}>One of the easiest ways to avoid a decision is to keep gathering information.</p>
              <p className={styles.paragraph}>More:</p><ul className={styles.list}><li>research,</li><li>opinions,</li><li>comparisons,</li><li>analytics,</li><li>recommendations,</li><li>and AI-generated options</li></ul>
              <p className={styles.paragraph}>can feel productive.</p><p className={styles.paragraph}>But eventually, additional information stops improving the decision.</p>
              <p className={styles.paragraph}>A decision system should define what information is actually required.</p><p className={styles.paragraph}>Once that threshold is reached, the work shifts from research to judgment.</p>
            </section>

            <section aria-labelledby="ai-help" className={styles.section}>
              <h2 id="ai-help" className={styles.sectionTitle}>Where AI Can Help With Decision-Making</h2>
              <p className={styles.paragraph}>AI can be useful as a support layer.</p>
              <div className={styles.cardGrid}>
                <div className={styles.card}><h3 className={styles.cardTitle}>Organize Information</h3><p className={styles.paragraph}>Summarize source material or arrange facts around your criteria.</p></div>
                <div className={styles.card}><h3 className={styles.cardTitle}>Compare Options</h3><p className={styles.paragraph}>Create a structured comparison based on criteria you provide.</p></div>
                <div className={styles.card}><h3 className={styles.cardTitle}>Surface Missing Information</h3><p className={styles.paragraph}>Identify areas where an option cannot yet be evaluated.</p></div>
                <div className={styles.card}><h3 className={styles.cardTitle}>Explore Tradeoffs</h3><p className={styles.paragraph}>Help articulate what may be gained or lost under different choices.</p></div>
                <div className={styles.card}><h3 className={styles.cardTitle}>Document the Decision</h3><p className={styles.paragraph}>Create a summary of the decision, criteria, information considered, reasoning, final choice, and next actions.</p></div>
              </div>
              <p className={styles.paragraph}>But AI should not quietly choose your priorities for you.</p><p className={styles.paragraph}>Those come from the business.</p>
            </section>

            <section aria-labelledby="criteria-human" className={styles.section}>
              <h2 id="criteria-human" className={styles.sectionTitle}>Do Not Outsource the Criteria to AI</h2>
              <p className={styles.paragraph}>This distinction matters.</p><p className={styles.paragraph}>AI can apply criteria.</p><p className={styles.paragraph}>It should not automatically decide what your criteria should be.</p>
              <p className={styles.paragraph}>For example, if AI evaluates three marketing opportunities, you should first determine whether the business currently values:</p>
              <ul className={styles.list}><li>reach,</li><li>profitability,</li><li>speed,</li><li>relationship depth,</li><li>brand alignment,</li><li>recurring revenue,</li><li>or something else.</li></ul>
              <p className={styles.paragraph}>The criteria encode your priorities.</p><p className={styles.paragraph}>That is a human responsibility.</p>
            </section>

            <section aria-labelledby="decision-rules" className={styles.section}>
              <h2 id="decision-rules" className={styles.sectionTitle}>Build Decision Rules From Repeated Decisions</h2>
              <p className={styles.paragraph}>One advantage of a decision system is that repeated judgment can eventually become clearer policy.</p>
              <p className={styles.paragraph}>For example:</p>
              <p className={styles.paragraph}>Instead of repeatedly deciding whether to schedule a discovery call, you might establish qualification criteria.</p>
              <p className={styles.paragraph}>Instead of repeatedly deciding whether a task should be automated, you might establish an automation-readiness test.</p>
              <p className={styles.paragraph}>Instead of repeatedly deciding whether to purchase software, you might establish a tool-adoption checklist.</p>
              <p className={styles.paragraph}>When recurring decisions become clearer, the business becomes easier to operate.</p>
            </section>

            <section aria-labelledby="decision-record" className={styles.section}>
              <h2 id="decision-record" className={styles.sectionTitle}>Create a Decision Record</h2>
              <p className={styles.paragraph}>For important recurring decisions, document:</p>
              <ul className={styles.list}><li>date,</li><li>decision,</li><li>options,</li><li>criteria,</li><li>important information,</li><li>assumptions,</li><li>final choice,</li><li>owner,</li><li>expected outcome,</li><li>review date.</li></ul>
              <p className={styles.paragraph}>This helps you learn from actual decisions rather than from memory.</p>
              <p className={styles.paragraph}>Later, you can ask:</p>
              <ul className={styles.list}><li>Was the assumption correct?</li><li>Did the expected outcome occur?</li><li>Did we underestimate complexity?</li><li>Which criteria mattered most?</li><li>Should the decision rule change?</li></ul>
              <p className={styles.paragraph}>That turns decision-making into an improving system.</p>
            </section>

            <section aria-labelledby="emotional-whiplash" className={styles.section}>
              <h2 id="emotional-whiplash" className={styles.sectionTitle}>Decision Systems Reduce Emotional Whiplash</h2>
              <p className={styles.paragraph}>A new opportunity can feel urgent.</p><p className={styles.paragraph}>A disappointing week can make a strategy feel broken.</p><p className={styles.paragraph}>A competitor&apos;s announcement can make your priorities suddenly feel outdated.</p><p className={styles.paragraph}>A new AI tool can make your current workflow feel inadequate.</p>
              <p className={styles.paragraph}>A decision system creates space between the stimulus and the response.</p>
              <p className={styles.paragraph}>Instead of immediately changing direction, you return to:</p><ul className={styles.list}><li>the objective,</li><li>the criteria,</li><li>the constraints,</li><li>and the current priorities.</li></ul>
              <p className={styles.paragraph}>That does not eliminate emotion.</p><p className={styles.paragraph}>It prevents emotion from having to carry the entire decision.</p>
              <p className={styles.paragraph}>
                A clear filter can also help you{' '}
                <Link href="/guides/ai-for-overwhelmed-entrepreneurs">
                  reduce AI overwhelm by making fewer, clearer decisions
                </Link>.
              </p>
            </section>

            <section aria-labelledby="decision-template" className={styles.section}>
              <h2 id="decision-template" className={styles.sectionTitle}>A Practical Decision Template</h2>
              <p className={styles.paragraph}>Use this structure for a real business decision:</p>
              <ol className={styles.questionList}>
                <li><strong>Decision</strong>What exactly are we deciding?</li><li><strong>Desired Outcome</strong>What result are we trying to create?</li><li><strong>Why Now?</strong>Why does this decision need attention?</li><li><strong>Criteria</strong>What must be true for an option to make sense?</li><li><strong>Constraints</strong>What limits must be respected?</li><li><strong>Options</strong>What realistic choices exist?</li><li><strong>Information Needed</strong>What do we need to know before deciding?</li><li><strong>Decision Owner</strong>Who makes the final call?</li><li><strong>Deadline</strong>When will the decision be made?</li><li><strong>Choice</strong>What did we decide?</li><li><strong>Next Action</strong>What happens now?</li><li><strong>Review Date</strong>When will we determine whether the decision worked?</li>
              </ol>
            </section>

            <RelatedGuides guides={relatedGuides} />

            <section aria-labelledby="better-decisions" className={`${styles.section} ${styles.closing}`}>
              <h2 id="better-decisions" className={styles.sectionTitle}>Better Decisions Make Better Systems Possible</h2>
              <p className={styles.paragraph}>A business cannot create consistent systems around constantly changing decisions.</p>
              <p className={styles.paragraph}>Before you automate, standardize, or delegate, someone has to decide:</p>
              <ul className={styles.list}><li>what matters,</li><li>what the rules are,</li><li>what good looks like,</li><li>and what happens next.</li></ul>
              <p className={styles.paragraph}>That is why iPurpose begins with clarity.</p>
              <p className={styles.statement}><strong>Soul → Systems → AI™</strong></p>
              <p className={styles.paragraph}>Clarify the decision.</p><p className={styles.paragraph}>Build the structure.</p><p className={styles.paragraph}>Then use technology to support what the business has intentionally chosen.</p>
            </section>

            <aside className={styles.cta}>
              <p className={styles.ctaEyebrow}>Start with the decision</p>
              <h2 className={styles.ctaTitle}>What actually needs your attention next?</h2>
              <p className={styles.ctaBody}>The free iPurpose Clarity Check can help you identify whether the real blocker is unclear direction, missing systems, or the way AI is currently being used.</p>
              <Link href="/clarity-check" className={styles.primaryCta}>Take the Free Clarity Check</Link>
              <p className={styles.secondaryCta}>Ready to turn clearer decisions into practical operating systems? <Link href="/program">Explore the iPurpose Accelerator™</Link></p>
            </aside>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
