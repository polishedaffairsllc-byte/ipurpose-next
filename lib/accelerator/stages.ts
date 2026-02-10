// Accelerator Stage Configuration
// Maps the 6-week cohort-based program structure

export interface StageResource {
  title: string;
  type: "video" | "worksheet" | "meditation" | "exercise" | "template" | "guide";
  description: string;
  href?: string; // Google Drive or internal link placeholder
}

export interface ReflectionPrompt {
  prompt: string;
  type: "journal" | "integration";
}

export interface AcceleratorStage {
  week: number;
  slug: string;
  title: string;
  subtitle: string;
  color: string;
  colorFaded: string;
  icon: string;

  // Overview block
  overview: {
    about: string;
    shifts: string;
    builds: string;
  };

  // Lesson content
  lessons: StageResource[];

  // Client resources
  resources: StageResource[];

  // Reflection prompts
  reflections: ReflectionPrompt[];
}

export const ACCELERATOR_STAGES: AcceleratorStage[] = [
  {
    week: 1,
    slug: "purpose-alignment",
    title: "Purpose Alignment",
    subtitle: "Stage 1",
    color: "#9C88FF",
    colorFaded: "rgba(156, 136, 255, 0.12)",
    icon: "✦",
    overview: {
      about:
        "This week is about returning to the center. Before building anything externally, you ground into the truth of who you are and what you're here to do. This is the foundation everything else will be built upon.",
      shifts:
        "A deep reconnection with your purpose. Clarity about what matters most. Permission to trust your own knowing.",
      builds:
        "Your Personal Brand Clarity Map, a Soul-Centered Business Model Framework, and your Purpose Activation practice.",
    },
    lessons: [
      { title: "Personal Brand Clarity Map", type: "exercise", description: "Map the intersection of your gifts, values, and the people you're called to serve." },
      { title: "Soul-Centered Business Model Framework", type: "worksheet", description: "Design a business model rooted in alignment, not just revenue." },
      { title: "Purpose Activation Meditation", type: "meditation", description: "A guided meditation to reconnect with your deeper calling." },
      { title: "Purpose Map Template", type: "template", description: "A visual template to integrate your clarity into a single-page map." },
    ],
    resources: [
      { title: "Personal Brand Clarity Map (PDF)", type: "worksheet", description: "Printable version of the clarity mapping exercise." },
      { title: "Business Model Framework (Fillable)", type: "template", description: "Interactive template for your soul-centered model." },
      { title: "Purpose Meditation (Audio)", type: "meditation", description: "Downloadable audio for your daily practice." },
    ],
    reflections: [
      { prompt: "What did I already know about my purpose that I've been avoiding?", type: "journal" },
      { prompt: "Where in my life am I already living in alignment — and where am I not?", type: "journal" },
      { prompt: "What would my life look like if I fully trusted my purpose?", type: "integration" },
      { prompt: "Write a letter to yourself from your future self who is fully living their purpose.", type: "integration" },
    ],
  },
  {
    week: 2,
    slug: "money-healing",
    title: "Money Healing",
    subtitle: "Stage 2",
    color: "#FCC4B7",
    colorFaded: "rgba(252, 196, 183, 0.12)",
    icon: "✦",
    overview: {
      about:
        "This week confronts one of the deepest barriers to purpose-driven work: your relationship with money. Before you can price, sell, or receive — you have to heal what's in the way.",
      shifts:
        "Releasing inherited money beliefs. Reconnecting self-worth with the value you offer. A new relationship between purpose and prosperity.",
      builds:
        "Your Money Belief Audit, a Self-Worth and Pricing Alignment Guide, and a personal visualization practice.",
    },
    lessons: [
      { title: "Money Belief Audit", type: "exercise", description: "Uncover the inherited and adopted beliefs shaping how you relate to money." },
      { title: "Self-Worth + Pricing Alignment Guide", type: "guide", description: "Bridge the gap between what you charge and what you're worth." },
      { title: "Abundance Visualization", type: "meditation", description: "A guided visualization to embody a healthy, grounded relationship with receiving." },
    ],
    resources: [
      { title: "Money Belief Audit (PDF)", type: "worksheet", description: "Printable audit worksheet." },
      { title: "Pricing Alignment Guide (Fillable)", type: "template", description: "Interactive pricing and self-worth workbook." },
      { title: "Abundance Visualization (Audio)", type: "meditation", description: "Downloadable guided visualization." },
    ],
    reflections: [
      { prompt: "What is the earliest money story I remember from childhood? How does it still show up?", type: "journal" },
      { prompt: "Where am I undercharging or over-giving — and what does that protect me from?", type: "journal" },
      { prompt: "What would it feel like to receive fully for the work I do?", type: "integration" },
      { prompt: "Write a new money story — one that feels true and grounded.", type: "integration" },
    ],
  },
  {
    week: 3,
    slug: "signature-offer",
    title: "Signature Offer Creation",
    subtitle: "Stage 3",
    color: "#4B4E6D",
    colorFaded: "rgba(75, 78, 109, 0.12)",
    icon: "✦",
    overview: {
      about:
        "This week takes everything you've clarified — your purpose, your relationship with money — and channels it into a tangible offer. You're not just creating a product. You're designing a container for transformation.",
      shifts:
        "Moving from ideas to an actual offer. Confidence in what you bring. Clarity about who it's for and what it costs.",
      builds:
        "Your Offer Builder Blueprint, a Pricing and Naming Guide, and an Offer Validation Flow.",
    },
    lessons: [
      { title: "Offer Builder Blueprint", type: "exercise", description: "Design your signature offer from transformation outcome to delivery structure." },
      { title: "Pricing & Naming Guide", type: "guide", description: "Name and price your offer in a way that feels aligned and clear." },
      { title: "Offer Validation Flow", type: "worksheet", description: "Test your offer concept before you build it — simple, grounded validation." },
    ],
    resources: [
      { title: "Offer Builder Blueprint (PDF)", type: "worksheet", description: "Printable blueprint template." },
      { title: "Pricing & Naming Guide (Fillable)", type: "template", description: "Interactive naming and pricing workbook." },
      { title: "Offer Validation Checklist", type: "template", description: "Step-by-step validation flow." },
    ],
    reflections: [
      { prompt: "What transformation do I help people experience — in one sentence?", type: "journal" },
      { prompt: "What makes my approach different from what's already out there?", type: "journal" },
      { prompt: "If I could only offer one thing for the next year, what would it be?", type: "integration" },
      { prompt: "What fears come up when I think about putting a price on my work?", type: "integration" },
    ],
  },
  {
    week: 4,
    slug: "systems-ai",
    title: "Systems + AI",
    subtitle: "Stage 4",
    color: "#E6C87C",
    colorFaded: "rgba(230, 200, 124, 0.12)",
    icon: "✦",
    overview: {
      about:
        "This week is about building the infrastructure that holds your purpose-driven work. You'll learn to integrate AI ethically and create systems that support you — not replace you.",
      shifts:
        "From overwhelm to order. From doing everything manually to working with intelligent support. Trusting systems without losing soul.",
      builds:
        "Your AI Ethical Integration Map, a Voice Prompt Bank, and a Soul+System Workflow Template.",
    },
    lessons: [
      { title: "AI Ethical Integration Map", type: "exercise", description: "Map where AI supports your work and where human presence is non-negotiable." },
      { title: "Voice Prompt Bank", type: "template", description: "Build a library of prompts that maintain your voice and values." },
      { title: "Soul+System Workflow Template", type: "worksheet", description: "Design workflows that blend intuition with structure." },
    ],
    resources: [
      { title: "AI Integration Map (PDF)", type: "worksheet", description: "Printable mapping exercise." },
      { title: "Voice Prompt Bank (Template)", type: "template", description: "Ready-to-use prompt library." },
      { title: "Workflow Template (Fillable)", type: "template", description: "Interactive workflow builder." },
    ],
    reflections: [
      { prompt: "Where in my business am I doing things manually that could be supported by systems?", type: "journal" },
      { prompt: "What does 'ethical AI' mean to me personally?", type: "journal" },
      { prompt: "How do I want to feel when I sit down to work? What systems would support that feeling?", type: "integration" },
      { prompt: "Write a commitment to yourself about how you'll use AI — and where you won't.", type: "integration" },
    ],
  },
  {
    week: 5,
    slug: "brand-presence",
    title: "Brand + Presence",
    subtitle: "Stage 5",
    color: "#88b04b",
    colorFaded: "rgba(136, 176, 75, 0.12)",
    icon: "✦",
    overview: {
      about:
        "This week is about showing up. Not performing — being present. Your brand isn't a logo. It's the energetic signature of your purpose made visible.",
      shifts:
        "From hiding to showing up authentically. From perfectionism to presence. From 'I don't know what to say' to clear, grounded expression.",
      builds:
        "Your Brand Ethics Map, a Visual Style Template, a Brand Voice Worksheet, and an Energetic Presence Planner.",
    },
    lessons: [
      { title: "Brand Ethics Mapping", type: "exercise", description: "Define the ethical boundaries and values your brand embodies." },
      { title: "Visual Style Template", type: "template", description: "Create a visual identity that reflects your inner world." },
      { title: "Brand Voice Worksheet", type: "worksheet", description: "Develop a consistent, authentic voice across all your content." },
      { title: "Energetic Presence Planner", type: "exercise", description: "Plan how you show up energetically — not just strategically." },
    ],
    resources: [
      { title: "Brand Ethics Map (PDF)", type: "worksheet", description: "Printable ethics mapping exercise." },
      { title: "Visual Style Template (Fillable)", type: "template", description: "Interactive visual identity builder." },
      { title: "Brand Voice Worksheet (PDF)", type: "worksheet", description: "Printable voice development workbook." },
      { title: "Presence Planner (Template)", type: "template", description: "Energetic presence planning tool." },
    ],
    reflections: [
      { prompt: "What do people feel when they interact with me? Is that intentional?", type: "journal" },
      { prompt: "Where am I performing instead of being present?", type: "journal" },
      { prompt: "If my brand were a person, how would they speak, dress, and show up?", type: "integration" },
      { prompt: "What part of myself am I still hiding from my audience — and why?", type: "integration" },
    ],
  },
  {
    week: 6,
    slug: "launch-integration",
    title: "Launch + Integration",
    subtitle: "Stage 6",
    color: "#d4af37",
    colorFaded: "rgba(212, 175, 55, 0.12)",
    icon: "✦",
    overview: {
      about:
        "This is where everything comes together. You're not starting from scratch — you're launching from clarity. This week is about stepping into your next chapter with grounded confidence.",
      shifts:
        "From preparation to action. From fear of visibility to calm readiness. From 'someday' to 'now.'",
      builds:
        "Your Launch Planning Worksheet, an Offer Page Template, Sales Email Templates, Social Launch Captions, a Nervous System Support Plan, and your final reflection.",
    },
    lessons: [
      { title: "Launch Planning Worksheet", type: "worksheet", description: "Map your launch timeline, channels, and milestones." },
      { title: "Offer Page Template", type: "template", description: "Build a compelling offer page rooted in transformation, not hype." },
      { title: "Sales Email Templates", type: "template", description: "Warm, authentic email sequences for your launch." },
      { title: "Social Launch Captions", type: "template", description: "Ready-to-customize social media content for your launch." },
      { title: "Nervous System Support Plan", type: "exercise", description: "Build a regulation plan for the emotional intensity of launching." },
    ],
    resources: [
      { title: "Launch Planner (PDF)", type: "worksheet", description: "Printable launch timeline worksheet." },
      { title: "Offer Page Template (Fillable)", type: "template", description: "Interactive offer page builder." },
      { title: "Email Templates (Doc)", type: "template", description: "Copy-and-customize email sequences." },
      { title: "Social Captions (Doc)", type: "template", description: "Launch caption templates." },
      { title: "Nervous System Plan (PDF)", type: "worksheet", description: "Regulation and support plan." },
    ],
    reflections: [
      { prompt: "What has shifted in me since Week 1?", type: "journal" },
      { prompt: "What am I most proud of building during this journey?", type: "journal" },
      { prompt: "What does 'launching' feel like in my body right now?", type: "integration" },
      { prompt: "Write a letter to the person who will be transformed by your offer.", type: "integration" },
      { prompt: "What support do I need going forward — and where will I find it?", type: "integration" },
    ],
  },
];

