import { z } from "zod";

/**
 * Shared Zod schemas for strategic AI features.
 *
 * These schemas are reused across server actions, client components, and
 * Firestore helpers to guarantee consistent data validation when working with
 * AI outputs that are persisted in the `strategies` and `reports` collections.
 */

export const CompetitorLogEntrySchema = z.object({
  id: z.string(),
  text: z.string(),
  author: z.string(),
  createdAt: z.string().nullable().optional(),
});

export const ScenarioAdjustmentsSchema = z.object({
  marketingSpend: z.number().nonnegative(),
  productionVolume: z.number().nonnegative(),
  competitorLog: z.array(CompetitorLogEntrySchema).default([]),
});
export type ScenarioAdjustments = z.infer<typeof ScenarioAdjustmentsSchema>;

export const ScenarioSnapshotSchema = z.object({
  round: z.number().int().positive(),
  marketingSpend: z.number().nonnegative(),
  productionVolume: z.number().nonnegative(),
  teamStrategy: z.string(),
  gameState: z.string(),
  competitorLog: z.string(),
});
export type ScenarioSnapshot = z.infer<typeof ScenarioSnapshotSchema>;

export const SimulationResultSchema = z.object({
  predictedCompanyValuation: z.number(),
  predictedNetIncome: z.number(),
  predictedInventoryValue: z.number(),
  predictedTotalEmissions: z.number(),
});
export type SimulationResult = z.infer<typeof SimulationResultSchema>;

export const StrategyRecordSchema = z.object({
  scenario: ScenarioSnapshotSchema,
  predictions: SimulationResultSchema,
  recommendations: z.string().min(1),
  notes: z.string().optional().default(""),
});
export type StrategyRecord = z.infer<typeof StrategyRecordSchema>;

export const StrategyDocumentSchema = StrategyRecordSchema.extend({
  id: z.string(),
  createdAt: z.date().nullable().optional(),
  updatedAt: z.date().nullable().optional(),
});
export type StrategyDocument = z.infer<typeof StrategyDocumentSchema>;

export const StrategicNoteUpdateSchema = z.object({
  notes: z.string().trim().max(5000).default(""),
});
export type StrategicNoteUpdate = z.infer<typeof StrategicNoteUpdateSchema>;

export const DebriefReportRecordSchema = z.object({
  round: z.number().int().positive(),
  performanceData: z.string().min(1),
  competitorAnalysis: z.string().min(1),
  actionItems: z.string().min(1),
  summaryReport: z.string().min(1),
});
export type DebriefReportRecord = z.infer<typeof DebriefReportRecordSchema>;

export const DebriefReportDocumentSchema = DebriefReportRecordSchema.extend({
  id: z.string(),
  createdAt: z.date().nullable().optional(),
  updatedAt: z.date().nullable().optional(),
});
export type DebriefReportDocument = z.infer<typeof DebriefReportDocumentSchema>;

