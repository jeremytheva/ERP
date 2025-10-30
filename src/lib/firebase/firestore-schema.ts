import { z } from "zod";

export const roleComponentIdSchema = z.enum([
  "dashboard",
  "key-metrics",
  "live-inventory",
  "master-data",
  "production",
  "procurement",
  "logistics",
  "sales",
  "debriefing",
  "scenario-planning",
  "strategic-advisor",
  "competitor-log",
  "settings",
]);

export type RoleComponentId = z.infer<typeof roleComponentIdSchema>;

export const roleProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatarUrl: z.string().optional().default(""),
  defaultComponent: roleComponentIdSchema,
  permittedComponents: z.array(roleComponentIdSchema).min(1),
});

export type RoleProfileDocument = z.infer<typeof roleProfileSchema>;

const ROLE_PROFILE_DATA: RoleProfileDocument[] = [
  {
    id: "procurement",
    name: "Procurement",
    avatarUrl: "https://picsum.photos/seed/procurement/100/100",
    defaultComponent: "dashboard",
    permittedComponents: [
      "dashboard",
      "key-metrics",
      "live-inventory",
      "procurement",
      "master-data",
      "settings",
    ],
  },
  {
    id: "production",
    name: "Production",
    avatarUrl: "https://picsum.photos/seed/production/100/100",
    defaultComponent: "dashboard",
    permittedComponents: [
      "dashboard",
      "key-metrics",
      "live-inventory",
      "production",
      "master-data",
      "settings",
    ],
  },
  {
    id: "logistics",
    name: "Logistics",
    avatarUrl: "https://picsum.photos/seed/logistics/100/100",
    defaultComponent: "dashboard",
    permittedComponents: [
      "dashboard",
      "key-metrics",
      "logistics",
      "master-data",
      "settings",
    ],
  },
  {
    id: "sales",
    name: "Sales",
    avatarUrl: "https://picsum.photos/seed/sales/100/100",
    defaultComponent: "dashboard",
    permittedComponents: [
      "dashboard",
      "key-metrics",
      "live-inventory",
      "sales",
      "debriefing",
      "strategic-advisor",
      "scenario-planning",
      "master-data",
      "settings",
    ],
  },
  {
    id: "team-leader",
    name: "Team Leader",
    avatarUrl: "https://picsum.photos/seed/team-leader/100/100",
    defaultComponent: "dashboard",
    permittedComponents: [
      "dashboard",
      "key-metrics",
      "strategic-advisor",
      "debriefing",
      "competitor-log",
      "settings",
    ],
  },
];

export const ROLE_PROFILES: RoleProfileDocument[] = ROLE_PROFILE_DATA.map((profile) =>
  roleProfileSchema.parse(profile)
);

export const userPersonaSchema = z.object({
  uid: z.string(),
  roleId: z.string(),
  updatedAt: z.number().optional(),
});

export type UserPersonaDocument = z.infer<typeof userPersonaSchema>;
