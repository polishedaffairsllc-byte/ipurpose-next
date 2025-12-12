# GPT API Integration Structure

## Overview
Complete API infrastructure for GPT integration across the iPurpose platform. This phase establishes routing, types, prompt compilation, and Firestore context management **without real GPT calls** (Phase 7).

---

## Directory Structure

```
app/api/gpt/
├── route.ts                    # Central endpoint: POST /api/gpt
├── router.ts                   # Domain request router
├── types.ts                    # TypeScript type definitions
│
├── soul/
│   └── handler.ts              # Soul domain handler
├── systems/
│   └── handler.ts              # Systems domain handler
├── ai-tools/
│   └── handler.ts              # AI Tools domain handler
├── insights/
│   └── handler.ts              # Insights domain handler
│
├── prompt-engine/
│   ├── compiler.ts             # Prompt compilation with context
│   └── templates.ts            # Domain-specific prompt templates
│
└── utils/
    ├── context.ts              # Firestore user context management
    └── firestore.ts            # Interaction logging utilities
```

---

## API Endpoints

### `POST /api/gpt`
Central GPT endpoint that routes requests to domain-specific handlers.

**Request Body:**
```typescript
{
  domain: 'soul' | 'systems' | 'ai-tools' | 'insights',
  prompt: string,
  context?: UserContext,
  options?: {
    temperature?: number,
    maxTokens?: number,
    stream?: boolean,
    model?: string
  }
}
```

**Response:**
```typescript
{
  success: boolean,
  data?: {
    content: string,
    tokensUsed: number,
    model: string,
    timestamp: string
  },
  error?: {
    code: string,
    message: string
  }
}
```

### `GET /api/gpt`
Health check endpoint.

**Response:**
```typescript
{
  success: true,
  message: "GPT API is ready",
  version: "1.0.0",
  domains: ["soul", "systems", "ai-tools", "insights"]
}
```

---

## Domain Handlers

### Soul Handler (`/soul/handler.ts`)
**Purpose:** Soul alignment, archetypes, purpose discovery

**Context Used:**
- `archetypes`: User's identified archetypes
- `purposeStatement`: Current purpose statement
- `values`: Core values
- `alignmentScore`: Current alignment percentage

**System Prompt Focus:**
- Nurturing yet direct communication
- Purpose-aligned guidance
- Archetype exploration support

---

### Systems Handler (`/systems/handler.ts`)
**Purpose:** Business infrastructure, workflows, automation

**Context Used:**
- `activeWorkflows`: Current workflow systems
- `offerStructure`: Offer and pricing architecture
- `integrations`: Connected services
- `automationPreferences`: Automation settings

**System Prompt Focus:**
- Strategic yet accessible communication
- Practical, actionable guidance
- Systems optimization

---

### AI Tools Handler (`/ai-tools/handler.ts`)
**Purpose:** Content generation, prompts, AI-powered tools

**Context Used:**
- `favoriteTools`: Frequently used tools
- `recentPrompts`: Prompt history
- `contentStyle`: Content preferences
- `brandVoice`: Brand identity

**System Prompt Focus:**
- Creative yet strategic communication
- Brand-aligned content generation
- Authentic voice preservation

---

### Insights Handler (`/insights/handler.ts`)
**Purpose:** Data analysis, trends, strategic insights

**Context Used:**
- `metricPreferences`: Preferred metrics
- `dashboardConfig`: Dashboard settings
- `reportingFrequency`: Report preferences

**System Prompt Focus:**
- Analytical yet intuitive communication
- Data-driven recommendations
- Pattern recognition

---

## Prompt Engine

### Compiler (`prompt-engine/compiler.ts`)

**`compilePrompt(options)`**
Compiles prompts with user context and domain templates.

```typescript
const compiledPrompt = await compilePrompt({
  domain: 'soul',
  userPrompt: 'Help me discover my purpose',
  context: userContext,
});

// Returns:
// {
//   systemPrompt: "You are an aligned AI mentor...",
//   userPrompt: "Help me discover my purpose",
//   context: { ... }
// }
```

**Features:**
- Context injection into system prompts
- Variable replacement in templates
- Domain-specific enhancements

---

### Templates (`prompt-engine/templates.ts`)

**System Prompts:**
- Soul: Nurturing mentor for purpose discovery
- Systems: Strategic architect for business infrastructure
- AI Tools: Content creation specialist
- Insights: Data analyst and strategic advisor

**Template Functions:**
- `getPromptTemplate(domain)`: Get default template for domain
- `getTemplatesByDomain(domain)`: Get all templates for domain
- `getTemplateById(templateId)`: Get specific template
- `getSystemPrompt(domain)`: Get base system prompt

---

## Firestore Integration

### Collections

**`user-contexts`**
Stores user context data for personalized GPT responses.

```typescript
{
  userId: string,
  lastUpdated: Date,
  preferences: {
    communicationStyle: 'direct' | 'nurturing' | 'strategic',
    focusAreas: string[],
    language: string
  },
  soul: {
    archetypes: string[],
    purposeStatement: string,
    values: string[],
    alignmentScore: number
  },
  systems: {
    activeWorkflows: string[],
    offerStructure: string[],
    integrations: string[]
  },
  aiTools: {
    favoriteTools: string[],
    recentPrompts: string[],
    brandVoice: string
  },
  insights: {
    metricPreferences: string[],
    dashboardConfig: object
  }
}
```

