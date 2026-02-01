import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Card from "../../components/Card";
import SectionHeading from "../../components/SectionHeading";
import Button from "../../components/Button";
import { firebaseAdmin } from "@/lib/firebaseAdmin";
import SystemAIPanel from "../components/SystemAIPanel";
import OfferArchitectureClient from "../components/OfferArchitectureClient";
import MonetizationClient from "../components/MonetizationClient";
import CalendarOperationalClient from "../components/CalendarOperationalClient";
import { getOfferState, listOffersWithSeed } from "@/lib/offer-architecture";

interface SystemContent {
  title: string;
  subtitle: string;
  summary: string;
  frameworks: string[];
  checklists: string[];
  templates: string[];
  flows: string[];
  maps: string[];
  sequences: string[];
  sopGuidance: string[];
}

const SYSTEMS: Record<string, SystemContent> = {
  workflows: {
    title: "Workflow Builder",
    subtitle: "Create repeatable rhythms that scale without chaos.",
    summary: "Map every recurring flow: intake, delivery, QA, and retros. Lock in cadences so work moves predictably and you protect your time.",
    frameworks: [
      "Weekly operating rhythm (plan → execute → review)",
      "Issue triage lanes: critical, standard, backlog",
      "Handoff matrix for cross-functional tasks",
      "Definition of done, definition of ready",
    ],
    checklists: [
      "Daily start/stop checklist for operators",
      "handoff-ready items include owner, due date, dependencies",
      "Retro prompt set (what worked, friction, next experiment)",
      "SLA timers for inbound requests",
    ],
    templates: [
      "Workflow canvas (swimlanes + triggers)",
      "Runbook template (trigger, steps, owner, timers)",
      "Incident log + comms macro",
    ],
    flows: [
      "Client intake → setup → delivery → feedback",
      "Content idea → draft → review → publish",
      "Ops issue triage → assignment → resolution → retrospective",
    ],
    maps: [
      "RACI for key workflows",
      "Systems of record vs. systems of action",
      "Automation opportunities by step",
    ],
    sequences: [
      "Weekly cadence: plan (Mon) → execute (Tue-Thu) → retro (Fri)",
      "Handoff: notify → confirm receipt → set milestone → close loop",
    ],
    sopGuidance: [
      "Keep steps atomic; one owner per step.",
      "Include success criteria and failure modes for each step.",
      "Add screenshots/loom for any UI steps; keep updated quarterly.",
    ],
  },
  offers: {
    title: "Offer Architecture",
    subtitle: "Design offers that deliver consistent value and margins.",
    summary: "Structure packages, pricing, and delivery rules so you can scale without bespoke chaos.",
    frameworks: [
      "Value ladder: starter → core → premium",
      "Offer promise + proof + process triad",
      "Capacity model: seats, cycles, utilization",
    ],
    checklists: [
      "Each offer has ICP, outcome, scope, inclusions/exclusions",
      "Pricing covers delivery cost + margin + risk buffer",
      "Delivery timeboxes and response SLAs defined",
    ],
    templates: [
      "Offer one-pager (promise, scope, proof, price)",
      "Pricing calculator (time, tooling, risk)",
      "Scope change playbook",
    ],
    flows: [
      "Lead → fit check → proposal → kickoff",
      "Upsell/cross-sell trigger points",
      "Offboarding with win/loss capture",
    ],
    maps: [
      "Offer/Persona alignment map",
      "Delivery roles and swimlanes",
      "Profitability dashboard sketch",
    ],
    sequences: [
      "Proposal follow-up: T+1, T+3, T+7 with value adds",
      "Kickoff: align outcomes → risks → calendar → comms",
    ],
    sopGuidance: [
      "Lock inclusions/exclusions; no silent scope creep.",
      "Document acceptance criteria per deliverable.",
      "Standardize comms templates for proposals and kickoffs.",
    ],
  },
  monetization: {
    title: "Monetization Mode",
    subtitle: "Track revenue systems so focus stays on what works.",
    summary: "Instrument revenue streams, payment flows, and renewal health. Remove friction and leaks.",
    frameworks: [
      "Revenue system map: acquire → convert → fulfill → renew",
      "Billing architecture: invoicing, subscriptions, collections",
      "Unit economics: CAC, LTV, payback, contribution margin",
    ],
    checklists: [
      "Payment methods tested (card/ACH/PayPal where needed)",
      "Dunning flows configured and tested",
      "Receivables aging reviewed weekly",
      "Renewal/expansion triggers captured",
    ],
    templates: [
      "KPI scoreboard (weekly)",
      "Pricing experiment log",
      "Collections playbook",
    ],
    flows: [
      "Quote → checkout → receipt → provisioning",
      "Refund/credit process",
      "Renewal/upsell sequence",
    ],
    maps: [
      "Source/offer/channel attribution sketch",
      "Risk controls: fraud, chargebacks, failed payments",
      "Cashflow calendar",
    ],
    sequences: [
      "Dunning: day 0/3/7 with downgrades after day 10",
      "Quarterly pricing review cadence",
    ],
    sopGuidance: [
      "Separate finance approvals from delivery approvals.",
      "Log payment exceptions and RCA monthly.",
      "Test checkout monthly after dependency updates.",
    ],
  },
  calendar: {
    title: "Calendar Sync",
    subtitle: "Make your calendar reflect priorities, not just requests.",
    summary: "Protect focus time, codify booking rules, and use copy/paste templates without relying on integrations.",
    frameworks: [
      "Time architecture: deep work, admin, clients, recovery",
      "Booking rules by segment (clients, partners, internal)",
      "Buffer strategy: pre/post meeting, daily margins",
    ],
    checklists: [
      "Working hours and time zones locked",
      "No-meeting blocks recurring",
      "Booking links scoped by audience",
      "Reminder/cancellation windows set",
    ],
    templates: [
      "Meeting agenda templates",
      "Out-of-office and handoff message set",
      "On-call rota template",
    ],
    flows: [
      "Inbound request → qualification → link → confirmation",
      "Weekly calendar audit → adjust blocks → re-commit",
    ],
    maps: [
      "Systems of record: Google/Outlook vs. booking tool",
      "Escalation paths for conflicts",
      "Availability sources and overrides",
    ],
    sequences: [
      "Weekly reset: triage holds, confirm priorities, publish availability",
      "Monthly audit: remove stale holds, rebalance themes",
    ],
    sopGuidance: [
      "Never double-book the same focus block.",
      "Give every meeting an owner, agenda, and decision goal.",
      "Archive canceled events; keep notes linked to CRM/project.",
    ],
  },
  content: {
    title: "Content Engine",
    subtitle: "Publish with rhythm and reuse, not heroics.",
    summary: "Turn ideas into assets with a reliable pipeline and reuse strategy across channels.",
    frameworks: [
      "Idea bank → briefs → drafts → review → ship → repurpose",
      "Pillar/cluster model for topics",
      "Channel roles: core vs. derivative vs. experimental",
    ],
    checklists: [
      "Each asset has POV, CTA, and proof",
      "SEO/metadata pass before publish",
      "Accessibility checks (alt text, captions)",
    ],
    templates: [
      "Content brief",
      "Repurposing grid",
      "Editorial calendar (weekly/quarterly)",
    ],
    flows: [
      "Idea capture → prioritization → drafting → QA → publish",
      "Repurpose: longform → snippets → email → social",
    ],
    maps: [
      "Channel-by-purpose map (authority, nurture, convert)",
      "Review lanes: SME, editor, compliance",
      "Asset lifecycle and archival rules",
    ],
    sequences: [
      "Weekly cadence: plan (Mon) → produce (Tue/Wed) → publish (Thu) → analyze (Fri)",
      "Launch sequence: teaser → announce → proof → offer → urgency → FAQ → last call",
    ],
    sopGuidance: [
      "Keep a single source of truth for drafts.",
      "Timebox review rounds; define approval rights.",
      "Log performance and feed back into briefs.",
    ],
  },
  email: {
    title: "Email Sequences",
    subtitle: "Nurture, convert, and retain with intentional flows.",
    summary: "Design sequences that respect attention, deliver value, and drive clear next steps.",
    frameworks: [
      "Lifecycle arcs: welcome → nurture → convert → retain → re-engage",
      "Message stack: problem → insight → proof → offer → action",
      "List hygiene: tagging, sunset rules, compliance",
    ],
    checklists: [
      "Links tracked; UTMs consistent",
      "Plain-text fallback ready",
      "Deliverability checks (SPF/DKIM/DMARC)",
    ],
    templates: [
      "Welcome 5-touch", "Launch 7-touch", "Reactivation 3-touch",
      "Plain-text personal outreach",
    ],
    flows: [
      "Trigger → segment → send → monitor → optimize",
      "Re-engagement path before sunset",
    ],
    maps: [
      "Segment/offer alignment",
      "Compliance and preferences center",
      "Failover: resend to non-opens with variant",
    ],
    sequences: [
      "Welcome: day 0/2/5/9/14 with progressive asks",
      "Launch: problem → story → proof → offer → urgency → FAQ → last call",
    ],
    sopGuidance: [
      "No dead-end emails; every send has a next step.",
      "Tag behaviors to improve routing, not vanity.",
      "Test one variable per send; log learnings.",
    ],
  },
  brand: {
    title: "Brand Assets",
    subtitle: "Keep identity consistent and ready-to-ship.",
    summary: "Centralize identity, templates, and guardrails so every touchpoint feels intentional.",
    frameworks: [
      "Core narrative: who you serve, promise, proof",
      "Visual system: logo, type, color, spacing",
      "Voice and tone ladder by context",
    ],
    checklists: [
      "Logo lockups and clearspace rules",
      "Color accessibility contrast checks",
      "File naming conventions and versioning",
    ],
    templates: [
      "Pitch deck, one-pager, case study",
      "Social post templates",
      "Email signature and doc headers",
    ],
    flows: [
      "Asset request → creation → approval → publish",
      "Change log and sunset of outdated assets",
    ],
    maps: [
      "Brand system map: core, flexible, experimental",
      "Channel-specific adaptations",
      "DAM folder and tagging structure",
    ],
    sequences: [
      "Quarterly brand audit",
      "Launch visuals: announce kit, thumbnails, stories, email headers",
    ],
    sopGuidance: [
      "Keep a single source of truth; no rogue copies.",
      "Document usage examples and anti-patterns.",
      "Version assets; archive deprecated files visibly.",
    ],
  },
};

