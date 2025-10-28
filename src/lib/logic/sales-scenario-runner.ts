import { ScenarioBuilder } from "./scenario-builder";
import {
  StrategyRecordSchema,
  type StrategyRecord,
} from "./strategic-schemas";
import { simulateScenarioOutcomes } from "@/ai/flows/simulate-scenario-outcomes";
import { getStrategicRecommendations } from "@/ai/flows/get-strategic-recommendations";

export class SalesScenarioRunner {
  constructor(private readonly builder: ScenarioBuilder) {}

  async run(): Promise<StrategyRecord> {
    const simulation = await simulateScenarioOutcomes(
      this.builder.buildSimulationInput()
    );

    const recommendations = await getStrategicRecommendations(
      this.builder.buildRecommendationsInput()
    );

    return StrategyRecordSchema.parse({
      scenario: this.builder.buildScenarioSnapshot(),
      predictions: simulation,
      recommendations: recommendations.recommendations,
      notes: "",
    });
  }
}

