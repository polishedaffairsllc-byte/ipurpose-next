/**
 * GPT Streaming Endpoint
 * Route: /api/gpt/stream
 * Server-Sent Events for streaming responses
 */

import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { firebaseAdmin } from '@/lib/firebaseAdmin';
import type { GPTRequest, GPTDomain } from '../types';
import { getUserContext } from '../utils/context';
import { compilePrompt } from '../prompt-engine/compiler';
import { logInteraction } from '../utils/firestore';
import { callGPTStream, validatePromptLength } from '../utils/gpt-core';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const cookieStore = await cookies();
    const session = cookieStore.get('FirebaseSession')?.value;
    
    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    const decodedToken = await firebaseAdmin.auth().verifySessionCookie(session, true);
    const userId = decodedToken.uid;

    // 2. Parse request
    const body = await request.json();
    const { domain, prompt, options } = body as Partial<GPTRequest>;

    if (!domain || !prompt) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400 }
      );
    }

    // 3. Validate prompt
    if (!validatePromptLength(prompt)) {
      return new Response(
        JSON.stringify({ error: 'Prompt too long' }),
        { status: 400 }
      );
    }

    // 4. Get user context
    const userContext = await getUserContext(userId, domain);

    // 5. Compile prompt
    const compiledPrompt = await compilePrompt({
      domain,
      userPrompt: prompt,
      context: userContext,
    });

    // 6. Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullContent = '';
          let tokensUsed = 0;
          let model = '';
          let finishReason = 'stop';
          
          // Stream GPT response
          const generator = callGPTStream({
            userId,
            domain,
            compiledPrompt,
            temperature: options?.temperature,
            maxTokens: options?.maxTokens,
            model: options?.model,
          });

          for await (const chunk of generator) {
            fullContent += chunk;
            
            // Send SSE event
            const data = JSON.stringify({ content: chunk, done: false });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }

          // Get final result to extract metadata
          const result = await generator.next();
          if (result.value && typeof result.value !== 'string') {
            tokensUsed = result.value.tokensUsed;
            model = result.value.model;
            finishReason = result.value.finishReason;
          }

          // Log interaction
          await logInteraction({
            userId,
            domain,
            prompt,
            response: fullContent,
            tokensUsed,
            context: userContext,
            model,
            finishReason,
            temperature: options?.temperature,
            streamEnabled: true,
          });

          // Send completion event
          const completeData = JSON.stringify({
            content: '',
            done: true,
            tokensUsed,
            model,
          });
          controller.enqueue(encoder.encode(`data: ${completeData}\n\n`));

          controller.close();
        } catch (error) {
          const errorData = JSON.stringify({
            error: error instanceof Error ? error.message : 'Stream failed',
            done: true,
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Streaming error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
}
