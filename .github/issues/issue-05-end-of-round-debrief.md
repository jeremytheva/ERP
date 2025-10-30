# 🔁 Task: End-of-Round Debriefing
- **UI:** `/app/role/lead/debrief`, modal overlay for other roles
- **Data:** `/companies/{companyId}/reports/{reportId}`
- **Access:** Lead triggers generation; all roles read
- **Reference:** `docs/feature-roadmap.md#5`, `docs/architecture.md`, `docs/ui-wireframes.md#cross-cutting-modules`

## User Story
As the team lead, I want automated round summaries that highlight results and next actions so that the team can align quickly.

## Acceptance Criteria
- Debrief view shows highlights, risks, recommendations, and key metrics for the period.
- Lead can trigger report generation via server action calling Genkit; status feedback shown.
- Generated reports stored in Firestore and accessible to all roles.
- Users can download or share the report (placeholder actions acceptable initially).
- UI indicates when no reports are available.

## Data & API Contracts
- Use `RoundReportSchema` from `docs/firestore-schema.ts`.
- Server action `generateRoundReport(companyId: CompanyId, period: number)` orchestrates Genkit call and persistence.
- Provide `getLatestRoundReport(companyId: CompanyId)` for UI consumption.

## UI Component Checklist
- `DebriefReportView`
- `ReportSummaryPanel`
- `ReportGenerateButton`

## Implementation Notes
- Ensure Firestore security rules permit read for all roles and write only through server actions.
- Validate AI output using Zod before storing (guard against missing fields).
