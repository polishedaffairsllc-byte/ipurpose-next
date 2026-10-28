import type { Metadata } from 'next';
import Image from 'next/image';
import PublicHeader from '../components/PublicHeader';
import Footer from '../components/Footer';
import PitchTracking from './PitchTracking';
import './pitch.css';

export const metadata: Metadata = {
  title: 'iPurpose · The Found(her)s Stage',
  description: 'Clarity, systems and AI in one connected path. Prepared for The Found(her)s Stage.',
  alternates: { canonical: 'https://ipurposesoul.com/foundhers-stage' },
  robots: { index: false, follow: false, noarchive: true },
};

function CTA({ href, id, section, children, secondary = false }: { href: string; id: string; section: string; children: React.ReactNode; secondary?: boolean }) {
  return <a href={href} data-cta-id={id} data-section={section} className={`pitch-cta${secondary ? ' pitch-secondary' : ''}`}>{children}<span aria-hidden="true"> ↗</span></a>;
}
const products = [
  ['Free', 'Clarity Check', '/clarity-check'], ['$27', 'Starter Pack', '/starter-pack'], ['$47', 'AI Blueprint', '/ai-blueprint'],
  ['$59/month', 'Membership', '/deepen'], ['$1,997', 'Accelerator', '/build'],
];

