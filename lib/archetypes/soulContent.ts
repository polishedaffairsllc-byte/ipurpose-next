export type ArchetypeContent = {
  welcomeAnchor: string;
  alignmentMessage: string;
  practicePrimary: string[];
  practiceSecondary: string[];
  reflectionPrompts: string[];
  growthEdgeFocus: string[];
  labsBridgeText: string;
};

export const soulContentByArchetype: Record<string, ArchetypeContent> = {
  Visionary: {
    welcomeAnchor: "Welcome back, {name} the Visionary.",
    alignmentMessage: "You naturally see what could be before it exists. Your work here is not to chase every idea, but to stay grounded long enough for one vision to take shape.",
    practicePrimary: [
      "Purpose articulation",
      "Morning reflection"
    ],
    practiceSecondary: [
      "Value mapping"
    ],
    reflectionPrompts: [
      "What future am I quietly being pulled toward right now?",
      "Where am I feeling scattered across too many possibilities?",
      "What vision still feels true even when I slow down?"
    ],
    growthEdgeFocus: [
      "Grounding",
      "Consistency",
      "Follow-through"
    ],
    labsBridgeText: "You're ready to turn vision into structure. Continue to Labs."
  },

  Builder: {
    welcomeAnchor: "Welcome back, {name} the Builder.",
    alignmentMessage: "You are wired to create things that last. Your strength is structure, movement, and stability. Your work here is to stay connected to purpose so that what you build reflects what matters.",
    practicePrimary: [
      "Value mapping",
      "Evening integration"
    ],
    practiceSecondary: [
      "Morning reflection"
    ],
    reflectionPrompts: [
      "What am I building right now — and does it still feel meaningful?",
      "Where am I pushing forward without checking in?",
      "What structure in my life supports me most?"
    ],
    growthEdgeFocus: [
      "Purpose connection",
      "Avoiding burnout",
      "Meaning before momentum"
    ],
    labsBridgeText: "Let's deepen what you're building. Continue to Labs."
  },

  Nurturer: {
    welcomeAnchor: "Welcome back, {name} the Nurturer.",
    alignmentMessage: "You are deeply attuned to people, care, and connection. You create environments where others can grow. Your work here is to protect your energy so you can continue giving without losing yourself.",
    practicePrimary: [
      "Evening integration",
      "Emotional check-in"
    ],
    practiceSecondary: [
      "Morning reflection"
    ],
    reflectionPrompts: [
      "Where am I giving more than I have capacity for?",
      "What does support look like for me today?",
      "What would it feel like to care for myself with the same energy I give others?"
    ],
    growthEdgeFocus: [
      "Boundaries",
      "Energy protection",
      "Self-care without guilt"
    ],
    labsBridgeText: "Let's strengthen your foundation. Continue to Labs."
  },

  Strategist: {
    welcomeAnchor: "Welcome back, {name} the Strategist.",
    alignmentMessage: "You naturally see patterns, paths, and long-term positioning. You know how to make things work. Your work here is to slow down enough to stay connected to meaning, intuition, and human pacing.",
    practicePrimary: [
      "Purpose articulation",
      "Value mapping"
    ],
    practiceSecondary: [
      "Integration reflection"
    ],
    reflectionPrompts: [
      "What am I optimizing right now — and does it still matter?",
      "Where could I slow down instead of pushing for efficiency?",
      "What feels true beyond the strategy?"
    ],
    growthEdgeFocus: [
      "Slowing down",
      "Feeling, not just thinking",
      "Human pace"
    ],
    labsBridgeText: "Let's refine your direction. Continue to Labs."
  },

  Creator: {
    welcomeAnchor: "Welcome back, {name} the Creator.",
    alignmentMessage: "You bring new ideas, expression, and energy into the world. Your mind moves quickly and sees things differently. Your work here is to give your creativity structure so your ideas can live beyond the moment.",
    practicePrimary: [
      "Morning reflection",
      "Purpose articulation"
    ],
    practiceSecondary: [
      "Value mapping"
    ],
    reflectionPrompts: [
      "What idea keeps returning to me?",
      "What have I started that wants to be completed?",
      "What would help me stay consistent without pressure?"
    ],
    growthEdgeFocus: [
      "Consistency",
      "Completion",
      "Structure for expression"
    ],
    labsBridgeText: "Let's give your ideas structure. Continue to Labs."
  },

  neutral: {
    welcomeAnchor: "Welcome back, {name}.",
    alignmentMessage: "Take a moment to reconnect with what matters before moving forward.",
    practicePrimary: [
      "Morning reflection",
      "Purpose articulation"
    ],
    practiceSecondary: [
      "Value mapping"
    ],
    reflectionPrompts: [
      "What feels most important in my life right now?",
      "Where am I feeling aligned?",
      "What needs my attention today?"
    ],
    growthEdgeFocus: [
      "Clarity",
      "Grounding",
      "Direction"
    ],
    labsBridgeText: "Continue to Labs to deepen your work."
  }
};