// Cohort configuration
export interface CohortConfig {
  id: string;
  label: string;
  startDate: string; // ISO date
  endDate: string;
  liveCallDay: string;
  liveCallTimes: string[];
  zoomLink: string;
}

export const CURRENT_COHORT: CohortConfig = {
  id: "spring-2026",
  label: "Spring 2026 Cohort",
  startDate: "2026-03-02",
  endDate: "2026-04-12",
  liveCallDay: "Friday",
  liveCallTimes: ["11:00 AM ET", "7:00 PM ET"],
  zoomLink: "", // Placeholder — set in env or Firestore
};

// Helper: determine which week is unlocked based on cohort start
export function getUnlockedWeek(cohortStartDate: string): number {
  const start = new Date(cohortStartDate);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 0; // cohort hasn't started
  const week = Math.floor(diffDays / 7) + 1;
  return Math.min(week, 6);
}

// Helper: get next Friday's live call date
export function getNextLiveCallDate(cohortStartDate: string): Date | null {
  const now = new Date();
  const start = new Date(cohortStartDate);
  if (now < start) return null;

  // Find the next Friday
  const dayOfWeek = now.getDay();
  const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
  const nextFriday = new Date(now);
  nextFriday.setDate(now.getDate() + (daysUntilFriday === 0 ? 7 : daysUntilFriday));
  nextFriday.setHours(11, 0, 0, 0);

  return nextFriday;
}
