"use server";

import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";

import { getAdminFirestore } from "@/firebase/admin";
import { SalesScenarioRunner } from "@/lib/logic/sales-scenario-runner";
import {
  DebriefReportDocumentSchema,
  DebriefReportRequest,
  DebriefReportRequestSchema,
  SalesScenarioRequest,
  SalesScenarioRequestSchema,
  SalesScenarioResult,
  StrategyNotesUpdate,
  StrategyNotesUpdateSchema,
} from "@/lib/zod-schemas";
import { generateRoundDebriefing } from "@/ai/flows/generate-round-debriefing";

const salesScenarioRunner = new SalesScenarioRunner();

export async function runSalesScenarioAction(
  input: SalesScenarioRequest
): Promise<SalesScenarioResult> {
  const validatedInput = SalesScenarioRequestSchema.parse(input);
  return salesScenarioRunner.run(validatedInput);
}

const StrategyNotesUpdateResultSchema = z.object({
  strategyId: z.string(),
  notes: z.string(),
  updatedAt: z.date(),
});

export type StrategyNotesUpdateResult = z.infer<
  typeof StrategyNotesUpdateResultSchema
>;

export async function updateStrategyNotesAction(
  input: StrategyNotesUpdate
): Promise<StrategyNotesUpdateResult> {
  const validatedInput = StrategyNotesUpdateSchema.parse(input);
  const db = getAdminFirestore();
  const strategyRef = db.collection("strategies").doc(validatedInput.strategyId);

  const batch = db.batch();
  batch.update(strategyRef, {
    notes: validatedInput.notes,
    updatedAt: FieldValue.serverTimestamp(),
  });
  await batch.commit();

  return StrategyNotesUpdateResultSchema.parse({
    strategyId: validatedInput.strategyId,
    notes: validatedInput.notes,
    updatedAt: new Date(),
  });
}

const DebriefReportResultSchema = z.object({
  reportId: z.string(),
  summaryReport: z.string(),
  optimisticReport: DebriefReportDocumentSchema,
});

export type DebriefReportResult = z.infer<typeof DebriefReportResultSchema>;

export async function generateDebriefReportAction(
  input: DebriefReportRequest
): Promise<DebriefReportResult> {
  const validatedInput = DebriefReportRequestSchema.parse(input);

  const aiResult = await generateRoundDebriefing({
    performanceData: validatedInput.performanceData,
    competitorAnalysis: validatedInput.competitorAnalysis,
    actionItems: validatedInput.actionItems,
  });

  const db = getAdminFirestore();
  const reportRef = db.collection("reports").doc();

  const optimisticReport = DebriefReportDocumentSchema.parse({
    id: reportRef.id,
    gameId: validatedInput.gameId,
    authorId: validatedInput.authorId,
    round: validatedInput.round,
    summaryReport: aiResult.summaryReport,
    performanceData: validatedInput.performanceData,
    competitorAnalysis: validatedInput.competitorAnalysis,
    actionItems: validatedInput.actionItems,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const batch = db.batch();
  batch.set(reportRef, {
    gameId: optimisticReport.gameId,
    authorId: optimisticReport.authorId,
    round: optimisticReport.round,
    summaryReport: optimisticReport.summaryReport,
    performanceData: optimisticReport.performanceData,
    competitorAnalysis: optimisticReport.competitorAnalysis,
    actionItems: optimisticReport.actionItems,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  await batch.commit();

  return DebriefReportResultSchema.parse({
    reportId: reportRef.id,
    summaryReport: aiResult.summaryReport,
    optimisticReport,
  });
}
