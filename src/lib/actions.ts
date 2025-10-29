
"use server";

import {
  simulateScenarioOutcomes,
  SimulateScenarioInput,
} from "@/ai/flows/simulate-scenario-outcomes";
import {
  getStrategicRecommendations,
  StrategicRecommendationsInput,
} from "@/ai/flows/get-strategic-recommendations";
import {
  generateRoundDebriefing,
  GenerateRoundDebriefingInput,
} from "@/ai/flows/generate-round-debriefing";
import {
  answerQuestionsWithAICopilot,
  AnswerQuestionsWithAICopilotInput,
} from "@/ai/flows/answer-questions-with-ai-copilot";
import {
    suggestOptimizedTaskInputs,
} from "@/ai/flows/suggest-optimized-task-inputs";
import type { SuggestOptimizedTaskInputsInput } from "@/lib/zod-schemas";

export const simulateScenarioAction = async (
  input: SimulateScenarioInput
) => {
  try {
    const result = await simulateScenarioOutcomes(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to simulate scenario." };
  }
};

export const getStrategicRecommendationsAction = async (
  input: StrategicRecommendationsInput
) => {
  try {
    const result = await getStrategicRecommendations(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to get recommendations." };
  }
};

export const generateRoundDebriefingAction = async (
  input: GenerateRoundDebriefingInput
) => {
  try {
    const result = await generateRoundDebriefing(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to generate debriefing." };
  }
};

export const answerCopilotQuestionAction = async (
  input: AnswerQuestionsWithAICopilotInput
) => {
  try {
    const result = await answerQuestionsWithAICopilot(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to get an answer." };
  }
};

export const suggestOptimizedTaskInputsAction = async (
    input: SuggestOptimizedTaskInputsInput
) => {
    try {
        const result = await suggestOptimizedTaskInputs(input);
        return { success: true, data: result };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to get AI suggestions." };
    }
}
