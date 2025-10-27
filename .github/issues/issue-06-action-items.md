# 🔁 Task: Action Items Management
- **UI:** `/app/role/{role}/actions`
- **Data:** `/companies/{companyId}/actionItems/{actionItemId}`
- **Access:** Assigned role updates status; lead manages assignments
- **Reference:** `docs/feature-roadmap.md#6`, `docs/architecture.md`, `docs/ui-wireframes.md#cross-cutting-modules`

## User Story
As a team member, I want a real-time list of my action items linked to strategic goals so that I can manage my tasks effectively.

## Acceptance Criteria
- Action list filters by assigned user/role and reflects completion status in real-time.
- Users can mark tasks complete/in progress with optimistic UI and server validation.
- Lead can create, reassign, or update due periods via dedicated controls.
- Action items show linkage to strategies and AI recommendations where applicable.
- Empty and loading states follow design guidelines.

## Data & API Contracts
- Use `ActionItemSchema`.
- Server actions:
  - `createActionItem(payload: ActionItem)` (lead only)
  - `updateActionItemStatus(id: string, status: ActionItem["status"])`
  - `reassignActionItem(id: string, assignedTo: UserId, assignedRole: Role)`
- Provide Firestore converters for live subscription.

## UI Component Checklist
- `ActionItemList`
- `ActionItemDetailDrawer`
- `ActionItemCreateForm`

## Implementation Notes
- Enforce Firestore rules ensuring only assigned user or lead may modify (see `docs/security-rules.md`).
- Store domain helpers in `lib/logic/action-items.ts` for filtering and status transitions.
