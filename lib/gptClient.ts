/**
 * GPT API Client
 * Client-side utility for making GPT API requests with streaming support
 */

import type { GPTDomain, GPTResponse } from '../app/api/gpt/types';

interface GPTClientOptions {
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  model?: string;
}

type StreamCallback = (chunk: string) => void;
type CompleteCallback = (data: { tokensUsed: number; model: string }) => void;
type ErrorCallback = (error: Error) => void;

export class GPTClient {
  private baseUrl: string;
  private streamUrl: string;

  constructor(baseUrl: string = '/api/gpt') {
    this.baseUrl = baseUrl;
    this.streamUrl = `${baseUrl}/stream`;
  }

  /**
   * Make a GPT request to a specific domain (non-streaming)
   */
  async request(
    domain: GPTDomain,
    prompt: string,
    options?: GPTClientOptions
  ): Promise<GPTResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain,
          prompt,
          options: {
            ...options,
            stream: false, // Force non-streaming for this method
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('GPT Client Error:', error);
      
      return {
        success: false,
        error: {
          code: 'CLIENT_ERROR',
          message: error instanceof Error ? error.message : 'Request failed',
        },
      };
    }
  }

  /**
   * Make a streaming GPT request
   */
  async requestStream(
    domain: GPTDomain,
    prompt: string,
    callbacks: {
      onChunk: StreamCallback;
      onComplete?: CompleteCallback;
      onError?: ErrorCallback;
    },
    options?: GPTClientOptions
  ): Promise<void> {
    try {
      const response = await fetch(this.streamUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain,
          prompt,
          options,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      // Read SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));

            if (data.error) {
              callbacks.onError?.(new Error(data.error));
              return;
            }

            if (data.done) {
              callbacks.onComplete?.({
                tokensUsed: data.tokensUsed || 0,
                model: data.model || 'unknown',
              });
              return;
            }

            if (data.content) {
              callbacks.onChunk(data.content);
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming Error:', error);
      callbacks.onError?.(
        error instanceof Error ? error : new Error('Streaming failed')
      );
    }
  }

  /**
   * Soul domain request
   */
  async soul(prompt: string, options?: GPTClientOptions): Promise<GPTResponse> {
    return this.request('soul', prompt, options);
  }

  /**
   * Soul domain streaming request
   */
  async soulStream(
    prompt: string,
    callbacks: {
      onChunk: StreamCallback;
      onComplete?: CompleteCallback;
      onError?: ErrorCallback;
    },
    options?: GPTClientOptions
  ): Promise<void> {
    return this.requestStream('soul', prompt, callbacks, options);
  }

  /**
   * Systems domain request
   */
  async systems(prompt: string, options?: GPTClientOptions): Promise<GPTResponse> {
    return this.request('systems', prompt, options);
  }

  /**
   * Systems domain streaming request
   */
  async systemsStream(
    prompt: string,
    callbacks: {
      onChunk: StreamCallback;
      onComplete?: CompleteCallback;
      onError?: ErrorCallback;
    },
    options?: GPTClientOptions
  ): Promise<void> {
    return this.requestStream('systems', prompt, callbacks, options);
  }

  /**
   * AI Tools domain request
   */
  async aiTools(prompt: string, options?: GPTClientOptions): Promise<GPTResponse> {
    return this.request('ai-tools', prompt, options);
  }

  /**
   * AI Tools domain streaming request
   */
  async aiToolsStream(
    prompt: string,
    callbacks: {
      onChunk: StreamCallback;
      onComplete?: CompleteCallback;
      onError?: ErrorCallback;
    },
    options?: GPTClientOptions
  ): Promise<void> {
    return this.requestStream('ai-tools', prompt, callbacks, options);
  }

  /**
   * Insights domain request
   */
  async insights(prompt: string, options?: GPTClientOptions): Promise<GPTResponse> {
    return this.request('insights', prompt, options);
  }

  /**
   * Insights domain streaming request
   */
  async insightsStream(
    prompt: string,
    callbacks: {
      onChunk: StreamCallback;
      onComplete?: CompleteCallback;
      onError?: ErrorCallback;
    },
    options?: GPTClientOptions
  ): Promise<void> {
    return this.requestStream('insights', prompt, callbacks, options);
  }

  /**
   * Health check
   */
  async health(): Promise<any> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'GET',
      });

      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      return { success: false };
    }
  }
}

// Export singleton instance
export const gptClient = new GPTClient();

// Usage examples:
// 
// import { gptClient } from '@/lib/gptClient';
//
// // Non-streaming request
// const response = await gptClient.soul('Help me understand my Visionary archetype');
//
// // Streaming request
// await gptClient.soulStream(
//   'Help me understand my Visionary archetype',
//   {
//     onChunk: (chunk) => console.log(chunk),
//     onComplete: (data) => console.log('Done!', data),
//     onError: (error) => console.error(error),
//   }
// );

