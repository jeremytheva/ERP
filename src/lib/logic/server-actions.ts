"use server";

import { z } from "zod";
import { ScenarioBuilder } from "./scenario-builder";
import { SalesScenarioRunner } from "./sales-scenario-runner";
import {
  CompetitorLogEntrySchema,
  DebriefReportRecordSchema,
  StrategyRecordSchema,
} from "./strategic-schemas";
import { GameStateSchema } from "@/lib/zod-schemas";
import {
  generateRoundDebriefing,
  GenerateRoundDebriefingInput,
} from "@/ai/flows/generate-round-debriefing";

const SalesScenarioActionInputSchema = z.object({
  marketingSpend: z.number(),
  productionVolume: z.number(),
  gameState: GameStateSchema,
  competitorLog: z.array(CompetitorLogEntrySchema).default([]),
});

export type RunSalesScenarioActionInput = z.infer<
  typeof SalesScenarioActionInputSchema
>;

export async function runSalesScenarioAction(
  rawInput: RunSalesScenarioActionInput
) {
  try {
    const input = SalesScenarioActionInputSchema.parse(rawInput);
    const builder = new ScenarioBuilder({
      gameState: input.gameState,
      adjustments: {
        marketingSpend: input.marketingSpend,
        productionVolume: input.productionVolume,
        competitorLog: input.competitorLog,
      },
    });

    const runner = new SalesScenarioRunner(builder);
    const record = await runner.run();

    return { success: true, data: StrategyRecordSchema.parse(record) } as const;
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to run sales scenario." } as const;
  }
}

const DebriefReportActionInputSchema = DebriefReportRecordSchema.pick({
  round: true,
  performanceData: true,
  competitorAnalysis: true,
  actionItems: true,
}).extend({});

type DebriefReportActionInput = z.infer<typeof DebriefReportActionInputSchema>;

export async function generateDebriefReportAction(
  rawInput: DebriefReportActionInput
) {
  try {
    const input = DebriefReportActionInputSchema.parse(rawInput);
    const flowInput: GenerateRoundDebriefingInput = {
      performanceData: input.performanceData,
      competitorAnalysis: input.competitorAnalysis,
      actionItems: input.actionItems,
    };

    const report = await generateRoundDebriefing(flowInput);

    return {
      success: true,
      data: DebriefReportRecordSchema.parse({
        ...input,
        summaryReport: report.summaryReport,
      }),
    } as const;
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to generate debrief report." } as const;
  }
}

