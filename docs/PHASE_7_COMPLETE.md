# Phase 7: OpenAI Integration - Complete ✅

## Overview
Phase 7 adds production-ready OpenAI GPT integration with real API calls, streaming responses, rate limiting, and comprehensive token tracking.

## What Was Implemented

### 1. OpenAI Client Setup
**File:** `app/api/gpt/utils/openai-client.ts`

Features:
- OpenAI SDK initialization with API key validation
- Configurable models (default: gpt-4-turbo-preview, fallback: gpt-3.5-turbo)
- Domain-specific temperature defaults:
  - Soul: 0.7 (creative, empathetic)
  - Systems: 0.5 (balanced, practical)
  - AI Tools: 0.8 (creative, diverse)
  - Insights: 0.4 (precise, analytical)
- Health check function for API connectivity

Configuration Constants:
```typescript
OPENAI_CONFIG = {
  models: {
    default: 'gpt-4-turbo-preview',
    fallback: 'gpt-3.5-turbo',
    tokenLimits: { ... }
  },
  temperature: {
    soul: 0.7,
    systems: 0.5,
    'ai-tools': 0.8,
    insights: 0.4
  },
  rateLimits: {
    requestsPerMinute: 60,
    tokensPerMinute: 90000,
    requestsPerDay: 1000,
    tokensPerDay: 500000
  }
}
```

### 2. Rate Limiting System
**File:** `app/api/gpt/utils/rate-limiter.ts`

Features:
- Per-user rate limits tracked in Firestore
- Minute-based and daily windows
- Request and token counting
- Automatic window reset
- Grace period handling

Firestore Collection: `rate-limits`
```typescript
{
  userId: string;
  requests: { perMinute: number; perDay: number };
  tokens: { perMinute: number; perDay: number };
  windowStart: { minute: Date; day: Date };
  lastRequest: Date;
}
```

Rate Limit Checks:
- 60 requests/minute
- 90,000 tokens/minute
- 1,000 requests/day
- 500,000 tokens/day

### 3. Core GPT Logic
**File:** `app/api/gpt/utils/gpt-core.ts`

#### Standard API Calls
```typescript
async function callGPT(options: {
  userId: string;
  domain: GPTDomain;
  compiledPrompt: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}): Promise<GPTCallResult>
```

Features:
- Rate limit validation before API call
- OpenAI API error handling (429, 401, 500)
- Automatic token recording after completion
- Configurable temperature and max tokens
- Model selection with fallback

#### Streaming API Calls
```typescript
async function* callGPTStream(options: {
  userId: string;
  domain: GPTDomain;
  compiledPrompt: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}): AsyncGenerator<string, GPTCallResult, void>
```

Features:
- Yields content chunks in real-time
- Token estimation for streaming responses
- Same rate limiting and error handling as standard calls
- Returns final metadata (tokens, model, finish reason)

#### Prompt Validation
```typescript
function validatePromptLength(prompt: string): boolean
```
- Max 8,000 characters
- Prevents excessive token usage

### 4. Enhanced Firestore Logging
**File:** `app/api/gpt/utils/firestore.ts` (modified)

New Metadata Fields:
```typescript
{
  model: string;              // e.g., "gpt-4-turbo-preview"
  finishReason: string;       // e.g., "stop", "length", "content_filter"
  temperature: number;        // Model temperature used
  streamEnabled: boolean;     // Whether streaming was used
}
```

### 5. Updated Domain Handlers
**Files:**
- `app/api/gpt/soul/handler.ts`
- `app/api/gpt/systems/handler.ts`
- `app/api/gpt/ai-tools/handler.ts`
- `app/api/gpt/insights/handler.ts`

All handlers now follow this pattern:
1. **Validate** prompt length
2. **Fetch** user context from Firestore
3. **Compile** prompt using domain templates
4. **Call** OpenAI API (real GPT call)
5. **Log** interaction with full metadata
6. **Return** real response with token usage

