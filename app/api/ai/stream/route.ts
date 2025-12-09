export async function POST(request: Request) {
  try {
    const { prompt, model } = await request.json();
    if (!prompt) return new Response("Missing prompt", { status: 400 });

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
      const txt = await openaiRes.text();
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
