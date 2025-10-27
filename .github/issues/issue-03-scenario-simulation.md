# 🔁 Task: Scenario Simulation Tool
- **UI:** `/app/role/{role}/scenario`
- **Data:** `/companies/{companyId}/scenarios/{scenarioId}`, `/companies/{companyId}/scenarioResults/{scenarioId}`
- **Access:** Creator role and lead
- **Reference:** `docs/feature-roadmap.md#3`, `docs/architecture.md`, `docs/ui-wireframes.md#cross-cutting-modules`

## User Story
As a role owner, I want to simulate potential actions against the current company state so that I can evaluate their impact before execution.

## Acceptance Criteria
- Scenario builder form captures parameters (numbers and strings) validated with Zod.
- Submitting a scenario triggers a server action that stores the input and invokes a Genkit flow.
- Generated results persist to Firestore and display with charts/tables reflecting outcome metrics.
- Users can view a history of past simulations and rerun them with tweaks.
- Access limited to scenario creator and lead role.

## Data & API Contracts
- Use `ScenarioInputSchema` and `ScenarioResultSchema` from `docs/firestore-schema.ts`.
- Server action `runScenario(input: ScenarioInput)` handles validation, persistence, Genkit call, and result storage.
- Results include `outcomes` map and `recommendations` array displayed in UI.

## UI Component Checklist
- `ScenarioBuilder`
- `ScenarioHistoryList`
- `ScenarioResultPanel`
- `SalesScenarioRunner` or role-specific wrappers

## Implementation Notes
- Confirm Firestore rules restrict writes to creator/lead (see `docs/security-rules.md`).
- Domain logic lives in `lib/logic/scenario.ts` for deterministic calculations before AI call.
