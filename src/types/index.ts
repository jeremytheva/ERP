import { Timestamp } from "firebase/firestore";

export type UserProfile = {
  id: string;
  name: string;
  avatarUrl: string;
};

export type Kpi = {
  companyValuation: number;
  netIncome: number;
  inventoryValue: number;
  cashBalance: number;
  grossMargin: number;
  marketShare: number;
  averageSellingPrice: number;
  inventoryTurnover: number;
  capacityUtilization: number;
  averagePriceGap: number;
  warehouseCosts: number;
  onTimeDeliveryRate: number;
  cumulativeCO2eEmissions: number;
  competitorAvgPrice: number;
  grossRevenue: number;
  cogs: number;
  sustainabilityInvestment: number;
};

export type KpiHistoryEntry = Kpi & { round: number };
export type KpiHistory = KpiHistoryEntry[];

export type TimerState = {
  timeLeft: number;
  isPaused: boolean;
  isBreakActive: boolean;
  isBreakEnabled: boolean;
  roundDuration: number;
  breakDuration: number;
  confirmNextRound: boolean;
};

export type GameState = Kpi & {
  kpiHistory: KpiHistory;
  teamStrategy: string;
  timerState: TimerState;
};

export type PeerData = {
  name: string;
  companyValuation: number;
  netIncome: number;
  cumulativeCO2eEmissions: number;
};

export type ActionItem = {
  id: string;
  text: string;
  completed: boolean;
  isCustom?: boolean;
};

export type CompetitorLogEntry = {
  id: string;
  text: string;
  author: string;
  createdAt: Date | Timestamp;
};

export type RoleActionItems = {
  [key: string]: string[];
};

// Task model definitions
export type TaskPriority = "Critical" | "High" | "Medium" | "Low";
export type RoundRecurrence = "Once" | "RoundStart" | "Continuous";
export type TimeframeConstraint = "None" | "StartPhase" | "MidPhase" | "EndPhase";
export type CompletionType = "Manual-Tick" | "Data-Confirmed" | "System-Validated" | "Ongoing";
export type TaskType = "ERPsim Input Data" | "ERPsim Gather Data" | "Standard";
export type Role = "Procurement" | "Production" | "Logistics" | "Sales" | "Team Leader";
export type TaskVisibility = "Always" | "OnAlert";
export type TaskAlertKey =
  | "cashLow"
  | "mrpIssues"
  | "rmShortage"
  | "dcStockout"
  | "backlog"
  | "overProduction"
  | "highInventory"
  | "co2OverTarget"
  | "lowSales";
export type GoalTargetType = "increase" | "decrease";
export type GoalMetric =
  | "Cash"
  | "GrossMargin"
  | "CO2e"
  | "SetupTime"
  | "InventoryValue"
  | "TransportCost"
  | "Revenue"
  | "COGS"
  | "Utilisation"
  | "RM Cost";

export type TaskGoalCalculation = {
  baseMetric: string;
  targetType: GoalTargetType;
  targetValue: number;
  minLimit: number;
  maxLimit: number;
  constraints: string[];
  formula: string;
};

export type TaskDataField = {
  fieldName: string;
  dataType: "Currency" | "Integer" | "String";
  value?: number | string | null;
  suggestedValue?: number | string | null;
  aiRationale?: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  role: Role;
  transactionCode: string;
  priority: TaskPriority;
  estimatedTime: number;
  roundRecurrence: RoundRecurrence;
  startRound?: number;
  timeframeConstraint?: TimeframeConstraint;
  dependencyIDs: string[];
  completionType: CompletionType;
  taskType: TaskType;
  dataFields?: TaskDataField[];
  completed: boolean;
  version?: number;
  round?: number;
  impact?: "Capacity" | "Revenue" | "Risk";
  visibility?: TaskVisibility;
  alertKey?: TaskAlertKey;
  roundStartOffsetMinutes?: number | null;
  roundDueOffsetMinutes?: number | null;
  goalMetric?: GoalMetric;
  goalTargetType?: GoalTargetType;
  goalTargetValue?: number;
  goalUnit?: string;
  goalRationale?: string;
  goalCalculation?: TaskGoalCalculation;
};

export type ExtendedTask = Task & {
  version: number;
  round: number;
  startRound: number;
  impact: "Capacity" | "Revenue" | "Risk";
  visibility: TaskVisibility;
  roundStartOffsetMinutes: number | null;
  roundDueOffsetMinutes: number | null;
  goalMetric: GoalMetric;
  goalTargetType: GoalTargetType;
  goalTargetValue: number;
  goalUnit: string;
  goalRationale: string;
  goalCalculation: TaskGoalCalculation;
};
