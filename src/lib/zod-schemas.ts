
import { z } from 'zod';

export const TaskDataFieldSchema = z.object({
    fieldName: z.string(),
    dataType: z.enum(["Currency", "Integer", "String"]),
    value: z.union([z.number(), z.string(), z.null()]).optional(),
    suggestedValue: z.union([z.number(), z.string(), z.null()]).optional(),
    aiRationale: z.string().optional(),
});

const GoalCalculationSchema = z.object({
    baseMetric: z.enum(["Cash", "CO2e", "COGS", "GrossMargin", "RM Cost", "Revenue", "SetupTime", "TransportCost", "Utilisation"]),
    targetType: z.enum(["increase", "decrease"]),
    targetValue: z.number(),
    minLimit: z.number().optional(),
    maxLimit: z.number().optional(),
    constraints: z.array(z.string()),
    formula: z.string(),
});

export const TaskSchema = z.object({
    id: z.string(),
    version: z.number().optional(),
    round: z.number().optional(),
    title: z.string(),
    description: z.string(),
    role: z.enum(["Procurement", "Production", "Production Manager", "Logistics", "Sales", "Sales Manager", "Team Leader"]),
    transactionCode: z.string(),
    priority: z.enum(["Critical", "High", "Medium", "Low"]),
    estimatedTime: z.number(),
    roundRecurrence: z.enum(["Once", "RoundStart", "Continuous"]),
    startRound: z.number().optional(),
    roundStartOffsetMinutes: z.number().nullable().optional(),
    roundDueOffsetMinutes: z.number().nullable().optional(),
    dependencyIDs: z.array(z.string()),
    completionType: z.enum(["Manual-Tick", "Data-Confirmed", "System-Validated", "Ongoing"]),
    taskType: z.enum(["ERPsim Input Data", "ERPsim Gather Data", "Standard"]),
    dataFields: z.array(TaskDataFieldSchema).optional(),
    completed: z.boolean().default(false),
    impact: z.enum(["Capacity", "Revenue", "Risk"]).nullable().optional(),
    visibility: z.enum(["Always", "OnAlert"]).optional(),
    alertKey: z.string().nullable().optional(),
    goalMetric: z.enum(["Cash", "CO2e", "COGS", "GrossMargin", "RM Cost", "Revenue", "SetupTime", "TransportCost", "Utilisation"]).optional(),
    goalTargetType: z.enum(["increase", "decrease"]).optional(),
    goalTargetValue: z.number().optional(),
    goalUnit: z.string().optional(),
    goalRationale: z.string().optional(),
    goalCalculation: GoalCalculationSchema.optional(),
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
export type OptimizedTaskDataField = z.infer<typeof OptimizedTaskDataFieldSchema>;

export const SuggestOptimizedTaskInputsOutputSchema = z.object({
    updatedTask: TaskSchema.extend({
        dataFields: z.array(OptimizedTaskDataFieldSchema).optional()
    }).describe("The task object with updated suggestedValues and aiRationale for its dataFields."),
});
export type SuggestOptimizedTaskInputsOutput = z.infer<typeof SuggestOptimizedTaskInputsOutputSchema>;

    