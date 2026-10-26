import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PitchAnalytics from './PitchAnalytics';

const C = {
  indigo: '#4B4E6D',
  lavender: '#9C88FF',
  peach: '#FCC4B7',
  sage: '#88B04B',
  gold: '#E6C87C',
  mist: '#F5F7FA',
  ink: '#1E2433',
};

type PitchConfig = {
  code: string;
  audienceName: string;
  recipientLine: string;
  heroBadge: string;
  heroTitle: string;
  heroSub: string;
  whyTitle: string;
  whySub: string;
  firstCardTitle: string;
  firstCardBody: string;
  ask: string;
  askSub: string;
  nextStep: string;
};

const configs: Record<string, PitchConfig> = {
  'ghana-jh': {
    code: 'johnnie_hayford',
    audienceName: 'SDSN Youth Ghana',
    recipientLine: 'Prepared for Johnnie Kojo Hayford, Network Coordinator, SDSN Youth Ghana',
    heroBadge: 'iPurpose × SDSN Youth Ghana',
    heroTitle: 'Ghana Discovery Pilot Partnership Concept',
    heroSub: 'An 8-week pilot connecting self-discovery, AI-guided decision support and verified Ghana pathways into education, employability and entrepreneurship.',
    whyTitle: 'Why SDSN Youth Ghana is the right first partner',
    whySub: 'The network already combines youth mobilization, universities and practical sustainable-development action.',
    firstCardTitle: 'Built-in Ghana network',
    firstCardBody: 'SDSN Youth Ghana is hosted by the University of Ghana, University of Education, Winneba, and Millennium Promise Alliance Ghana.',
    ask: 'Would SDSN Youth Ghana be open to exploring an 8-week iPurpose pilot with up to 100 Ghanaian youth, potentially in collaboration with one or more host institutions?',
    askSub: 'If there is mutual fit, we would jointly refine the cohort, safeguards, local opportunity layer and evaluation plan before recruitment begins.',
    nextStep: 'A 30-minute exploratory conversation to test fit, identify the right host-institution role and determine whether the pilot is worth developing together.',
  },
  'africa-lm': {
    code: 'lara_mugala',
    audienceName: 'SDSN Youth Africa',
    recipientLine: 'Prepared for Lara Mugala, Regional Focal Point, Africa',
    heroBadge: 'iPurpose × SDSN Youth Africa',
    heroTitle: 'Ghana Discovery Pilot with Africa Replication Pathway',
    heroSub: 'A Ghana-first learning pilot designed to test whether personalized AI-guided navigation can support youth employability and opportunity discovery — with evidence that could inform broader African replication.',
    whyTitle: 'Why SDSN Youth Africa is the right regional partner',
    whySub: 'The regional network combines local youth leadership, institutions and cross-country collaboration.',
    firstCardTitle: 'Regional network reach',
    firstCardBody: 'SDSN Youth Africa connects national and regional youth networks with local coordinators, institutions and cross-country collaboration.',
    ask: 'Would SDSN Youth Africa be open to exploring an 8-week iPurpose pilot beginning in Ghana with up to 100 participants, designed as an evidence-building first step for possible replication across additional African youth networks?',
    askSub: 'If there is mutual fit, we would jointly refine the Ghana cohort, safeguards, local opportunity layer, evaluation plan and regional learning approach before recruitment begins.',
    nextStep: 'A 30-minute exploratory conversation to assess regional fit and determine whether Ghana should serve as the initial implementation market.',
  },
  'global-partnership': {
    code: 'global_partnership',
    audienceName: 'SDSN Youth Global Partnerships',
    recipientLine: 'Prepared for SDSN Youth Global Partnerships',
    heroBadge: 'iPurpose × SDSN Youth',
    heroTitle: 'Ghana Discovery Pilot & African Replication Partnership',
    heroSub: 'A locally grounded Ghana pilot designed to produce measurable evidence before any broader replication across SDSN Youth’s African networks.',
    whyTitle: 'Why SDSN Youth is the right scaling partner',
    whySub: 'SDSN Youth combines global reach with national and regional youth infrastructure for locally grounded action.',
    firstCardTitle: 'Global-to-local network',
    firstCardBody: 'SDSN Youth combines a global platform with national and regional networks, allowing a pilot to be locally grounded and potentially replicated.',
    ask: 'Would SDSN Youth be open to exploring an 8-week iPurpose pilot with SDSN Youth Ghana as an evidence-building first step toward possible replication across additional African youth networks?',
    askSub: 'If there is mutual fit, we would jointly refine the Ghana cohort, safeguards, local opportunity layer, evaluation plan and learning approach before recruitment begins.',
    nextStep: 'A 30-minute exploratory partnership conversation to determine whether a Ghana-first pilot fits SDSN Youth’s current priorities and partnership model.',
  },
};

