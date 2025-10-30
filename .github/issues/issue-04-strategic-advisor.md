# 🔁 Task: Strategic Advisor
- **UI:** `/app/role/lead/strategy`
- **Data:** `/companies/{companyId}/strategies/{strategyId}`, `/companies/{companyId}/strategyRevisions/{revisionId}`
- **Access:** Lead role for writes, others read-only
- **Reference:** `docs/feature-roadmap.md#4`, `docs/architecture.md`, `docs/ui-wireframes.md#lead-role`

## User Story
As the team lead, I want AI-assisted strategic recommendations with tracked revisions so that I can steer the company effectively.

## Acceptance Criteria
- Strategy settings page displays current strategy details, KPIs, and AI recommendations.
- Lead can edit sections with form validation and persist updates to Firestore.
- Users can request fresh AI recommendations via Genkit flow; results appended to the strategy document.
- Revision history view lists changes with author, timestamp, and diff summary.
- Non-lead roles view strategy content read-only.

## Data & API Contracts
- Use `StrategyDocumentSchema` and `StrategyRevisionSchema`.
- Server actions:
  - `updateStrategy(input: StrategyDocument)` for validated updates.
  - `requestStrategyRecommendations(strategyId: StrategyId)` for Genkit invocation.
  - `logStrategyRevision(revision: StrategyRevision)` for audit trail.

## UI Component Checklist
- `StrategySettingsPage`
- `StrategicNotesEditor`
- `AdvisorInsights`
- `RevisionHistoryList`

## Implementation Notes
- Ensure Firestore rules restrict writes to lead role (see `docs/security-rules.md`).
- Maintain strict typing using Zod inference from the schema file.
