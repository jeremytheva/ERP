
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

export type PeerData = {
  name: string;
  companyValuation: number;
  netIncome: number;
  cumulativeCO2eEmissions: number;
};

export type RoleActionItems = {
  [key: string]: string[];
}


// New Expanded Task Definition
export type TaskPriority = "Critical" | "High" | "Medium" | "Low";
export type RoundRecurrence = "Once" | "RoundStart" | "Continuous";
export type TimeframeConstraint = "None" | "StartPhase" | "MidPhase" | "EndPhase";
export type CompletionType = "Manual-Tick" | "Data-Confirmed" | "System-Validated";
export type TaskType = "ERPsim Input Data" | "ERPsim Gather Data" | "Standard";
export type Role = "Procurement" | "Production" | "Logistics" | "Sales" | "Team Leader";


export type TaskDataField = {
  fieldName: string;
  dataType: "Currency" | "Integer" | "String";
  value?: number | string; // User-entered value
  suggestedValue?: number | string;
  aiRationale?: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  role: Role;
  transactionCode: string;
  priority: TaskPriority;
  estimatedTime: number; // in minutes
  roundRecurrence: RoundRecurrence;
  startRound?: number;
  timeframeConstraint?: TimeframeConstraint;
  dependencyIDs: string[];
  completionType: CompletionType;
  taskType: TaskType;
  dataFields?: TaskDataField[];
  completed: boolean; // Added completion status
};
