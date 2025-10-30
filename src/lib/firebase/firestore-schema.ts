export const ROLE_SLUGS = [
  "procurement",
  "production",
  "logistics",
  "sales",
] as const;

export type RoleSlug = typeof ROLE_SLUGS[number];

export const TEAM_LEADER_SLUG = "team-leader" as const;

export type ElevatedRoleSlug = RoleSlug | typeof TEAM_LEADER_SLUG;

export const ROLE_COMPONENT_KEYS = [
  "dashboard",
  "keyMetrics",
  "procurement",
  "production",
  "logistics",
  "sales",
  "liveInventory",
  "masterData",
  "scenarioPlanning",
  "debriefing",
  "strategicAdvisor",
  "competitorLog",
] as const;

export type RoleComponentKey = typeof ROLE_COMPONENT_KEYS[number];

export interface RoleDefinition {
  id: RoleSlug;
  displayName: string;
  description: string;
  avatarUrl: string;
  defaultPath: string;
  permittedComponents: RoleComponentKey[];
}

export interface TeamLeaderDefinition {
  id: typeof TEAM_LEADER_SLUG;
  displayName: string;
  description: string;
  defaultPath: string;
  permittedComponents: RoleComponentKey[];
}

export const ROLE_DEFINITIONS: Record<RoleSlug, RoleDefinition> = {
  procurement: {
    id: "procurement",
    displayName: "Procurement",
    description: "Oversees sourcing, purchasing, and supplier coordination.",
    avatarUrl: "https://picsum.photos/seed/procurement/100/100",
    defaultPath: "/app/role/procurement",
    permittedComponents: [
      "dashboard",
      "keyMetrics",
      "procurement",
      "liveInventory",
      "masterData",
    ],
  },
  production: {
    id: "production",
    displayName: "Production",
    description: "Plans production schedules and manages shop-floor execution.",
    avatarUrl: "https://picsum.photos/seed/production/100/100",
    defaultPath: "/app/role/production",
    permittedComponents: [
      "dashboard",
      "keyMetrics",
      "production",
      "liveInventory",
      "masterData",
    ],
  },
  logistics: {
    id: "logistics",
    displayName: "Logistics",
    description: "Manages stock transfers, deliveries, and working capital.",
    avatarUrl: "https://picsum.photos/seed/logistics/100/100",
    defaultPath: "/app/role/logistics",
    permittedComponents: [
      "dashboard",
      "keyMetrics",
      "logistics",
      "masterData",
    ],
  },
  sales: {
    id: "sales",
    displayName: "Sales",
    description: "Owns demand forecasting, pricing, and marketing levers.",
    avatarUrl: "https://picsum.photos/seed/sales/100/100",
    defaultPath: "/app/role/sales",
    permittedComponents: [
      "dashboard",
      "keyMetrics",
      "sales",
      "scenarioPlanning",
      "debriefing",
      "liveInventory",
      "masterData",
    ],
  },
};

export const TEAM_LEADER_DEFINITION: TeamLeaderDefinition = {
  id: TEAM_LEADER_SLUG,
  displayName: "Team Leader",
  description: "Coordinates cross-role strategy, investments, and alignment.",
  defaultPath: "/app/role/team-leader",
  permittedComponents: [
    "dashboard",
    "keyMetrics",
    "strategicAdvisor",
    "debriefing",
    "competitorLog",
  ],
};

export type TimestampValue =
  | string
  | number
  | Date
  | { seconds: number; nanoseconds: number }
  | null
  | undefined;

export interface FirestoreRoleProfileDocument {
  id: RoleSlug;
  displayName: string;
  avatarUrl: string;
  lastSelectedAt?: TimestampValue;
}

export interface FirestoreUserDocument {
  uid: string;
  activeRoleId: RoleSlug | null;
  roles: Partial<Record<RoleSlug, FirestoreRoleProfileDocument>>;
  createdAt?: TimestampValue;
  updatedAt?: TimestampValue;
}

export const isRoleSlug = (value: string | null | undefined): value is RoleSlug => {
  if (!value) return false;
  return (ROLE_SLUGS as readonly string[]).includes(value);
};
