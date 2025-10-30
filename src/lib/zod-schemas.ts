
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
    dependencyIDs: z.array(z.string()),
    completionType: z.enum(["Manual-Tick", "Data-Confirmed", "System-Validated"]),
    taskType: z.enum(["ERPsim Input Data", "ERPsim Gather Data", "Standard"]),
    dataFields: z.array(TaskDataFieldSchema).optional(),
    completed: z.boolean().default(false),
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

export const CompetitorLogEntrySchema = z.object({
    id: z.string(),
    text: z.string(),
    author: z.string(),
    createdAt: z
        .union([
            z.date(),
            z.object({ seconds: z.number(), nanoseconds: z.number() }),
            z.string(),
            z.number(),
            z.null(),
            z.undefined(),
        ])
        .optional(),
});

export const ScenarioConfigSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    marketingSpend: z.number().nonnegative(),
    productionVolume: z.number().nonnegative(),
});
export type ScenarioConfig = z.infer<typeof ScenarioConfigSchema>;

export const SimulatedScenarioResultSchema = z.object({
    predictedCompanyValuation: z.number(),
    predictedNetIncome: z.number(),
    predictedInventoryValue: z.number(),
    predictedTotalEmissions: z.number(),
});
export type SimulatedScenarioResult = z.infer<typeof SimulatedScenarioResultSchema>;

const FirestoreTimestampSchema = z
    .union([
        z.date(),
        z.object({ seconds: z.number(), nanoseconds: z.number() }),
        z.string(),
        z.number(),
        z.null(),
        z.undefined(),
    ])
    .optional();

export const StrategyDocumentSchema = z.object({
    id: z.string(),
    gameId: z.string(),
    authorId: z.string(),
    scenario: ScenarioConfigSchema.extend({
        gameStateSnapshot: GameStateSchema,
    }),
    predictions: SimulatedScenarioResultSchema,
    recommendations: z.string(),
    notes: z.string().optional(),
    status: z.enum(["pending", "complete"]),
    createdAt: FirestoreTimestampSchema,
    updatedAt: FirestoreTimestampSchema,
});
export type StrategyDocument = z.infer<typeof StrategyDocumentSchema>;

export const SalesScenarioRequestSchema = z.object({
    gameId: z.string().min(1),
    authorId: z.string().min(1),
    scenario: ScenarioConfigSchema,
    gameState: GameStateSchema,
    competitorLog: z.array(CompetitorLogEntrySchema).default([]),
    initialNotes: z.string().optional(),
});
export type SalesScenarioRequest = z.infer<typeof SalesScenarioRequestSchema>;

export const SalesScenarioResultSchema = z.object({
    strategyId: z.string(),
    predictions: SimulatedScenarioResultSchema,
    recommendations: z.string(),
    scenario: ScenarioConfigSchema,
    optimisticStrategy: StrategyDocumentSchema,
});
export type SalesScenarioResult = z.infer<typeof SalesScenarioResultSchema>;

export const StrategyNotesUpdateSchema = z.object({
    strategyId: z.string().min(1),
    notes: z.string(),
    authorId: z.string().min(1),
});
export type StrategyNotesUpdate = z.infer<typeof StrategyNotesUpdateSchema>;

export const DebriefReportRequestSchema = z.object({
    gameId: z.string().min(1),
    authorId: z.string().min(1),
    performanceData: z.string().min(1),
    competitorAnalysis: z.string().min(1),
    actionItems: z.string().min(1),
    round: z.number().min(1),
});
export type DebriefReportRequest = z.infer<typeof DebriefReportRequestSchema>;

export const DebriefReportDocumentSchema = z.object({
    id: z.string(),
    gameId: z.string(),
    authorId: z.string(),
    round: z.number(),
    summaryReport: z.string(),
    performanceData: z.string(),
    competitorAnalysis: z.string(),
    actionItems: z.string(),
    createdAt: FirestoreTimestampSchema,
    updatedAt: FirestoreTimestampSchema,
});
export type DebriefReportDocument = z.infer<typeof DebriefReportDocumentSchema>;

    