export async function generateMetadata({ params }: { params: Promise<{ audience: string }> }): Promise<Metadata> {
  const { audience } = await params;
  const config = configs[audience];
  if (!config) return {};
  return {
    title: `${config.heroTitle} · iPurpose`,
    description: config.heroSub,
    robots: { index: false, follow: false, nocache: true },
  };
}

function Section({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <section className="w-full py-14 sm:py-16" style={{ background: dark ? `linear-gradient(145deg, ${C.indigo}, #252943)` : '#ffffff' }}>
      <div className="mx-auto max-w-6xl px-6 sm:px-10">{children}</div>
    </section>
  );
}

function Kicker({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return <div className="mb-3 text-xs font-bold uppercase tracking-[0.18em]" style={{ color: light ? C.gold : C.lavender }}>{children}</div>;
}

function Card({ title, children, accent = C.lavender }: { title: string; children: React.ReactNode; accent?: string }) {
  return (
    <div className="rounded-2xl p-6 sm:p-7" style={{ background: '#ffffff', border: `1px solid ${accent}55`, boxShadow: '0 16px 40px rgba(37,41,67,.08)' }}>
      <h3 className="mb-3 text-xl font-bold" style={{ color: accent }}>{title}</h3>
      <div className="text-base leading-7" style={{ color: C.indigo }}>{children}</div>
    </div>
  );
}

export default async function SDSNPitchPage({ params }: { params: Promise<{ audience: string }> }) {
  const { audience } = await params;
  const config = configs[audience];
  if (!config) notFound();

  return (
    <main className="min-h-screen" style={{ background: C.mist }}>
      <PitchAnalytics audience={config.code} />

      <section className="relative overflow-hidden px-6 py-16 sm:px-10 sm:py-20" style={{ background: `linear-gradient(145deg, ${C.indigo} 0%, #30344f 100%)` }}>
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full opacity-80" style={{ background: C.lavender }} />
        <div className="absolute -bottom-24 right-10 h-64 w-64 rounded-full opacity-75" style={{ background: C.peach }} />
        <div className="relative mx-auto max-w-6xl">
          <div className="mb-6 inline-flex rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.14em]" style={{ borderColor: C.gold, color: C.gold }}>{config.heroBadge}</div>
          <h1 className="max-w-4xl text-4xl font-bold leading-tight sm:text-6xl" style={{ color: '#fff' }}>{config.heroTitle}</h1>
          <p className="mt-8 max-w-3xl text-lg leading-8 sm:text-xl" style={{ color: 'rgba(255,255,255,.80)' }}>{config.heroSub}</p>

          <div className="mt-10 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
            {['Up to 100 participants', 'Initial pilot fee: waived', '8-week evaluation'].map((item, i) => (
              <div key={item} className="rounded-xl px-4 py-3 text-center text-sm font-semibold" style={{ background: i === 0 ? '#fff' : i === 1 ? '#FFF2EE' : '#F2F7EA', color: C.indigo }}>{item}</div>
            ))}
          </div>

          <div className="mt-10 text-sm leading-6" style={{ color: 'rgba(255,255,255,.72)' }}>
            <div>{config.recipientLine}</div>
            <div className="mt-2 font-semibold" style={{ color: '#fff' }}>Renita Hamilton, MPS · Founder, iPurpose</div>
            <div>Strategic Leadership · Social Impact · AI-Enabled Human Development</div>
          </div>
        </div>
      </section>

      <Section>
        <Kicker>Why Ghana · Why now</Kicker>
        <h2 className="max-w-4xl text-3xl font-bold sm:text-4xl" style={{ color: C.indigo }}>The demographic need and digital-policy direction are converging.</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <Card title="36.9%"><strong>of Ghana’s projected population is age 15–35.</strong></Card>
          <Card title="21.9%" accent={C.peach}><strong>average unemployment among people age 15–35 in the first three quarters of 2025.</strong></Card>
          <Card title="2025–2035" accent={C.sage}><strong>Ghana National AI Strategy: human capital, education, local relevance and practical AI adoption.</strong></Card>
        </div>
        <div className="mt-10 rounded-2xl p-6 text-lg font-semibold leading-8" style={{ background: '#F3F0FF', color: C.indigo }}>
          The opening for iPurpose is not simply “career matching.” It is helping young adults translate self-knowledge into an actionable next step inside a rapidly changing economy.
        </div>
      </Section>

      <Section dark>
        <Kicker light>Partnership fit</Kicker>
        <h2 className="max-w-5xl text-3xl font-bold sm:text-4xl" style={{ color: '#fff' }}>{config.whyTitle}</h2>
        <p className="mt-3 max-w-4xl text-base leading-7" style={{ color: 'rgba(255,255,255,.72)' }}>{config.whySub}</p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,.08)', border: `1px solid ${C.lavender}80` }}>
            <h3 className="mb-3 text-xl font-bold" style={{ color: C.lavender }}>{config.firstCardTitle}</h3>
            <p className="text-base leading-7" style={{ color: 'rgba(255,255,255,.82)' }}>{config.firstCardBody}</p>
          </div>
          <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,.08)', border: `1px solid ${C.sage}80` }}>
            <h3 className="mb-3 text-xl font-bold" style={{ color: '#BBD996' }}>Direct mission fit</h3>
            <p className="text-base leading-7" style={{ color: 'rgba(255,255,255,.82)' }}>Youth capacity, education, employability, practical solutions and pathways to action all sit directly within SDSN Youth’s work.</p>
          </div>
          <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,.08)', border: `1px solid ${C.gold}80` }}>
            <h3 className="mb-3 text-xl font-bold" style={{ color: C.gold }}>Existing Africa collaboration</h3>
            <p className="text-base leading-7" style={{ color: 'rgba(255,255,255,.82)' }}>In May 2026, SDSN Youth networks from Ghana, Kenya, Nigeria, South Africa, Cameroon and Benin collaborated on “Empowering Youth for Employability.”</p>
          </div>
        </div>
      </Section>

      <Section>
        <Kicker>The iPurpose continuation layer</Kicker>
        <h2 className="text-3xl font-bold sm:text-4xl" style={{ color: C.indigo }}>From one-time insight to ongoing navigation.</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-5">
          {[
            ['Clarity', 'What is happening in my life?'],
            ['Purpose', 'What strengths, interests and patterns are emerging?'],
            ['Compass', 'What should I explore or do next?'],
            ['Opportunity', 'Which verified Ghana-specific pathways fit?'],
            ['Action', 'What did I actually do — and what comes next?'],
          ].map(([name, body], i) => (
            <div key={name} className="rounded-2xl p-5 text-center" style={{ background: i % 2 ? '#FFF4F1' : '#F3F0FF', border: '1px solid rgba(75,78,109,.10)' }}>
              <div className="text-sm font-bold uppercase tracking-wider" style={{ color: C.indigo }}>{name}</div>
              <div className="mt-3 text-sm leading-6" style={{ color: C.indigo }}>{body}</div>
            </div>
          ))}
        </div>
        <p className="mt-8 text-lg font-semibold" style={{ color: C.indigo }}>The differentiator: iPurpose stays with the participant after the assessment and can support repeated decisions over time.</p>
      </Section>

      <Section dark>
        <Kicker light>Proposed 8-week pilot</Kicker>
        <h2 className="max-w-5xl text-3xl font-bold sm:text-4xl" style={{ color: '#fff' }}>{config.ask}</h2>
        <p className="mt-5 max-w-4xl text-base leading-7" style={{ color: 'rgba(255,255,255,.76)' }}>{config.askSub}</p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            ['100-person SDSN cohort', 'University students, recent graduates and young professionals age 18+ recruited with the participating network and host institutions.'],
            ['50-person open comparison', 'A separately recruited Ghana cohort helps distinguish network-distribution effects from broader product demand.'],
            ['Weekly learning loop', 'Usage analytics, short check-ins and selected interviews reveal where language, recommendations, product flow or local context needs adjustment.'],
          ].map(([title, body], i) => (
            <div key={title} className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,.08)', borderLeft: `5px solid ${[C.lavender,C.sage,C.gold][i]}` }}>
              <h3 className="text-lg font-bold" style={{ color: '#fff' }}>{title}</h3>
              <p className="mt-3 text-sm leading-6" style={{ color: 'rgba(255,255,255,.74)' }}>{body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <Kicker>What success looks like</Kicker>
        <h2 className="text-3xl font-bold sm:text-4xl" style={{ color: C.indigo }}>Downloads are not the goal. Progress from uncertainty toward action is.</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {['Activation: onboarding completion','Self-discovery: Clarity/Purpose completion','Compass use: repeat AI-guided navigation','Retention: week 2 / 4 / 8 return','Opportunity: verified pathway clicks','Action: reported real-world next steps'].map((item) => (
            <div key={item} className="rounded-xl border bg-white p-5 text-base font-semibold" style={{ borderColor: '#E3E5EE', color: C.indigo }}>{item}</div>
          ))}
        </div>
        <div className="mt-8 rounded-2xl p-6" style={{ background: C.ink, color: '#fff' }}><strong>Core outcome question:</strong> “How clear are you about what you should do next?” — measured at entry and closeout.</div>
      </Section>

      <Section>
        <Kicker>Guardrails</Kicker>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ['Decision support — not counselling', 'iPurpose is not positioned as a mental-health service, diagnostic tool or replacement for professional counselling or career services.'],
            ['Verified local opportunities', 'For Ghana-specific programs and opportunities, verified sources take priority over model memory; uncertain information is clearly labeled.'],
            ['18+ initial cohort', 'The first pilot avoids additional minor-consent and safeguarding complexity while product-market fit is being established.'],
            ['Data minimization', 'Collect only what is needed for the experience and pilot evaluation; clearly state purpose, retention and deletion choices.'],
            ['Aggregated reporting', 'Network partners receive cohort-level findings; individual participant content is not casually exposed through reporting.'],
            ['Compliance review before launch', 'Cross-border processing, consent, controller responsibilities and Ghana data-protection requirements are confirmed before recruitment.'],
          ].map(([title, body]) => <Card key={title} title={title}>{body}</Card>)}
        </div>
      </Section>

      <Section dark>
        <Kicker light>Founder</Kicker>
        <h2 className="text-3xl font-bold sm:text-4xl" style={{ color: '#fff' }}>Renita Hamilton, MPS</h2>
        <p className="mt-2 text-lg font-semibold" style={{ color: C.lavender }}>Founder, iPurpose · Strategic Leadership · Social Impact · AI-Enabled Human Development</p>
        <p className="mt-5 max-w-4xl text-base leading-7" style={{ color: 'rgba(255,255,255,.78)' }}>
          Renita brings more than two decades of nonprofit development, leadership, philanthropy and community-impact experience to iPurpose. She holds a Master of Professional Studies in Strategic Leadership and is building iPurpose around a simple premise: self-knowledge becomes more useful when it can be translated into coherent systems and concrete next steps.
        </p>
      </Section>

      <Section>
        <Kicker>Immediate next step</Kicker>
        <h2 className="max-w-4xl text-3xl font-bold sm:text-4xl" style={{ color: C.indigo }}>{config.nextStep}</h2>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <a data-pitch-action="email_founder" href="mailto:renita@ipurposesoul.com?subject=iPurpose%20%C3%97%20SDSN%20Youth%20Pilot" className="rounded-full px-7 py-4 text-center text-base font-bold text-white" style={{ background: `linear-gradient(90deg, ${C.lavender}, ${C.indigo})` }}>Email Renita</a>
          <a data-pitch-action="visit_ipurpose" href="https://ipurposesoul.com" className="rounded-full border px-7 py-4 text-center text-base font-bold" style={{ borderColor: C.indigo, color: C.indigo }}>Visit iPurpose</a>
        </div>
        <p className="mt-8 text-sm leading-6" style={{ color: '#6F7489' }}>This is an unlisted, no-index concept page prepared for exploratory partnership discussion. No funding, procurement, exclusivity, endorsement or long-term commitment is being requested at this stage.</p>
      </Section>

      <section className="border-t bg-white px-6 py-8" style={{ borderColor: '#E5E7EF' }}>
        <div className="mx-auto flex max-w-6xl flex-col gap-3 text-xs sm:flex-row sm:items-center sm:justify-between" style={{ color: '#707589' }}>
          <div>© 2026 iPurpose. All rights reserved. · Soul . Systems . AI.</div>
          <div className="flex flex-wrap gap-4">
            <a data-pitch-action="source_sdsn_ghana" href="https://sdsnyouth.org/globalnetworks/africa/sdsn-youth-ghana" target="_blank" rel="noopener noreferrer">SDSN Youth Ghana</a>
            <a data-pitch-action="source_sdsn_youth" href="https://www.sdsnyouth.org/" target="_blank" rel="noopener noreferrer">SDSN Youth</a>
            <a data-pitch-action="source_ghana_ai" href="https://moc.gov.gh/2026/04/24/ghana-launches-national-ai-strategy-to-drive-digital-transformation-and-economic-growth/" target="_blank" rel="noopener noreferrer">Ghana AI Strategy</a>
          </div>
        </div>
      </section>
    </main>
  );
}
