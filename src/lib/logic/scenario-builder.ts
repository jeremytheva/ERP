import { GameState } from "@/types";
import { GameStateSchema } from "@/lib/zod-schemas";
import type {
  SimulateScenarioInput,
} from "@/ai/flows/simulate-scenario-outcomes";
import type {
  StrategicRecommendationsInput,
} from "@/ai/flows/get-strategic-recommendations";
import { z } from "zod";
import {
  ScenarioAdjustmentsSchema,
  ScenarioSnapshotSchema,
  type ScenarioAdjustments,
  type ScenarioSnapshot,
} from "./strategic-schemas";

const BuilderConfigSchema = ScenarioAdjustmentsSchema.extend({
  gameState: GameStateSchema,
});

type BuilderConfig = z.infer<typeof BuilderConfigSchema>;

interface ScenarioBuilderParams {
  gameState: GameState;
  adjustments: Partial<ScenarioAdjustments>;
}

export class ScenarioBuilder {
  private config: BuilderConfig;

  constructor({ gameState, adjustments }: ScenarioBuilderParams) {
    this.config = BuilderConfigSchema.parse({
      gameState,
      marketingSpend: adjustments.marketingSpend ?? 0,
      productionVolume: adjustments.productionVolume ?? 0,
      competitorLog: adjustments.competitorLog ?? [],
    });
  }

  setAdjustments(adjustments: Partial<ScenarioAdjustments>) {
    this.config = BuilderConfigSchema.parse({
      ...this.config,
      ...adjustments,
    });
    return this;
  }

  buildSimulationInput(): SimulateScenarioInput {
    const { marketingSpend, productionVolume, gameState } = this.config;
    return {
      marketingSpend,
      productionVolume,
      currentGameState: JSON.stringify(gameState),
    };
  }

  buildRecommendationsInput(): StrategicRecommendationsInput {
    const { gameState, competitorLog } = this.config;
    return {
      gameState: JSON.stringify(gameState),
      teamStrategy: gameState.teamStrategy,
      companyValuation: gameState.companyValuation,
      netIncome: gameState.netIncome,
      inventoryValue: gameState.inventoryValue,
      totalEmissions: gameState.cumulativeCO2eEmissions,
      competitorAnalysisLog: JSON.stringify(competitorLog),
    };
  }

  buildScenarioSnapshot(): ScenarioSnapshot {
    const { gameState, marketingSpend, productionVolume, competitorLog } =
      this.config;
    const lastRound =
      gameState.kpiHistory[gameState.kpiHistory.length - 1]?.round ?? 1;

    return ScenarioSnapshotSchema.parse({
      round: lastRound,
      marketingSpend,
      productionVolume,
      teamStrategy: gameState.teamStrategy,
      gameState: JSON.stringify(gameState),
      competitorLog: JSON.stringify(competitorLog),
    });
  }
}

