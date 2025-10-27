# Contributing Guidelines

Welcome! Follow these conventions so Codex and humans can collaborate effectively.

## TypeScript & Tooling
- Enable **TypeScript strict mode** (already enforced in `tsconfig.json`).
- Prefer modern ECMAScript syntax and keep modules ES2022 compatible.
- Run `npm run lint` and `npm run test` before submitting changes.

## Server Actions First
- Implement backend logic using **Next.js Server Actions** housed near the consuming route or under `lib/firebase`.
- Server actions must:
  - Validate inputs with Zod schemas from `docs/firestore-schema.ts` or shared modules.
  - Enforce role-based access using helpers in `lib/firebase`.
  - Return typed responses for client components.

## Runtime Validation with Zod
- Define Zod schemas alongside Firestore types and use `.parse` or `.safeParse` before persisting or responding.
- Derive TypeScript types via `z.infer` to guarantee parity between compile-time and runtime contracts.

## UI Implementation
- Build UI using **shadcn/ui** components styled with **Tailwind CSS**.
- Compose reusable primitives in `/components` and wrap them in role-specific pages within `/app/role/*`.
- For charts and data visualizations, use **Recharts** exclusively.
- Favor accessible defaults (ARIA labels, keyboard interactions) baked into components.

## Directory Expectations
```
/app
  /role
    /sales
    /procurement
    /production
    /logistics
    /lead
  /imports
  /settings
/docs
/lib
  /logic
  /firebase
/components
```
Ensure new files respect this structure.

## Testing & Quality
- Add unit tests for logic in `lib/logic` and Firestore adapters in `lib/firebase`.
- Snapshot or integration tests for UI components should live in `__tests__` directories mirroring source location.
- Keep PRs scoped to a single feature/issue and reference the corresponding GitHub issue.

## Working with Codex
- Provide Codex with small, atomic tasks referencing issue numbers and doc sections.
- Include context files when triggering Codex (e.g., `docs/architecture.md`).
- Document any assumptions in the PR description.

Thank you for helping build ERPsim Dashboard!
