# iPurpose Mentor: Hybrid AI Coach Modes

## Overview

The iPurpose Mentor is a sophisticated AI coaching system with four distinct response modes, each designed to guide users through different perspectives of their journey: soul (alignment), systems (structure), and AI (expansion).

## Response Modes

### 1. **Balanced Mode** (Default)
- **Purpose**: Intelligent routing between all three lenses
- **How It Works**: The system analyzes your message and automatically infers which perspective you need most
- **When to Use**: Most conversations; lets the AI choose the best lens for your question
- **Example**: Ask "How do I automate my workflow?" → AI detects AI lens keywords and responds with systems/automation focus

### 2. **Reflect Mode** 🧘
- **Lens**: SOUL (Alignment)
- **Focus**: Purpose, values, meaning, inner clarity
- **Questions It Answers**:
  - What matters most to me?
  - Am I aligned with my values?
  - What is my true purpose?
  - How do I want to feel?
- **Voice**: Introspective, grounded, inviting self-discovery

### 3. **Build Mode** 🏗️
- **Lens**: SYSTEMS (Structure)
- **Focus**: Workflows, processes, strategic foundation, offers
- **Questions It Answers**:
  - How do I structure my day/week?
  - What's the right process for this?
  - How do I build a sustainable offer?
  - What systems do I need?
- **Voice**: Clear, practical, methodical

### 4. **Expand Mode** 🚀
- **Lens**: AI (Expansion)
- **Focus**: Automation, capacity, technology leverage, scaling
- **Questions It Answers**:
  - How can I automate this?
  - What tools can help?
  - How do I scale my impact?
  - How can AI help me?
- **Voice**: Strategic, forward-thinking, solution-focused

## Architecture

### Files & Structure

```
lib/ai/
├── prompts/
│   └── ipurposeMentorPrompts.ts       # System prompts for all 4 modes
├── responseModePersistence.ts          # localStorage + Firestore storage
└── useAIChatWithModes.ts              # React hook for chat management

app/ai/
├── page.tsx                            # Server component (authentication)
└── AIClient.tsx                        # Client component (chat UI)

app/api/ai/
└── chat.ts                            # POST endpoint for chat requests
```

### Data Flow

```
User Message
    ↓
AIClient Component (client-side)
    ↓
POST /api/ai/chat with mode + userId
    ↓
API Route: getSystemPrompt() → OpenAI API
    ↓
Response + inferredLens
    ↓
AIClient displays message + lens label
    ↓
localStorage + Firestore updated
```

## System Prompts

All prompts follow the iPurpose voice guidelines:
- **Simple**: One concept at a time
- **Warm**: Friendly but not salesy
- **Grounded**: Rooted in practical wisdom
- **Clear**: Focused on clarity over complexity

### Balanced Mode Prompt
Located in `ipurposeMentorPrompts.ts`, the balanced prompt includes:
- Core iPurpose philosophy
- Three lens definitions
- Inference heuristics for detecting which lens to use
- Instructions to reference user context when relevant

### Reflect Prompt
Guides users through SOUL lens:
- Exploring purpose and values
- Finding alignment
- Connecting inner wisdom
- Creating meaningful change

### Build Prompt
Guides users through SYSTEMS lens:
- Structuring workflows
- Creating sustainable processes
- Building strategic offers
- Establishing foundations

### Expand Prompt
Guides users through AI lens:
- Identifying automation opportunities
- Leveraging technology
- Scaling impact
- Multiplying capacity

## Lens Inference Logic (Balanced Mode)

When in Balanced mode, the system automatically detects keywords in your message:

### Soul Keywords
`purpose`, `meaning`, `values`, `aligned`, `feel`, `matter`, `important`, `why`, `meaningful`, `authentic`, `true self`, etc.

### Systems Keywords
`workflow`, `process`, `system`, `structure`, `build`, `framework`, `offer`, `how to`, `step`, `phase`, `implement`, `execute`, etc.

### AI Keywords
`ai`, `automate`, `automation`, `tool`, `technology`, `chatgpt`, `leverage`, `scale`, `efficiency`, `multiply`, `capacity`, etc.

**Scoring**: The system counts keyword matches and routes to the lens with the highest score. If no clear match, defaults to Systems.

## Persistence & Storage

### localStorage Strategy
- **Accessed**: Every time you open the chat
- **Updated**: Instantly when you change modes
- **Key**: `ipurposeMentorMode`
- **Fallback**: If Firestore fails, localStorage is your working copy

### Firestore Storage
- **Path**: `users/{uid}/aiPreferences/responseMode`
- **Fields**:
  - `responseMode`: "balanced" | "reflect" | "build" | "expand"
  - `lastUpdated`: ISO timestamp