**`gpt-interactions`**
Logs all GPT interactions for analytics and context building.

```typescript
{
  userId: string,
  domain: 'soul' | 'systems' | 'ai-tools' | 'insights',
  prompt: string,
  response: string,
  tokensUsed: number,
  timestamp: Date,
  context: object
}
```

---

### Context Utilities (`utils/context.ts`)

**`getUserContext<T>(userId, domain)`**
Retrieves user context from Firestore for a specific domain.

```typescript
const context = await getUserContext<SoulContext>(userId, 'soul');
// Returns soul-specific context merged with base preferences
```

**`updateUserContext(userId, domain, contextData)`**
Updates user context for a specific domain.

```typescript
await updateUserContext(userId, 'soul', {
  archetypes: ['Visionary', 'Builder'],
  purposeStatement: 'Empowering purpose-driven entrepreneurs',
});
```

**`initializeUserContext(userId)`**
Creates initial context document for new users.

```typescript
await initializeUserContext(userId);
// Called during user signup
```

---

### Firestore Utilities (`utils/firestore.ts`)

**`logInteraction(params)`**
Logs a GPT interaction to Firestore.

```typescript
await logInteraction({
  userId,
  domain: 'soul',
  prompt: 'Help me discover my purpose',
  response: '...',
  tokensUsed: 450,
  context: userContext,
});
```

**`getInteractionHistory(userId, domain?, limit?)`**
Retrieves interaction history for analytics.

```typescript
const history = await getInteractionHistory(userId, 'soul', 10);
// Returns last 10 soul-domain interactions
```

**`getTokenUsage(userId, startDate?, endDate?)`**
Calculates token usage statistics.

```typescript
const stats = await getTokenUsage(userId);
// Returns:
// {
//   total: 5420,
//   byDomain: {
//     soul: 1200,
//     systems: 2100,
//     'ai-tools': 1520,
//     insights: 600
//   }
// }
```

---

## Type Definitions

### Core Types

**`GPTRequest`**
```typescript
{
  domain: 'soul' | 'systems' | 'ai-tools' | 'insights',
  prompt: string,
  userId: string,
  context?: UserContext,
  options?: GPTOptions
}
```

**`GPTResponse`**
```typescript
{
  success: boolean,
  data?: {
    content: string,
    tokensUsed: number,
    model: string,
    timestamp: string
  },
  error?: { code: string, message: string }
}
```

**`UserContext`**
Base context extended by domain-specific contexts:
- `SoulContext`
- `SystemsContext`
- `AIToolsContext`
- `InsightsContext`

---

## Usage Example

```typescript
// Client-side usage
async function getSoulGuidance(prompt: string) {
  const response = await fetch('/api/gpt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      domain: 'soul',
      prompt: 'Help me understand my Visionary archetype',
      options: {
        temperature: 0.7,
        maxTokens: 1000,
      },
    }),
  });

  const data = await response.json();
  
  if (data.success) {
    console.log(data.data.content);
  } else {
    console.error(data.error.message);
  }
}
```

---

## Current Status: Phase 6 Complete ✅

### Implemented:
- ✅ Central GPT router at `/api/gpt`
- ✅ 4 domain-specific handlers (soul, systems, ai-tools, insights)
- ✅ Complete TypeScript type system
- ✅ Prompt engine with context compilation
- ✅ Domain-specific system prompts
- ✅ Firestore user context management
- ✅ Interaction logging utilities
- ✅ Token usage tracking

### NOT Implemented (Phase 7):
- ❌ Actual OpenAI API calls
- ❌ Streaming responses
- ❌ Real token counting
- ❌ Rate limiting
- ❌ Error retry logic
- ❌ Response caching

---

## Next Steps: Phase 7

1. **OpenAI Integration**
   - Add OpenAI SDK
   - Implement GPT-4 API calls
   - Add streaming support
   - Implement token counting

2. **Rate Limiting**
   - Per-user rate limits
   - Token budget management
   - Quota tracking

3. **Error Handling**
   - Retry logic for API failures
   - Graceful degradation
   - User-friendly error messages

4. **Optimization**
   - Response caching
   - Context pruning for token efficiency
   - Prompt optimization

---

## Testing

### Test Central Router
```bash
curl -X GET http://localhost:3000/api/gpt
```

### Test Domain Request (requires authentication)
```bash
curl -X POST http://localhost:3000/api/gpt \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "soul",
    "prompt": "Help me discover my purpose"
  }'
```

---

## Architecture Benefits

1. **Separation of Concerns:** Each domain has isolated handler logic
2. **Type Safety:** Full TypeScript coverage across all layers
3. **Context-Aware:** User context automatically injected into prompts
4. **Scalable:** Easy to add new domains or modify existing ones
5. **Observable:** All interactions logged for analytics
6. **Flexible:** Template system allows prompt customization
7. **Testable:** Mock responses make testing straightforward

---

**Status:** Ready for Phase 7 GPT integration 🚀
