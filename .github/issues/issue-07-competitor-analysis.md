# 🔁 Task: Competitor Analysis Log
- **UI:** `/app/role/{role}/competitors`
- **Data:** `/companies/{companyId}/competitorNotes/{noteId}`
- **Access:** All roles read/write their notes; updates restricted to authors or lead
- **Reference:** `docs/feature-roadmap.md#7`, `docs/architecture.md`, `docs/ui-wireframes.md#cross-cutting-modules`

## User Story
As a team member, I want a shared space to log competitor insights so that the team stays informed about market moves.

## Acceptance Criteria
- Notes board grouped by competitor with filters for tags and author role.
- Users can create, edit, and delete their own notes; lead can manage all notes.
- Notes capture summary, details, tags, and timestamp.
- Activity feed integrates new notes and updates.
- UI supports collaborative real-time updates.

## Data & API Contracts
- Use `CompetitorNoteSchema`.
- Server actions for `createCompetitorNote`, `updateCompetitorNote`, `deleteCompetitorNote` enforcing author ownership.
- Provide Firestore listeners for live updates with typed converters.

## UI Component Checklist
- `CompetitorNoteBoard`
- `CompetitorNoteCard`
- `CompetitorNoteEditor`

## Implementation Notes
- Ensure Firestore rules validate `author` matches `request.auth.uid` except for lead role overrides (see `docs/security-rules.md`).
- Consider storing tag metadata in `lib/logic/competitors.ts`.
