import { FieldValue } from "firebase-admin/firestore";

import { getAdminFirestore } from "@/firebase/admin";
import {
  SalesScenarioRequest,
  SalesScenarioResult,
  SalesScenarioResultSchema,
} from "@/lib/zod-schemas";
import { simulateScenarioOutcomes } from "@/ai/flows/simulate-scenario-outcomes";
import { getStrategicRecommendations } from "@/ai/flows/get-strategic-recommendations";

import { ScenarioBuilder } from "./scenario-builder";

export class SalesScenarioRunner {
  constructor(private readonly builder = new ScenarioBuilder()) {}

  async run(request: SalesScenarioRequest): Promise<SalesScenarioResult> {
    const buildResult = this.builder.build(request);
    const [predictions, recommendationsResult] = await Promise.all([
      simulateScenarioOutcomes(buildResult.simulationInput),
      getStrategicRecommendations(buildResult.recommendationsInput),
    ]);

    const db = getAdminFirestore();
    const strategyRef = db.collection("strategies").doc();

    const optimisticStrategy = this.builder.createOptimisticDocument(
      strategyRef.id,
      buildResult,
      predictions,
      recommendationsResult.recommendations
    );

    const batch = db.batch();
    batch.set(strategyRef, {
      gameId: optimisticStrategy.gameId,
      authorId: optimisticStrategy.authorId,
      scenario: optimisticStrategy.scenario,
      predictions: optimisticStrategy.predictions,
      recommendations: optimisticStrategy.recommendations,
      notes: optimisticStrategy.notes,
      status: optimisticStrategy.status,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    await batch.commit();

    return SalesScenarioResultSchema.parse({
      strategyId: strategyRef.id,
      predictions,
      recommendations: recommendationsResult.recommendations,
      scenario: buildResult.validatedRequest.scenario,
      optimisticStrategy,
    });
  }
}
