
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
}

export type GameState = Kpi & {
  kpiHistory: KpiHistory;
  teamStrategy: string;
  timerState: TimerState;
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
}


// New Expanded Task Definition
export type Role = "Team Leader" | "Sales" | "Production" | "Procurement" | "Logistics";
export type TaskPriority = "High" | "Medium" | "Low";
export type RoundRecurrence = "RoundStart" | "Continuous";
export type CompletionType = "Manual-Tick" | "Data-Confirmed" | "Ongoing";
export type TaskType = "Standard" | "ERPsim Gather Data" | "ERPsim Input Data";
export type Impact = "Revenue" | "Cost" | "Sustainability" | "Capacity" | "Risk";
export type TaskVisibility = "Always" | "OnAlert";

export type Alerts = {
  mrpIssues?: boolean;
  cashLow?: boolean;
  dcStockout?: boolean;
  rmShortage?: boolean;
  co2OverTarget?: boolean;
  backlog?: boolean;
};

export const AlertsEnum = {
  MRP_ISSUES: "mrpIssues",
  CASH_LOW: "cashLow",
  DC_STOCKOUT: "dcStockout",
  RM_SHORTAGE: "rmShortage",
  CO2_OVER: "co2OverTarget",
  BACKLOG: "backlog",
} as const;

export interface DataField {
  fieldName: string;
  dataType: "Integer" | "Currency" | "Percent" | "String";
  suggestedValue?: number | string;
  calculatedFrom?: string[];
  // NOTE: kept as function for Codex/TS use (not meant to be stored directly in Firestore)
  formula?: (inputs: Record<string, any>) => number | string;
  aiHelp?: string;
  // Runtime/user-entered value support for the UI layer
  value?: number | string | null;
}

export interface Task {
  id: string;                // versioned: e.g. "TL-1.2"
  version: number;           // 2 for this dataset
  round: number;             // explicit round bucket for UI grouping
  title: string;
  description: string;
  role: Role;
  transactionCode?: string;
  priority: TaskPriority;
  estimatedTime: number;     // minutes estimate
  roundRecurrence: RoundRecurrence;
  startRound: number;        // first round this can appear
  dependencyIDs: string[];   // task ids this depends on
  completionType: CompletionType;
  taskType: TaskType;
  completed: boolean;

  // UX metadata
  impact?: Impact;
  visibility?: TaskVisibility; // "OnAlert" => show only if alerts[alertKey] === true
  alertKey?: keyof Alerts;

  // optional structured inputs/outputs
  dataFields?: DataField[];
}
