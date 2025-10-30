# 🔁 Task: Real-time KPI Dashboard
- **UI:** `/app/role/lead`, `/app/role/sales`, `/app/role/production`
- **Data:** `/companies/{companyId}`, `/companies/{companyId}/companyMetrics/{metricId}`
- **Access:** Read for all roles, writes via server actions
- **Reference:** `docs/feature-roadmap.md#1`, `docs/architecture.md`, `docs/ui-wireframes.md#shared-layout`

## User Story
As a role-based team member, I want to view real-time KPIs tailored to my responsibilities so that I can react quickly to performance changes.

## Acceptance Criteria
- Dashboard surfaces valuation, net income, inventory value, and emissions metrics with trend charts updated from Firestore snapshots.
- Peer comparison table shows current company vs. competitor best and average values.
- Role-based dashboards render appropriate cards (lead sees consolidated KPIs, sales sees revenue focus, production sees throughput).
- Loading and empty states follow shadcn/ui patterns.
- Data refreshes in real-time using Firestore listeners or server actions.

## Data & API Contracts
- Use `CompanySnapshotSchema` and `CompanyMetricSchema` from `docs/firestore-schema.ts` for data typing.
- Server action `getCompanyDashboard(companyId: CompanyId)` returns the snapshot, recent metrics, and peer comparison data.
- Client components subscribe via typed converters or server action revalidation.

## UI Component Checklist
- `ExecutiveDashboard`, `SalesDashboard`, `ProductionDashboard`
- `KpiCard`, `TrendChart`, `PeerComparisonTable`, `ActivityFeed`
- Shared `ShellLayout`

## Implementation Notes
- Align Firestore rules with read-only access for non-lead roles (see `docs/security-rules.md`).
- Validate any derived metric calculations in `lib/logic/kpis.ts` (to be implemented).