export default async function SystemDetailPage({ params }: { params: Promise<{ slug?: string }> }) {
  const resolvedParams = await params; // Next.js 16 passes params as a Promise in dynamic routes
  const slug = resolvedParams?.slug?.toLowerCase();
  const system = slug ? SYSTEMS[slug] : undefined;
  if (!system) return redirect("/systems");

  const cookieStore = await cookies();
  const session = cookieStore.get("FirebaseSession")?.value ?? null;
  if (!session) return redirect("/login");

  try {
    const decodedClaims = await firebaseAdmin.auth().verifySessionCookie(session, true);
    const db = firebaseAdmin.firestore();
    const userDoc = await db.collection("users").doc(decodedClaims.uid).get();

    if (!userDoc.exists || userDoc.data()?.entitlement?.status !== "active") {
      return redirect("/enrollment-required");
    }

    const hasWorkflow = Boolean(
      userDoc.data()?.systems?.workflowBuilder?.created ||
      userDoc.data()?.systems?.workflowBuilder?.createdAt ||
      userDoc.data()?.workflowBuilder?.created ||
      userDoc.data()?.workflowBuilder?.createdAt
    );
    const workflowFlag = Boolean(userDoc.data()?.systems?.workflowBuilderHasSystem);
    const workflowSnapshot = await db.collection("workflowSystems").where("uid", "==", decodedClaims.uid).limit(1).get();
    const hasWorkflowRecord = !workflowSnapshot.empty;
    // Unlock when at least one workflow/system exists or the fallback flag is set on the user profile.
    const isUnlocked = hasWorkflow || workflowFlag || hasWorkflowRecord;

    if (slug === "workflows") {
      const buildHref = "/systems/workflow-builder/build";
      const deepenHref = "/systems/workflow-builder/deepen";
      return (
        <div className="bg-neutral-50 min-h-screen">
          <div className="relative h-[34vh] flex items-center justify-center overflow-hidden mb-10">
            <div className="absolute inset-0 bg-gradient-to-br from-lavenderViolet/15 via-white to-salmonPeach/10" />
            <div className="relative z-10 text-center px-4 max-w-4xl">
              <p className="text-xs font-semibold tracking-[0.35em] text-indigoDeep/70 uppercase mb-3">Systems Module</p>
              <h1 className="heading-hero mb-3 text-warmCharcoal drop-shadow-2xl">Workflow Builder</h1>
              <p className="text-lg md:text-xl text-warmCharcoal/80 font-marcellus drop-shadow-lg">Create repeatable rhythms that scale without chaos.</p>
              <p className="text-sm md:text-base text-warmCharcoal/70 font-marcellus">Build one system now. Improve it later.</p>
            </div>
          </div>

          <div className="container max-w-7xl mx-auto px-6 md:px-10 pb-14 space-y-10">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl text-warmCharcoal/80 leading-relaxed font-marcellus space-y-3">
                <p>If something in your life or work keeps repeating, it deserves a system — not more effort.</p>
                <p>Here, you’ll turn repeat work into a clear, reusable workflow that protects your time and reduces friction. You can keep it simple, or deepen it over time.</p>
              </div>
              <Button variant="ghost" size="sm" href="/systems" className="text-indigoDeep">← Back to Systems</Button>
            </div>

            <div className="space-y-6" id="build">
              <div className="grid md:grid-cols-2 gap-4 items-stretch">
                <Card accent="salmon" className="p-6 shadow-soft-md h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs font-semibold tracking-wide text-warmCharcoal/70 mb-1">Primary Path · Live Now</p>
                      <h3 className="font-marcellus text-2xl text-warmCharcoal">Build Your First System (30 Minutes)</h3>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-salmonPeach/20 text-warmCharcoal">🟢 Live</span>
                  </div>
                  <p className="text-sm text-warmCharcoal/70 font-marcellus mb-2">Leave this page with a real system you can use immediately.</p>
                  <p className="text-sm text-warmCharcoal/70 font-marcellus mb-4">In the next 30 minutes, you’ll:</p>
                  <div className="grid sm:grid-cols-2 gap-3 mb-5">
                    {[
                      "Choose one recurring workflow",
                      "Map the steps clearly",
                      "Add simple guardrails so it doesn’t fall apart",
                      "Save it as a reusable system",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-2 text-sm text-warmCharcoal/80 font-marcellus">
                        <span className="mt-1 h-2 w-2 rounded-full bg-salmonPeach" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-1 text-sm text-warmCharcoal/70 font-marcellus">
                      <p>You don’t need to get it perfect.</p>
                      <p>You just need to get it out of your head.</p>
                    </div>
                    <Button
                      variant="primary"
                      size="md"
                      href={buildHref}
                      className="shrink-0"
                    >
                      Start the 30-Minute Build
                    </Button>
                  </div>
                  <p className="text-xs text-warmCharcoal/60 font-marcellus mt-3">No setup. No theory. Just build.</p>
                </Card>

                <Card accent="lavender" className={`p-6 shadow-soft-md h-full ${isUnlocked ? "" : "opacity-90"}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs font-semibold tracking-wide text-warmCharcoal/70 mb-1">
                        Secondary Path · {isUnlocked ? "Unlocked" : "Locked"}
                      </p>
                      <h3 className="font-marcellus text-xl text-warmCharcoal">Deepen & Scale This System</h3>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${isUnlocked ? "bg-lavenderViolet/20 text-indigoDeep" : "bg-warmCharcoal/10 text-warmCharcoal/70"}`}>
                      {isUnlocked ? "🔓 Unlocked" : "🔒 Locked"}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-warmCharcoal/75 font-marcellus mb-4">
                    {[
                      "Proven frameworks",
                      "SOPs and runbooks",
                      "Clear ownership and handoffs",
                      "Automation logic",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigoDeep/50" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-warmCharcoal/60 font-marcellus mb-4">Available after your first system is created.</p>
                  <Button
                    variant="secondary"
                    size="md"
                    href={isUnlocked ? deepenHref : undefined}
                    disabled={!isUnlocked}
                    aria-disabled={!isUnlocked}
                    className="w-full"
                  >
                    Deepen This System
                  </Button>
                </Card>
              </div>

              <Card className="p-6 shadow-soft-md">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-indigoDeep/70 uppercase">Outputs</p>
                    <h3 className="font-marcellus text-xl text-warmCharcoal">What You Can Build Here</h3>
                  </div>
                  <span className="text-sm text-warmCharcoal/60 font-marcellus">Everything stays editable.</span>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { icon: "🗺️", label: "Workflow Map" },
                    { icon: "📘", label: "Runbook / SOP" },
                    { icon: "✅", label: "Checklists" },
                    { icon: "🤝", label: "Handoff Rules" },
                    { icon: "⚙️", label: "Automation Ideas" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl border border-warmCharcoal/10 bg-white/90 px-4 py-3 shadow-soft-sm flex items-center gap-3">
                      <span className="text-xl" aria-hidden>{item.icon}</span>
                      <span className="text-sm font-marcellus text-warmCharcoal">{item.label}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <SystemAIPanel
                systemName="Workflow Builder"
                context="Build one clear, repeatable workflow that protects your time and reduces friction."
                subtitle="Use the assistant to adapt, refine, or troubleshoot your workflow."
                placeholder="Ask anything about your workflow…"
                examples={[
                  "Help me simplify this flow.",
                  "Where might this system break?",
                  "Turn this into a checklist.",
                  "Suggest automation opportunities.",
                ]}
                hideUsageMeta
                hideChatHeader
                hideChatEmpty
              />
            </div>
          </div>
        </div>
      );
    }

    if (slug === "calendar") {
      return (
        <div className="bg-neutral-50 min-h-screen">
          <div className="relative h-[32vh] flex items-center justify-center overflow-hidden mb-10">
            <div className="absolute inset-0 bg-gradient-to-br from-lavenderViolet/15 via-white to-salmonPeach/10" />
            <div className="relative z-10 text-center px-4 max-w-4xl space-y-2">
              <p className="text-xs font-semibold tracking-[0.35em] text-indigoDeep/70 uppercase">Systems Module</p>
              <h1 className="heading-hero text-warmCharcoal drop-shadow-2xl">Calendar Sync (Operational Mode)</h1>
              <p className="text-lg md:text-xl text-warmCharcoal/80 font-marcellus drop-shadow-lg">Set up and protect your calendar using proven systems — with optional AI assistance. Automated integrations coming later.</p>
              <p className="text-xs text-warmCharcoal/60">Google/Outlook API sync not enabled in v1. Focus on copy/paste templates that produce real outcomes.</p>
            </div>
          </div>

          <div className="container max-w-7xl mx-auto px-6 md:px-10 pb-14 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="max-w-3xl text-warmCharcoal/80 leading-relaxed font-marcellus">
                {system.summary}
              </div>
              <Button variant="ghost" size="sm" href="/systems" className="text-indigoDeep">← Back to Systems</Button>
            </div>

            <CalendarOperationalClient userId={decodedClaims.uid} />
          </div>
        </div>
      );
    }

    if (slug === "offers") {
      const [offers, state] = await Promise.all([
        listOffersWithSeed(decodedClaims.uid),
        getOfferState(decodedClaims.uid),
      ]);

      const currency = (userDoc.data()?.currency || userDoc.data()?.defaultCurrency || "usd") as string;
      const hasSeeded = offers.some((o) => o.seeded);

      return (
        <div className="bg-neutral-50 min-h-screen">
          <div className="relative h-[36vh] flex items-center justify-center overflow-hidden mb-10">
            <div className="absolute inset-0 bg-gradient-to-br from-lavenderViolet/15 via-white to-salmonPeach/10" />
            <div className="relative z-10 text-center px-4 max-w-4xl">
              <p className="text-xs font-semibold tracking-[0.35em] text-indigoDeep/70 uppercase mb-3">Systems Module</p>
              <h1 className="heading-hero mb-3 text-warmCharcoal drop-shadow-2xl">Offer Architecture</h1>
              <p className="text-lg md:text-xl text-warmCharcoal/80 font-marcellus drop-shadow-lg">Design studio for coherent, ethical, and sustainable offers.</p>
            </div>
          </div>

          <div className="container max-w-7xl mx-auto px-6 md:px-10 pb-14 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="max-w-3xl text-warmCharcoal/80 leading-relaxed font-marcellus">
                {system.summary}
              </div>
              <Button variant="ghost" size="sm" href="/systems" className="text-indigoDeep">← Back to Systems</Button>
            </div>

            {hasSeeded && (
              <div className="rounded-xl border border-indigoDeep/15 bg-indigoDeep/5 p-3 text-sm text-warmCharcoal/80 font-marcellus">
                Starter offer created automatically. Select it to edit and make it yours.
              </div>
            )}
            <div className="text-xs text-warmCharcoal/65 font-marcellus">Your edits autosave to your account (per-user Firestore, entitlement-gated).</div>

            <OfferArchitectureClient initialOffers={offers} initialState={state} currency={currency} />
          </div>
        </div>
      );
    }

    if (slug === "monetization") {
      const dashboardBuilder = await import("@/lib/monetization/dashboard");
      const dashboard = await dashboardBuilder.buildDashboard(decodedClaims.uid, { includeStripe: true });

      return (
        <div className="bg-neutral-50 min-h-screen">
          <div className="relative h-[36vh] flex items-center justify-center overflow-hidden mb-10">
            <div className="absolute inset-0 bg-gradient-to-br from-lavenderViolet/15 via-white to-salmonPeach/10" />
            <div className="relative z-10 text-center px-4 max-w-4xl">
              <p className="text-xs font-semibold tracking-[0.35em] text-indigoDeep/70 uppercase mb-3">Systems Module</p>
              <h1 className="heading-hero mb-3 text-warmCharcoal drop-shadow-2xl">Monetization Dashboard</h1>
              <p className="text-lg md:text-xl text-warmCharcoal/80 font-marcellus drop-shadow-lg">Command center for revenue systems — streams, plans, focus, and history.</p>
            </div>
          </div>

          <div className="container max-w-7xl mx-auto px-6 md:px-10 pb-14 space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="max-w-3xl text-warmCharcoal/80 leading-relaxed font-marcellus">
                {system.summary}
              </div>
              <Button variant="ghost" size="sm" href="/systems" className="text-indigoDeep">← Back to Systems</Button>
            </div>

            <MonetizationClient
              initialStreams={dashboard.streams}
              initialPricingPlans={dashboard.pricingPlans}
              metrics={dashboard.metrics}
              computed={dashboard.computed}
              currency={dashboard.currency}
              stripe={dashboard.stripe}
              snapshotDate={dashboard.snapshotDate ? dashboard.snapshotDate.toISOString?.() || (dashboard.snapshotDate as any) : null}
              history={dashboard.history || []}
              systemSummary={system.summary}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="bg-neutral-50 min-h-screen">
        <div className="relative h-[36vh] flex items-center justify-center overflow-hidden mb-10">
          <div className="absolute inset-0 bg-gradient-to-br from-lavenderViolet/15 via-white to-salmonPeach/10" />
          <div className="relative z-10 text-center px-4 max-w-4xl">
            <p className="text-xs font-semibold tracking-[0.35em] text-indigoDeep/70 uppercase mb-3">Systems Module</p>
            <h1 className="heading-hero mb-3 text-warmCharcoal drop-shadow-2xl">{system.title}</h1>
            <p className="text-lg md:text-xl text-warmCharcoal/80 font-marcellus drop-shadow-lg">{system.subtitle}</p>
          </div>
        </div>

        <div className="container max-w-6xl mx-auto px-6 md:px-10 pb-14">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <div className="max-w-3xl text-warmCharcoal/80 leading-relaxed font-marcellus">{system.summary}</div>
            <Button variant="ghost" size="sm" href="/systems" className="text-indigoDeep">← Back to Systems</Button>
          </div>

          <div className="grid lg:grid-cols-[2fr,1fr] gap-8 items-start">
            <div className="space-y-6">
              <SectionHeading level="h3">Frameworks</SectionHeading>
              <Card className="p-5 space-y-3">
                {system.frameworks.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-warmCharcoal/80">
                    <span className="mt-1 h-2 w-2 rounded-full bg-lavenderViolet" />
                    <span>{item}</span>
                  </div>
                ))}
              </Card>

              <SectionHeading level="h3">Checklists</SectionHeading>
              <Card className="p-5 space-y-3">
                {system.checklists.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-warmCharcoal/80">
                    <span className="mt-1 h-2 w-2 rounded-full bg-salmonPeach" />
                    <span>{item}</span>
                  </div>
                ))}
              </Card>

              <SectionHeading level="h3">Templates & Downloadables</SectionHeading>
              <Card className="p-5 space-y-3">
                {system.templates.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-warmCharcoal/80">
                    <span className="mt-1 h-2 w-2 rounded-full bg-softGold" />
                    <span>{item}</span>
                  </div>
                ))}
              </Card>

              <SectionHeading level="h3">Visual Flows</SectionHeading>
              <Card className="p-5 space-y-3">
                {system.flows.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-warmCharcoal/80">
                    <span className="mt-1 h-2 w-2 rounded-full bg-indigoDeep/70" />
                    <span>{item}</span>
                  </div>
                ))}
              </Card>

              <SectionHeading level="h3">System Maps</SectionHeading>
              <Card className="p-5 space-y-3">
                {system.maps.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-warmCharcoal/80">
                    <span className="mt-1 h-2 w-2 rounded-full bg-warmCharcoal/40" />
                    <span>{item}</span>
                  </div>
                ))}
              </Card>

              <SectionHeading level="h3">Build Sequences</SectionHeading>
              <Card className="p-5 space-y-3">
                {system.sequences.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-warmCharcoal/80">
                    <span className="mt-1 h-2 w-2 rounded-full bg-lavenderViolet" />
                    <span>{item}</span>
                  </div>
                ))}
              </Card>

              <SectionHeading level="h3">SOP Guidance</SectionHeading>
              <Card className="p-5 space-y-3">
                {system.sopGuidance.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-warmCharcoal/80">
                    <span className="mt-1 h-2 w-2 rounded-full bg-salmonPeach" />
                    <span>{item}</span>
                  </div>
                ))}
              </Card>
            </div>

            <SystemAIPanel systemName={system.title} context={system.summary} />
          </div>
        </div>
      </div>
    );
  } catch (e) {
    return redirect("/login");
  }
}
