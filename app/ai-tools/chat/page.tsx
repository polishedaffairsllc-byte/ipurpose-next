'use client';

/**
 * AI Tools GPT Interface
 * Interactive chat with springboard prompts for each tool
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import GPTChat from '../../components/GPTChat';

/* ── Tool Springboard Data ── */
interface ToolSpringboard {
  name: string;
  icon: string;
  tagline: string;
  description: string;
  quickPrompts: string[];
  exampleOutput: string;
  systemContext: string;
}

const toolSpringboards: Record<string, ToolSpringboard> = {
  'Content Writing': {
    name: 'Purpose Prompt Studio',
    icon: '✨',
    tagline: 'Generate aligned content that sounds like you.',
    description:
      'This tool helps you create blog posts, newsletters, social captions, and scripts that resonate with your audience — rooted in your voice, values, and purpose.',
    quickPrompts: [
      'Write a nurturing email to my audience about [your topic]. My brand voice is warm, wise, and grounded.',
      'Create 5 social media captions that invite my audience to reflect on [theme]. Keep them short, soulful, and real.',
      'Draft a blog post outline about [subject] that weaves in my story and ends with a clear call to action.',
      'Help me write a welcome sequence for new subscribers. My brand is about [your purpose].',
    ],
    exampleOutput:
      '"Subject: The question I kept avoiding…\n\nHey [Name],\n\nThere\'s a question I used to dodge every time it came up: What do you actually want?\n\nNot what looks good. Not what makes sense. What do you want?\n\nI realized I\'d built an entire business around everyone else\'s answers to that question…"',
    systemContext:
      'You are the iPurpose Content Studio. Help create aligned, authentic content (emails, blogs, social posts, scripts) that reflects the user\'s unique voice and purpose. Write in a warm, grounded, soulful tone. Avoid generic marketing language. Make it feel real, not salesy.',
  },
  'Email Drafts': {
    name: 'Email Writer',
    icon: '📝',
    tagline: 'Draft emails that nurture and convert with heart.',
    description:
      'Whether it\'s a client follow-up, a launch announcement, or a weekly newsletter — this tool helps you write emails that feel personal and purposeful.',
    quickPrompts: [
      'Write a follow-up email to a potential client I met at [event]. I want to be warm but professional.',
      'Draft a launch email for my new [offer/program]. My audience values authenticity and transformation.',
      'Help me write a re-engagement email for subscribers who haven\'t opened my last 5 emails.',
      'Create a thank-you email for someone who just purchased my [product/service].',
    ],
    exampleOutput:
      '"Hi [Name],\n\nIt was so good to meet you at [event]. Our conversation about [topic] really stuck with me.\n\nI\'ve been thinking about what you shared — about wanting [their goal] but feeling [their challenge]. That\'s exactly the kind of work I love supporting…"',
    systemContext:
      'You are the iPurpose Email Writer. Help draft emails that are warm, purposeful, and authentic. Whether nurturing, selling, or following up — every email should feel like a real human wrote it with care. Avoid clichés and generic templates. Match the user\'s voice.',
  },
  'Marketing Copy': {
    name: 'Value Articulator',
    icon: '🎯',
    tagline: 'Turn what you do into words that move people.',
    description:
      'This tool helps you articulate your value clearly — for landing pages, sales pages, offers, and anywhere you need to explain why your work matters.',
    quickPrompts: [
      'Help me write a compelling headline and subheadline for my [offer]. My ideal client is [describe them].',
      'I need to explain what I do in 2-3 sentences. I help [who] with [what] so they can [result].',
      'Write a "Why This Matters" section for my sales page about [your offer].',
      'Create 3 different taglines for my brand. My purpose is [your purpose].',
    ],
    exampleOutput:
      '"You don\'t need another framework.\nYou need to finally hear your own voice.\n\n→ iPurpose helps purpose-driven founders align their soul, structure their systems, and expand through AI — so the business they build actually feels like them."',
    systemContext:
      'You are the iPurpose Value Articulator. Help users turn complex ideas into clear, compelling language for landing pages, sales copy, offers, and brand messaging. Focus on clarity over cleverness. Every word should serve the reader. Avoid hype — lead with truth and transformation.',
  },
  'Brainstorming': {
    name: 'Insight Synthesizer',
    icon: '⚡',
    tagline: 'Expand a seed idea into aligned directions.',
    description:
      'Bring a half-formed idea, a journal entry, or a question you\'ve been sitting with — this tool helps you explore it from multiple angles and find clarity.',
    quickPrompts: [
      'I have an idea for [describe it]. Help me explore 5 different directions I could take this.',
      'I\'ve been journaling about [theme]. Help me find the patterns and insights hiding in my thoughts.',
      'I\'m stuck between [option A] and [option B]. Help me think through both with my values in mind.',
      'What are 10 aligned ways I could serve my audience around [topic]? I value [your values].',
    ],
    exampleOutput:
      '"Based on what you\'ve shared, I see three threads running through your thinking:\n\n1. Permission — You keep coming back to the idea that people need permission to slow down before they speed up.\n2. Integration — Your best ideas blend inner work with outer strategy.\n3. Simplicity — You resist complexity instinctively. That\'s a brand strength.\n\nHere\'s where those threads could lead…"',
    systemContext:
      'You are the iPurpose Insight Synthesizer. Help users explore ideas, find patterns, and expand their thinking. Be a thought partner — ask great questions, offer multiple angles, and help them see what they might be missing. Stay grounded in their values and purpose. Never overwhelm — explore one layer at a time.',
  },
};

