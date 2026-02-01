"use client";

import GPTChat from "../../components/GPTChat";

type SystemAIPanelProps = {
  systemName: string;
  context?: string;
  subtitle?: string;
  placeholder?: string;
  examples?: string[];
  hideUsageMeta?: boolean;
};

export default function SystemAIPanel({ systemName, context, subtitle, placeholder, examples, hideUsageMeta }: SystemAIPanelProps) {
  const promptPlaceholder = placeholder ?? `Ask anything about your ${systemName.toLowerCase()} system`;
  const systemContext = context ?? `Building and refining the ${systemName} system`;
  const promptExamples = examples ?? [
    "Help me simplify this flow.",
    "Where might this system break?",
    "Turn this into a checklist.",
    "Suggest automation opportunities.",
  ];
  const subhead = subtitle ?? "Use the assistant to adapt the frameworks, draft SOPs, or troubleshoot gaps.";

  return (
    <div className="sticky top-6 space-y-3 rounded-2xl border border-lavenderViolet/20 bg-white/90 p-4 shadow-soft-md">
      <div className="space-y-2">
        <div>
          <p className="text-xs font-semibold tracking-wide text-indigoDeep/70 uppercase">Ask AI About This System</p>
          <h3 className="text-lg font-marcellus text-warmCharcoal">{systemName}</h3>
        </div>
        <p className="text-sm text-warmCharcoal/70">{subhead}</p>
        <ul className="space-y-1 text-xs text-warmCharcoal/70">
          {promptExamples.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigoDeep/60" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="h-[460px]">
        <GPTChat
          domain="systems"
          title="Systems Builder"
          placeholder={promptPlaceholder}
          systemContext={systemContext}
          temperature={0.5}
          className="h-full"
          hideUsageMeta={hideUsageMeta}
        />
      </div>
    </div>
  );
}