Example (Soul Handler):
```typescript
export async function handleSoulRequest(
  userId: string,
  request: GPTRequest
): Promise<GPTResponse> {
  // 1. Validate
  if (!validatePromptLength(request.prompt)) {
    return { success: false, error: { code: 'INVALID_INPUT', message: 'Prompt too long' } };
  }

  // 2. Get context
  const userContext = await getUserContext<SoulContext>(userId, 'soul');

  // 3. Compile prompt
  const compiledPrompt = await compilePrompt({
    domain: 'soul',
    userPrompt: request.prompt,
    context: userContext,
  });

  // 4. Call OpenAI
  const result = await callGPT({
    userId,
    domain: 'soul',
    compiledPrompt,
    temperature: request.options?.temperature || 0.7,
    maxTokens: request.options?.maxTokens,
    model: request.options?.model,
  });

  // 5. Log interaction
  await logInteraction({
    userId,
    domain: 'soul',
    prompt: request.prompt,
    response: result.content,
    tokensUsed: result.tokensUsed,
    context: userContext,
    model: result.model,
    finishReason: result.finishReason,
    temperature: request.options?.temperature || 0.7,
    streamEnabled: false,
  });

  // 6. Return
  return {
    success: true,
    data: {
      content: result.content,
      tokensUsed: result.tokensUsed,
      model: result.model,
      timestamp: new Date().toISOString(),
    },
  };
}
```

### 6. Streaming Endpoint
**File:** `app/api/gpt/stream/route.ts`

Route: `POST /api/gpt/stream`

Features:
- Server-Sent Events (SSE) for real-time streaming
- Same authentication and validation as standard endpoint
- Chunks sent as they arrive from OpenAI
- Final metadata sent on completion

Response Format:
```
data: {"content":"Hello","done":false}
data: {"content":" there","done":false}
data: {"content":"!","done":false}
data: {"content":"","done":true,"tokensUsed":8,"model":"gpt-4-turbo-preview"}
```

### 7. Client Library
**File:** `lib/gptClient.ts`

#### Standard Requests
```typescript
import { gptClient } from '@/lib/gptClient';

// Non-streaming request
const response = await gptClient.soul('Help me understand my purpose');
console.log(response.data?.content);
```

#### Streaming Requests
```typescript
await gptClient.soulStream(
  'Help me understand my purpose',
  {
    onChunk: (chunk) => {
      console.log('Received:', chunk);
      // Update UI with incremental content
    },
    onComplete: (data) => {
      console.log('Done!', data.tokensUsed, 'tokens used');
    },
    onError: (error) => {
      console.error('Stream error:', error);
    },
  }
);
```

Available Methods:
- `soul(prompt, options)` / `soulStream(prompt, callbacks, options)`
- `systems(prompt, options)` / `systemsStream(prompt, callbacks, options)`
- `aiTools(prompt, options)` / `aiToolsStream(prompt, callbacks, options)`
- `insights(prompt, options)` / `insightsStream(prompt, callbacks, options)`

## Environment Setup

### Required Environment Variable
Add to `.env.local`:
```bash
OPENAI_API_KEY=sk-your_openai_api_key_here
```

Get your API key from: https://platform.openai.com/api-keys

### Optional Configuration
```bash
# Override default model (optional)
OPENAI_DEFAULT_MODEL=gpt-4-turbo-preview
```

## API Error Handling

The system handles these OpenAI API errors:
- **429** (Rate Limit): "Rate limit exceeded. Please try again later."
- **401** (Auth): "OpenAI API authentication failed"
- **500** (Service Error): "OpenAI service error. Please try again."
- **Network Errors**: "Failed to connect to OpenAI"

## Token Usage Tracking

Every interaction is logged with:
```typescript
{
  userId: string;
  domain: GPTDomain;
  prompt: string;
  response: string;
  tokensUsed: number;
  model: string;
  finishReason: string;
  temperature: number;
  streamEnabled: boolean;
  timestamp: Date;
  context: UserContext;
}
```

Query token usage:
```typescript
import { getTokenUsage } from '@/app/api/gpt/utils/firestore';

const usage = await getTokenUsage(userId, 'soul');
console.log('Total tokens:', usage.total);
```