- **Strategy**: Updates asynchronously in background
- **Benefit**: Syncs preference across devices

## API Endpoint: `/api/ai/chat`

### Request Format
```json
{
  "message": "How do I balance structure with flexibility?",
  "responseMode": "balanced",
  "userId": "user123",
  "conversationHistory": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ],
  "model": "gpt-4o-mini"  // optional, defaults to gpt-4o-mini
}
```

### Response Format
```json
{
  "response": "Great question. In Balanced mode, I'm sensing you're asking about Systems...",
  "inferredLens": "systems",  // null for non-Balanced modes
  "responseMode": "balanced",
  "model": "gpt-4o-mini"
}
```

### Error Handling
- **400 Bad Request**: Missing required fields
- **500 Internal Error**: OpenAI API failure or other server error
- Returns error message in response for display to user

## Testing the System

### Test Balanced Mode Inference
1. Switch to Balanced mode
2. Send a message with clear keywords:
   - "What does success mean to me?" → Should detect SOUL
   - "How do I organize my workflow?" → Should detect SYSTEMS
   - "Can AI help with this?" → Should detect AI
3. Check response for lens label: `(soul)`, `(systems)`, or `(ai)`

### Test Mode Persistence
1. Select "Reflect" mode
2. Refresh the page
3. Mode should still be "Reflect" (loaded from localStorage)
4. Close and reopen in a new session
5. Mode should persist (synced from Firestore)

### Test Different Mode Responses
1. Ask the same question in each mode
2. Observe how the tone and focus differ
3. "Build" mode emphasizes structure
4. "Reflect" mode emphasizes meaning
5. "Expand" mode emphasizes scale & automation

## Firestore Security Rules

Add these rules to allow authenticated users to store their preferences:

```javascript
match /users/{uid}/aiPreferences/{document=**} {
  allow read, write: if request.auth.uid == uid;
}
```

This ensures:
- Users can only read/write their own preferences
- Unauthenticated users cannot access
- The system is secure by default

## Future Enhancements

Potential improvements for future phases:
- **Conversation History**: Store full conversations in Firestore for continuity across sessions
- **Analytics**: Track which lens users prefer, response satisfaction ratings
- **Custom Prompts**: Allow users to create custom system prompts for their own coaching
- **Multi-turn Context**: Enhanced lens detection based on conversation history
- **Voice Integration**: Voice input/output for hands-free mentoring
- **Export**: Download conversation transcripts as PDF/markdown

## Troubleshooting

### Modes Not Persisting
- Check localStorage in DevTools (Cmd+Option+I → Application → Local Storage)
- Verify `ipurposeMentorMode` key exists
- Check browser's storage quota

### Inference Not Working in Balanced Mode
- Check keyword lists in `inferLensFromMessage()`
- Ensure message contains at least one keyword
- Default is "systems" lens if no clear match

### API Errors
- Verify `OPENAI_API_KEY` is set in environment
- Check `/api/ai/chat` endpoint is reachable
- Review OpenAI API status and rate limits
- Check browser console for error details

## Voice & Tone Guide

All prompts follow these iPurpose principles:

```
NOT: "Maximize your productivity by leveraging AI-driven solutions..."
BUT: "What if you automated the repetitive parts? That frees you for what matters."

NOT: "Your values are undefined. Let's do exercises."
BUT: "What matters most to you right now?"

NOT: "Here's the 7-step system to implement."
BUT: "First, let's clarify what you're building and why."
```

Key principles:
- **Warm, not corporate**: Sound like a trusted mentor, not a consultant
- **Question-based**: Invite reflection rather than prescribe
- **Simple language**: Use words your grandma would understand
- **One thing at a time**: Focus on clarity, not completeness
- **Grounded**: References real iPurpose philosophy

## Files to Review

1. **Prompts**: `/lib/ai/prompts/ipurposeMentorPrompts.ts`
   - Read all 4 prompts
   - Understand keyword inference logic

2. **Persistence**: `/lib/ai/responseModePersistence.ts`
   - Understand dual-strategy (localStorage + Firestore)
   - Review error handling

3. **Chat UI**: `/app/ai/AIClient.tsx`
   - Mode selector buttons
   - Chat history display
   - Message sending logic

4. **API Endpoint**: `/app/api/ai/chat.ts`
   - Request/response format
   - System prompt injection
   - Error handling

## Questions?

For implementation details, refer to inline code comments in each file. All functions have detailed JSDoc comments explaining purpose, inputs, and outputs.
