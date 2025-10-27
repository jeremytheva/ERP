
import { z } from 'zod';

export const TaskDataFieldSchema = z.object({
    fieldName: z.string(),
    dataType: z.enum(["Currency", "Integer", "String"]),
    value: z.union([z.number(), z.string(), z.null()]).optional(),
    suggestedValue: z.union([z.number(), z.string(), z.null()]).optional(),
    aiRationale: z.string().optional(),
});

export const TaskSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    role: z.enum(["Procurement", "Production", "Logistics", "Sales", "Team Leader"]),
    transactionCode: z.string(),
    priority: z.enum(["Critical", "High", "Medium", "Low"]),
    estimatedTime: z.number(),
    roundRecurrence: z.enum(["Once", "RoundStart", "Continuous"]),
    startRound: z.number().optional(),
    timeframeConstraint: z.enum(["None", "StartPhase", "MidPhase", "EndPhase"]).optional(),
    dependencyIDs: z.array(z.string()),
    completionType: z.enum(["Manual-Tick", "Data-Confirmed", "System-Validated"]),
    taskType: z.enum(["ERPsim Input Data", "ERPsim Gather Data", "Standard"]),
    dataFields: z.array(TaskDataFieldSchema).optional(),
    completed: z.boolean(),
});

export const KpiSchema = z.object({
    companyValuation: z.number(),
    netIncome: z.number(),
    inventoryValue: z.number(),
    cashBalance: z.number(),
    grossMargin: z.number(),
    marketShare: z.number(),
    averageSellingPrice: z.number(),
    inventoryTurnover: z.number(),
    capacityUtilization: z.number(),
    averagePriceGap: z.number(),
    warehouseCosts: z.number(),
    onTimeDeliveryRate: z.number(),
    cumulativeCO2eEmissions: z.number(),
    competitorAvgPrice: z.number(),
    grossRevenue: z.number(),
    cogs: z.number(),
    sustainabilityInvestment: z.number(),
});

export const KpiHistoryEntrySchema = KpiSchema.extend({ round: z.number() });

export const TimerStateSchema = z.object({
    timeLeft: z.number(),
    isPaused: z.boolean(),
    isBreakActive: z.boolean(),
    isBreakEnabled: z.boolean(),
    roundDuration: z.number(),
    breakDuration: z.number(),
    confirmNextRound: z.boolean(),
});

export const GameStateSchema = KpiSchema.extend({
    kpiHistory: z.array(KpiHistoryEntrySchema),
    teamStrategy: z.string(),
    timerState: TimerStateSchema,
});


export const SuggestOptimizedTaskInputsInputSchema = z.object({
    task: TaskSchema,
    gameState: GameStateSchema,
});
export type SuggestOptimizedTaskInputsInput = z.infer<typeof SuggestOptimizedTaskInputsInputSchema>;

export const OptimizedTaskDataFieldSchema = TaskDataFieldSchema.extend({
    suggestedValue: z.union([z.number(), z.string(), z.null()]).describe("The AI-suggested optimal value for this field."),
    aiRationale: z.string().optional().describe("A brief explanation for why this value was suggested."),
});

export const SuggestOptimizedTaskInputsOutputSchema = z.object({
    updatedTask: TaskSchema.extend({
        dataFields: z.array(OptimizedTaskDataFieldSchema).optional()
    }).describe("The task object with updated suggestedValues and aiRationale for its dataFields."),
});
export type SuggestOptimizedTaskInputsOutput = z.infer<typeof SuggestOptimizedTaskInputsOutputSchema>;