export default function FoundhersStagePage() {
  return <PitchTracking><PublicHeader /><main id="main-content" className="foundhers">
    <section className="pitch-hero pitch-wrap">
      <p className="pitch-eyebrow">The Found(her)s Stage · Founder Pitch</p>
      <h1>AI can make people faster.<br /><em>It cannot tell them what is worth doing.</em></h1>
      <p className="pitch-lead">iPurpose is an AI-enabled learning and decision-support platform that helps creators move from uncertainty and scattered ideas into clarity, structure and consistent action.</p>
      <p className="pitch-framework">Soul <span>→</span> Systems <span>→</span> AI</p>
      <div className="pitch-actions"><CTA href="/discover" id="hero_explore" section="hero">Explore the iPurpose Experience</CTA><CTA href="/clarity-check" id="hero_clarity_check" section="hero" secondary>Take the Clarity Check</CTA></div>
    </section>
    <section className="pitch-band"><div className="pitch-wrap pitch-two">
      <h2>More tools. More AI.<br />Still no direction.</h2>
      <div><p>People have more access than ever to information, courses, productivity tools and generative AI. But access to tools does not answer the questions that come first:</p>
        <ul><li>What should I actually build?</li><li>What deserves my attention?</li><li>Which idea should I pursue?</li><li>What should I do next?</li><li>How should AI support the work without creating more overwhelm?</li></ul>
        <p className="pitch-emphasis">The missing layer is direction.</p></div>
    </div></section>
    <section className="pitch-wrap pitch-section"><h2>Clarity before automation.</h2>
      <div className="pitch-thirds">{[['Soul', 'Clarity, direction, strengths, priorities and purpose.'], ['Systems', 'Structure, planning, decision-making and execution.'], ['AI', 'Personalized support, acceleration, automation and guidance.']].map(([title, body], i) => <div key={title}><span className="pitch-number">0{i + 1}</span><h3>{title}</h3><p>{body}</p></div>)}</div>
      <p className="pitch-flow">Clarity → Direction → Structure → AI-supported execution</p><p className="pitch-emphasis">AI with context—not a blank prompt.</p>
    </section>
    <section className="pitch-band"><div className="pitch-wrap pitch-section"><h2>One account. One profile. One journey.</h2>
      <div className="pitch-journey">{[
        ['Clarity Check', 'An assessment of stage and patterns that creates a more useful starting point.', '/clarity-check'],
        ['Compass', 'AI-supported guidance that carries the user’s context forward.', '/ai'],
        ['Learning products', 'Starter Pack and AI Blueprint provide structured ways to build clarity and practical AI capability.', '/starter-pack'],
        ['Ongoing support', 'Membership and the Accelerator provide deeper, continuing support.', '/deepen'],
      ].map(([title, body, href], i) => <div key={title}><h3>{title}</h3><p>{body}</p><CTA href={href} id={`journey_${i}`} section="journey" secondary>Explore {title}</CTA></div>)}</div>
      <p>The mobile app and website are designed as parts of the same experience—not disconnected products.</p>
    </div></section>
    <section className="pitch-wrap pitch-section"><h2>Clarity, systems and AI in one path.</h2>
      <p>Generic AI can help execute. Courses can teach. Coaching can guide. iPurpose is designed to connect the pieces—starting with clarity, carrying context forward and using AI inside a structured path.</p>
      <dl className="pitch-comparison">{[
        ['Generic AI', 'Starts with a user prompt; open-ended; general-purpose AI support.'], ['Courses', 'Start with course content; curriculum-based.'],
        ['Coaching', 'Starts with conversation; relationship-based guidance.'], ['iPurpose', 'Guided clarity + goals; Soul → Systems → AI; integrated AI execution; context designed into the journey.'],
      ].map(([name, body]) => <div key={name}><dt>{name}</dt><dd>{body}</dd></div>)}</dl>
      <p className="pitch-note">Different products vary; this compares the typical model of each category.</p>
    </section>
    <section className="pitch-dark"><div className="pitch-wrap pitch-section"><h2>Capable people with ideas who need a path, not more information.</h2>
      <p>iPurpose is initially focused on creators and early-stage entrepreneurs with expertise or ideas who struggle to turn them into a clear offer, priorities and consistent execution.</p>
      <p className="pitch-emphasis">AI access is becoming a commodity. Applying it with direction is the scarce skill.</p>
    </div></section>
    <section className="pitch-wrap pitch-section"><p className="pitch-eyebrow">September 1–28, 2026</p><h2>Early behavior, measured.</h2>
      <dl className="pitch-metrics">{[['85', 'active users'], ['43', 'viewed products'], ['15', 'started forms'], ['10', 'began checkout, generating 24 begin-checkout events'], ['11', 'structured beta participants across two programs']].map(([n, label]) => <div key={n}><dt>{n}</dt><dd>{label}</dd></div>)}</dl>
      <p className="pitch-note"><strong>Begin-checkout is buying intent, not completed purchases.</strong></p>
      <p>People are doing more than visiting. They are entering the experience, exploring products, initiating forms, participating in structured beta programs and beginning the buying journey.</p>
    </section>
    <section className="pitch-band"><div className="pitch-wrap pitch-section"><h2>A path from free exploration to deeper support.</h2>
      <ol className="pitch-products">{products.map(([price, name, href], i) => <li key={name}><span>{price}</span><h3>{name}</h3><CTA href={href} id={`product_${i}`} section="products" secondary>Explore {name}</CTA></li>)}</ol>
      <p>The product ladder gives users multiple ways to enter based on readiness and deepen their engagement as their needs grow.</p>
    </div></section>
    <section className="pitch-wrap pitch-section"><h2>Built by an operator who understands both sides of the problem.</h2>
      <div className="pitch-founder"><Image src="/images/renita-hamilton.jpg" alt="Renita Hamilton, founder and CEO of iPurpose" width={480} height={640} sizes="(max-width: 700px) 100vw, 360px" />
        <div><h3>Renita Hamilton, MPS</h3><p className="pitch-eyebrow">Founder &amp; CEO</p><blockquote>I built iPurpose because I believe AI should expand people’s agency—not simply give them more things to do.</blockquote>
          <p className="pitch-emphasis"><strong>More than three decades of leadership, service and turning vision into action.</strong></p>
          <p>An entrepreneur, educator and servant leader, her experience spans business, education, civic engagement, nonprofit leadership, philanthropy and community advocacy.</p>
          <p>Today, she brings that breadth of leadership, strategy, lived experience and entrepreneurial spirit to <strong>iPurpose</strong>, extending that legacy at the intersection of human potential, practical systems and AI.</p>
          <p>At the heart of her work is a commitment to helping people cultivate the best in themselves—and to creating a stronger future for individuals, communities and the generations that follow.</p>
        </div></div>
    </section>
    <section className="pitch-band"><div className="pitch-wrap pitch-section"><h2>From built and validating to repeatable growth.</h2>
      <p>The next question is no longer whether iPurpose can be built. It is whether we can repeatedly acquire the right users, deliver measurable value, move them toward paid conversion and retain them.</p>
      <ul className="pitch-priorities">{['Customer segmentation', 'Positioning', 'Acquisition', 'Conversion', 'Retention', 'Pricing and packaging', 'Measurable outcomes'].map(item => <li key={item}>{item}</li>)}</ul>
      <h2>What $1,000 + three months of advisory can unlock</h2><div className="pitch-two"><div><h3>Grant · 30-day validation experiment</h3><dl className="pitch-comparison"><div><dt>$600</dt><dd>Targeted acquisition testing</dd></div><div><dt>$250</dt><dd>Customer research incentives</dd></div><div><dt>$150</dt><dd>Creative + conversion testing</dd></div></dl>
      <p><strong>Goal:</strong> Identify the audience and message most likely to move the right users from discovery → engagement → paid intent.</p></div>
      <div><h3>Advisory</h3><p className="pitch-flow">Segment → Position → Price → Acquire → Convert → Retain</p><p>The objective is to leave the advisory period with fewer assumptions, a sharper operating thesis and a prioritized 12-month growth roadmap.</p></div></div>
    </div></section>
    <section className="pitch-wrap pitch-section pitch-close"><h2>The future of AI is not just helping people do more. It is helping people know what deserves to be done.</h2>
      <p className="pitch-brand">iPurpose</p><p className="pitch-framework">Soul → Systems → AI</p>
      <div className="pitch-actions"><CTA href="/discover" id="final_explore" section="final">Explore iPurpose</CTA><CTA href="/clarity-check" id="final_clarity_check" section="final" secondary>Take the Clarity Check</CTA></div>
    </section>
  </main><Footer /></PitchTracking>;
}
