import { z } from "zod";

/**
 * Core entity identifiers
 */
export const CompanyId = z.string().min(1, "Company id is required");
export const UserId = z.string().min(1, "User id is required");
export const StrategyId = z.string().min(1, "Strategy id is required");
export const ScenarioId = z.string().min(1, "Scenario id is required");
export const ReportId = z.string().min(1, "Report id is required");
export const ChatSessionId = z.string().min(1, "Chat session id is required");

export type CompanyId = z.infer<typeof CompanyId>;
export type UserId = z.infer<typeof UserId>;
export type StrategyId = z.infer<typeof StrategyId>;
export type ScenarioId = z.infer<typeof ScenarioId>;
export type ReportId = z.infer<typeof ReportId>;
export type ChatSessionId = z.infer<typeof ChatSessionId>;

export const Role = z.enum([
  "sales",
  "procurement",
  "production",
  "logistics",
  "lead",
]);
export type Role = z.infer<typeof Role>;

/**
 * Company level documents
 */
export const CompanySnapshotSchema = z.object({
  name: z.string(),
  period: z.number().int().nonnegative(),
  valuation: z.number(),
  netIncome: z.number(),
  inventoryValue: z.number(),
  totalEmissions: z.number(),
  cashOnHand: z.number(),
  activeStrategyId: StrategyId.nullable(),
  lastUpdatedAt: z.date(),
});
export type CompanySnapshot = z.infer<typeof CompanySnapshotSchema>;

export const CompanyMetricSchema = z.object({
  period: z.number().int().nonnegative(),
  metric: z.string(),
  value: z.number(),
  unit: z.string().optional(),
  peerAverage: z.number().optional(),
  competitorBest: z.number().optional(),
  recordedAt: z.date(),
});
export type CompanyMetric = z.infer<typeof CompanyMetricSchema>;

/**
 * Strategy documents
 */
export const StrategyDocumentSchema = z.object({
  strategyId: StrategyId,
  companyId: CompanyId,
  title: z.string(),
  description: z.string().min(1),
  ownerRole: Role,
  currentFocus: z.array(z.string()).default([]),
  kpis: z.array(
    z.object({
      key: z.string(),
      target: z.number(),
      current: z.number().optional(),
      unit: z.string().optional(),
    })
  ),
  aiRecommendations: z.array(
    z.object({
      id: z.string(),
      summary: z.string(),
      impact: z.enum(["low", "medium", "high"]),
      confidence: z.number().min(0).max(1),
      createdAt: z.date(),
    })
  ),
  updatedAt: z.date(),
});
export type StrategyDocument = z.infer<typeof StrategyDocumentSchema>;

export const StrategyRevisionSchema = z.object({
  revisionId: z.string(),
  strategyId: StrategyId,
  createdBy: UserId,
  createdRole: Role,
  changes: z.array(
    z.object({
      field: z.string(),
      previous: z.any().optional(),
      next: z.any(),
    })
  ),
  createdAt: z.date(),
});
export type StrategyRevision = z.infer<typeof StrategyRevisionSchema>;

/**
 * Scenario simulation documents
 */
export const ScenarioInputSchema = z.object({
  scenarioId: ScenarioId,
  companyId: CompanyId,
  createdBy: UserId,
  createdRole: Role,
  parameters: z.record(z.string(), z.union([z.number(), z.string()])),
  submittedAt: z.date(),
});
export type ScenarioInput = z.infer<typeof ScenarioInputSchema>;

export const ScenarioResultSchema = z.object({
  scenarioId: ScenarioId,
  companyId: CompanyId,
  period: z.number().int().nonnegative(),
  outcomes: z.record(z.string(), z.number()),
  recommendations: z.array(z.string()),
  generatedBy: z.literal("genkit"),
  generatedAt: z.date(),
});
export type ScenarioResult = z.infer<typeof ScenarioResultSchema>;

/**
 * Action items
 */
export const ActionItemSchema = z.object({
  actionItemId: z.string(),
  companyId: CompanyId,
  assignedTo: UserId,
  assignedRole: Role,
  source: z.enum(["manual", "ai", "strategy"]),
  title: z.string(),
  description: z.string().optional(),
  duePeriod: z.number().int().nonnegative().optional(),
  status: z.enum(["pending", "in_progress", "completed"]),
  linkedStrategyId: StrategyId.nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type ActionItem = z.infer<typeof ActionItemSchema>;

/**
 * Competitor notes
 */
export const CompetitorNoteSchema = z.object({
  noteId: z.string(),
  companyId: CompanyId,
  competitorName: z.string(),
  author: UserId,
  authorRole: Role,
  summary: z.string(),
  detail: z.string().optional(),
  tags: z.array(z.string()).default([]),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type CompetitorNote = z.infer<typeof CompetitorNoteSchema>;

/**
 * Reports
 */
export const RoundReportSchema = z.object({
  reportId: ReportId,
  companyId: CompanyId,
  period: z.number().int().nonnegative(),
  highlights: z.array(z.string()),
  risks: z.array(z.string()),
  recommendations: z.array(z.string()),
  generatedBy: z.literal("genkit"),
  generatedAt: z.date(),
});
export type RoundReport = z.infer<typeof RoundReportSchema>;

/**
 * Chat sessions
 */
export const ChatMessageSchema = z.object({
  messageId: z.string(),
  sessionId: ChatSessionId,
  sender: z.enum(["user", "assistant"]),
  role: Role,
  content: z.string(),
  createdAt: z.date(),
  references: z.array(z.string()).default([]),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ChatSessionSchema = z.object({
  sessionId: ChatSessionId,
  companyId: CompanyId,
  createdBy: UserId,
  createdRole: Role,
  purpose: z.string(),
  createdAt: z.date(),
  lastInteractionAt: z.date(),
});
export type ChatSession = z.infer<typeof ChatSessionSchema>;

/**
 * Collection map for Firestore converters
 */
export const Collections = {
  companies: CompanySnapshotSchema,
  companyMetrics: CompanyMetricSchema,
  strategies: StrategyDocumentSchema,
  strategyRevisions: StrategyRevisionSchema,
  scenarios: ScenarioInputSchema,
  scenarioResults: ScenarioResultSchema,
  actionItems: ActionItemSchema,
  competitorNotes: CompetitorNoteSchema,
  reports: RoundReportSchema,
  chatSessions: ChatSessionSchema,
  chatMessages: ChatMessageSchema,
} as const;

export type Collections = typeof Collections;
