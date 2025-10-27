# 🔁 Task: Role-based Authentication & Profile Selection
- **UI:** `/app/(auth)` route for profile chooser, shared layout header avatar
- **Data:** Firebase Auth anonymous sign-in, `/companies/{companyId}` for context
- **Access:** All roles authenticate; role claim controls downstream access
- **Reference:** `docs/feature-roadmap.md#2`, `docs/architecture.md`, `docs/security-rules.md`

## User Story
As a user, I want to sign in quickly using a predefined ERPsim persona so that I can access the dashboard tailored to my role.

## Acceptance Criteria
- Persona selection screen lists configured profiles with role badges.
- Selecting a persona triggers anonymous auth and assigns custom claims (role, companyId).
- Auth state persists across sessions and is accessible via server actions.
- Unauthorized users are redirected to the profile selection screen.
- Lead role gains access to strategic settings; other roles are scoped to their dashboards.

## Data & API Contracts
- `lib/firebase/auth.ts` should expose `signInWithPersona(personaId: string)` returning `{ userId, role, companyId }` typed via Zod.
- Server action `getSessionContext()` returns the authenticated user context and role for SSR.
- Persona configurations stored in `/app/imports/personas.ts` (placeholder file to be created) referencing schema from `docs/firestore-schema.ts`.

## UI Component Checklist
- `PersonaSelectionGrid`
- `RoleBadge`
- `HeaderUserMenu`

## Implementation Notes
- Update Firestore security rules to assert `request.auth.token.role` is present (see `docs/security-rules.md`).
- Ensure strict TypeScript types using Zod inference (see `docs/firestore-schema.ts`).
