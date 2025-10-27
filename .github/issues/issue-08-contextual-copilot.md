# 🔁 Task: Contextual AI Copilot
- **UI:** Persistent chat in `/components/CopilotChatWindow`, entry points in each role dashboard
- **Data:** `/companies/{companyId}/chatSessions/{sessionId}`, `/companies/{companyId}/chatSessions/{sessionId}/messages/{messageId}`
- **Access:** Session participants (creator role + lead)
- **Reference:** `docs/feature-roadmap.md#8`, `docs/architecture.md`, `docs/ui-wireframes.md#cross-cutting-modules`

## User Story
As any role, I want to chat with an AI copilot that understands our company context so that I can get timely guidance.

## Acceptance Criteria
- Chat window supports streaming responses with loading indicators and error handling.
- Messages persist to Firestore with references to data used (strategy, metrics, etc.).
- Users can start new sessions scoped to their company context.
- Genkit flow uses current company snapshot and role to craft responses.
- Access limited to creator role and lead.

## Data & API Contracts
- Use `ChatSessionSchema` and `ChatMessageSchema`.
- Server actions:
  - `createChatSession(input: ChatSession)`
  - `postChatMessage(sessionId: ChatSessionId, message: ChatMessage)` (validates role access and triggers Genkit).
  - `streamAssistantReply(sessionId: ChatSessionId)` returning async iterator or streaming payload.

## UI Component Checklist
- `CopilotChatWindow`
- `ChatMessageList`
- `ChatComposer`

## Implementation Notes
- Apply Firestore security constraints for participants (see `docs/security-rules.md`).
- Store Genkit prompt templates under `lib/logic/copilot-prompts.ts`.
