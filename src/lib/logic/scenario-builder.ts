import {
  SalesScenarioRequest,
  SalesScenarioRequestSchema,
  SimulatedScenarioResult,
  StrategyDocument,
  StrategyDocumentSchema,
} from "@/lib/zod-schemas";
import type { SimulateScenarioInput } from "@/ai/flows/simulate-scenario-outcomes";
import type { StrategicRecommendationsInput } from "@/ai/flows/get-strategic-recommendations";

export interface ScenarioBuildResult {
  validatedRequest: SalesScenarioRequest;
  simulationInput: SimulateScenarioInput;
  recommendationsInput: StrategicRecommendationsInput;
}

export class ScenarioBuilder {
  build(request: SalesScenarioRequest): ScenarioBuildResult {
    const validatedRequest = SalesScenarioRequestSchema.parse(request);
    const { scenario, gameState, competitorLog } = validatedRequest;

    const simulationInput: SimulateScenarioInput = {
      marketingSpend: scenario.marketingSpend,
      productionVolume: scenario.productionVolume,
      currentGameState: JSON.stringify(gameState),
    };

    const recommendationsInput: StrategicRecommendationsInput = {
      gameState: JSON.stringify(gameState),
      teamStrategy: gameState.teamStrategy,
      companyValuation: gameState.companyValuation,
      netIncome: gameState.netIncome,
      inventoryValue: gameState.inventoryValue,
      totalEmissions: gameState.cumulativeCO2eEmissions,
      competitorAnalysisLog: JSON.stringify(competitorLog ?? []),
    };

    return {
      validatedRequest,
      simulationInput,
      recommendationsInput,
    };
  }

  createOptimisticDocument(
    docId: string,
    buildResult: ScenarioBuildResult,
    predictions: SimulatedScenarioResult,
    recommendations: string
  ): StrategyDocument {
    const {
      validatedRequest: { gameId, authorId, scenario, gameState, initialNotes },
    } = buildResult;

    return StrategyDocumentSchema.parse({
      id: docId,
      gameId,
      authorId,
      scenario: {
        ...scenario,
        gameStateSnapshot: gameState,
      },
      predictions,
      recommendations,
      notes: initialNotes ?? "",
      status: "complete",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