const defaultSpringboard: ToolSpringboard = {
  name: 'AI Tools Studio',
  icon: '🤖',
  tagline: 'Your purpose-aligned creative partner.',
  description: 'Ask me to help you create content, draft emails, articulate your value, brainstorm ideas, or anything else for your business.',
  quickPrompts: [
    'Help me write about [topic] in my authentic voice.',
    'I need to explain my offer to someone who\'s never heard of me.',
    'Brainstorm 5 content ideas around [theme] for my audience.',
    'Help me draft a message to [who] about [what].',
  ],
  exampleOutput: '',
  systemContext: 'AI-powered content generation aligned with the user\'s purpose and values.',
};

export default function AIToolsGPTPage() {
  const searchParams = useSearchParams();
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState('');

  // Auto-select tool from query param
  useEffect(() => {
    const toolParam = searchParams.get('tool');
    if (toolParam) {
      setSelectedTool(toolParam);
    }
  }, [searchParams]);

  const springboard = selectedTool && toolSpringboards[selectedTool]
    ? toolSpringboards[selectedTool]
    : defaultSpringboard;

  const handleQuickPrompt = (prompt: string) => {
    setInitialPrompt(prompt);
    setShowChat(true);
  };

  const handleFreeStart = () => {
    setInitialPrompt('');
    setShowChat(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f6f3] via-white to-[#f0ecf8]">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {!showChat ? (
          <div className="space-y-10">

            {/* Back Link */}
            <a
              href="/ai-tools"
              className="inline-flex items-center gap-2 text-sm text-warmCharcoal/60 hover:text-warmCharcoal transition-colors font-marcellus"
            >
              ← Back to AI Tools
            </a>

            {/* Springboard Hero */}
            <div className="text-center space-y-4">
              <span className="text-5xl block">{springboard.icon}</span>
              <h1 className="text-3xl md:text-4xl font-italiana text-warmCharcoal">
                {springboard.name}
              </h1>
              <p className="text-lg text-warmCharcoal/70 font-marcellus max-w-xl mx-auto">
                {springboard.tagline}
              </p>
              <p className="text-sm text-warmCharcoal/55 font-marcellus max-w-2xl mx-auto leading-relaxed">
                {springboard.description}
              </p>
            </div>

            {/* Quick Start Prompts */}
            <div className="space-y-4">
              <h2 className="text-center text-sm font-marcellus text-warmCharcoal/50 uppercase tracking-widest">
                Quick Start — Click to Begin
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                {springboard.quickPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickPrompt(prompt)}
                    className="text-left p-4 rounded-xl border border-warmCharcoal/10 bg-white/70 hover:bg-lavenderViolet/5 hover:border-lavenderViolet/30 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lavenderViolet/60 text-lg mt-0.5 group-hover:text-lavenderViolet transition-colors">→</span>
                      <p className="text-sm text-warmCharcoal/75 font-marcellus leading-relaxed group-hover:text-warmCharcoal transition-colors">
                        {prompt}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Example Output Preview */}
            {springboard.exampleOutput && (
              <div className="space-y-3">
                <h2 className="text-center text-sm font-marcellus text-warmCharcoal/50 uppercase tracking-widest">
                  Example Output
                </h2>
                <div className="bg-white/60 border border-warmCharcoal/8 rounded-xl p-6 max-w-2xl mx-auto">
                  <p className="text-sm text-warmCharcoal/65 font-marcellus leading-relaxed whitespace-pre-line italic">
                    {springboard.exampleOutput}
                  </p>
                </div>
              </div>
            )}

            {/* Free Start */}
            <div className="text-center pt-2">
              <p className="text-sm text-warmCharcoal/45 font-marcellus mb-3">
                Or describe exactly what you need
              </p>
              <button
                onClick={handleFreeStart}
                className="px-8 py-3 bg-indigoDeep text-white rounded-xl font-marcellus hover:bg-indigoDeep/90 transition-colors shadow-md"
              >
                Start with a Blank Canvas
              </button>
            </div>

            {/* Tool Switcher */}
            {selectedTool && (
              <div className="border-t border-warmCharcoal/8 pt-8">
                <p className="text-center text-xs text-warmCharcoal/40 font-marcellus uppercase tracking-widest mb-4">
                  Switch Tool
                </p>
                <div className="flex justify-center gap-3 flex-wrap">
                  {Object.entries(toolSpringboards).map(([key, tool]) => (
                    <a
                      key={key}
                      href={`/ai-tools/chat?tool=${encodeURIComponent(key)}`}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-marcellus transition-all ${
                        key === selectedTool
                          ? 'bg-indigoDeep text-white'
                          : 'bg-white border border-warmCharcoal/10 text-warmCharcoal/60 hover:border-lavenderViolet/30 hover:text-warmCharcoal'
                      }`}
                    >
                      <span>{tool.icon}</span>
                      {tool.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowChat(false)}
                className="px-4 py-2 text-warmCharcoal/60 hover:text-warmCharcoal flex items-center gap-2 transition-colors font-marcellus text-sm"
              >
                ← Back to Springboard
              </button>
              <div className="flex items-center gap-2 px-4 py-2 bg-indigoDeep/5 text-indigoDeep rounded-full font-marcellus text-xs">
                <span>{springboard.icon}</span>
                {springboard.name}
              </div>
            </div>

            {/* Chat Interface */}
            <div className="h-[calc(100vh-160px)]">
              <GPTChat
                domain="ai-tools"
                title={springboard.name}
                placeholder={
                  initialPrompt
                    ? 'Continue the conversation...'
                    : `What would you like to create with ${springboard.name}?`
                }
                systemContext={springboard.systemContext}
                temperature={0.8}
                className="h-full"
              />
            </div>

            {/* Prompt Hint */}
            {initialPrompt && (
              <div className="bg-lavenderViolet/5 border border-lavenderViolet/15 rounded-xl p-4 max-w-3xl mx-auto">
                <p className="text-xs text-warmCharcoal/40 font-marcellus uppercase tracking-widest mb-1">
                  Your Prompt
                </p>
                <p className="text-sm text-warmCharcoal/70 font-marcellus">
                  {initialPrompt}
                </p>
                <p className="text-xs text-warmCharcoal/40 font-marcellus mt-2 italic">
                  Tip: Replace the [brackets] with your specific details, then paste into the chat above.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
