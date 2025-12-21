export async function POST(request: Request) {
  try {
    const { prompt, model } = await request.json();
    if (!prompt) return new Response("Missing prompt", { status: 400 });

    // FREE FALLBACK: If no OpenAI key or quota exceeded, use mock responses
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.startsWith('sk-proj-')) {
      const mockResponse = generateMockResponse(prompt);
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          const words = mockResponse.split(' ');
          let i = 0;
          const interval = setInterval(() => {
            if (i < words.length) {
              controller.enqueue(encoder.encode(words[i] + ' '));
              i++;
            } else {
              clearInterval(interval);
              controller.close();
            }
          }, 50);
        }
      });
      return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: model || "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        stream: true,
        temperature: 0.9,
      }),
    });

    if (!openaiRes.ok || !openaiRes.body) {
      // If OpenAI fails, fall back to mock
      const txt = await openaiRes.text();
      if (txt.includes('insufficient_quota') || txt.includes('exceeded')) {
        const mockResponse = generateMockResponse(prompt);
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode(mockResponse));
            controller.close();
          }
        });
        return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
      }
      return new Response(txt || "OpenAI error", { status: 502 });
    }

    const reader = openaiRes.body.getReader();
    const stream = new ReadableStream({
      async pull(controller) {
        try {
          const { done, value } = await reader.read();
          if (done) {
            controller.close();
            return;
          }
          controller.enqueue(value);
        } catch (e) {
          controller.error(e);
        }
      },
      cancel() {
        try { reader.cancel(); } catch (e) {}
      },
    });

    return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  } catch (e) {
    const errorMessage = (e as { message?: string })?.message || "Server error";
    return new Response(String(errorMessage), { status: 500 });
  }
}

function generateMockResponse(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();
  
  // Soul-related responses
  if (lowerPrompt.includes('soul') || lowerPrompt.includes('purpose') || lowerPrompt.includes('align')) {
    return "Your soul's alignment begins with listening to your inner knowing. Take time today to reflect on what truly matters to you. What brings you joy? What feels like your authentic path? The iPurpose framework starts with Soul because everything else flows from this foundation. Consider journaling about your core values and notice where your energy naturally flows.";
  }
  
  // Systems-related responses
  if (lowerPrompt.includes('system') || lowerPrompt.includes('workflow') || lowerPrompt.includes('organize')) {
    return "Strong systems create the container for your purpose to flourish. Start by identifying one repetitive task in your business and create a simple process for it. The Soul → Systems → AI™ method teaches that systems should support your energy, not drain it. What's one area of your business that feels chaotic? Let's bring structure there first.";
  }
  
  // AI-related responses
  if (lowerPrompt.includes('ai') || lowerPrompt.includes('automat') || lowerPrompt.includes('technology')) {
    return "AI tools are most powerful when they amplify your aligned purpose, not replace it. Think of AI as your expansion partner—it handles the repetitive work so you can focus on what only you can do. Start small: use AI for content drafts, customer responses, or data analysis. Always keep your human wisdom at the center.";
  }
  
  // Business/strategy responses
  if (lowerPrompt.includes('business') || lowerPrompt.includes('strategy') || lowerPrompt.includes('grow')) {
    return "Aligned growth happens when your Soul clarity informs your Systems strategy, amplified by AI tools. First, get clear on your unique value. Then, build systems that deliver that value consistently. Finally, use AI to scale what's working. Remember: sustainable business growth flows from inner alignment, not just tactics.";
  }
  
  // General greeting or questions
  if (lowerPrompt.includes('hi') || lowerPrompt.includes('hello') || lowerPrompt.includes('how are')) {
    return "Hello! I'm your iPurpose AI Mentor, here to guide you through the Soul → Systems → AI™ journey. I'm currently running in demo mode, but I'm ready to help you explore questions about your purpose, business systems, or AI integration. What would you like to explore today?";
  }
  
  // Default response
  return "That's a great question. In the iPurpose framework, we believe that meaningful progress comes from aligning your inner purpose (Soul) with practical structures (Systems) and then amplifying your impact through ethical AI. Could you share more about what specific area you'd like guidance on—soul alignment, systems building, or AI integration?";
}