## Rate Limiting

Users are limited to:
- 60 requests/minute
- 90,000 tokens/minute
- 1,000 requests/day
- 500,000 tokens/day

Check rate limit status:
```typescript
import { getRateLimitStatus } from '@/app/api/gpt/utils/rate-limiter';

const status = await getRateLimitStatus(userId);
console.log('Remaining requests:', status.remaining.requests.perMinute);
```

## Testing

### 1. Test Health Check
```bash
curl http://localhost:3000/api/gpt -X GET
```

Expected: `{ success: true }`

### 2. Test Standard Request
```bash
curl http://localhost:3000/api/gpt -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "soul",
    "prompt": "What is my purpose?"
  }'
```

Expected:
```json
{
  "success": true,
  "data": {
    "content": "Your purpose is...",
    "tokensUsed": 150,
    "model": "gpt-4-turbo-preview",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### 3. Test Streaming Request
```bash
curl http://localhost:3000/api/gpt/stream -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "soul",
    "prompt": "What is my purpose?"
  }'
```

Expected (SSE stream):
```
data: {"content":"Your","done":false}
data: {"content":" purpose","done":false}
data: {"content":" is...","done":false}
data: {"content":"","done":true,"tokensUsed":150,"model":"gpt-4-turbo-preview"}
```

## Integration with Frontend

### Example React Component (Streaming)
```tsx
'use client';

import { useState } from 'react';
import { gptClient } from '@/lib/gptClient';

export default function SoulChat() {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (prompt: string) => {
    setLoading(true);
    setResponse('');

    await gptClient.soulStream(
      prompt,
      {
        onChunk: (chunk) => {
          setResponse(prev => prev + chunk);
        },
        onComplete: (data) => {
          console.log('Tokens used:', data.tokensUsed);
          setLoading(false);
        },
        onError: (error) => {
          console.error(error);
          setLoading(false);
        },
      }
    );
  };

  return (
    <div>
      <button onClick={() => handleSubmit('Help me understand my purpose')}>
        Ask Soul
      </button>
      <div>{response}</div>
      {loading && <div>Loading...</div>}
    </div>
  );
}
```

## Security & Best Practices

✅ **API Key Security**
- Never commit `.env.local` to version control
- Use environment variables only
- API key validated on server startup

✅ **Rate Limiting**
- Per-user limits prevent abuse
- Firestore-backed tracking
- Automatic window reset

✅ **Authentication**
- All endpoints require Firebase session cookie
- User ID extracted from verified token

✅ **Error Handling**
- Graceful degradation on API errors
- User-friendly error messages
- Full error logging for debugging

✅ **Token Management**
- Prompt length validation (8,000 chars max)
- Response token limits (2,000 max)
- Usage tracking per interaction

## What's Next (Phase 8+)

Potential enhancements:
- [ ] Admin dashboard for token usage monitoring
- [ ] User-facing rate limit indicators
- [ ] Cached responses for common queries
- [ ] Fine-tuned models for specific domains
- [ ] Cost analysis and budgeting tools
- [ ] Conversation history and memory
- [ ] Multi-turn dialogue support
- [ ] GPT-4 Vision for image analysis
- [ ] Function calling for tool integration

## Summary

Phase 7 successfully replaces all mock GPT responses with real OpenAI API calls. The implementation includes:

✅ Full OpenAI SDK integration  
✅ Real GPT-4 API calls with streaming  
✅ Per-user rate limiting (minute + daily)  
✅ Comprehensive token usage tracking  
✅ Domain-specific temperature optimization  
✅ Production-ready error handling  
✅ Enhanced Firestore logging  
✅ Client library with streaming support  

Build Status: ✅ Passing  
Routes Created: `/api/gpt`, `/api/gpt/stream`  
Dependencies: `openai` (npm package)  
Firestore Collections: `gpt-interactions`, `rate-limits`, `user-contexts`

---

**Phase 7 Complete!** 🎉
