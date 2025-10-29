
import { Timestamp } from "firebase/firestore";

export type UserProfile = {
  id: string;
  name: string;
  avatarUrl: string;
};

export type PeerData = {
  name: string;
  companyValuation: number;
  netIncome: number;
  cumulativeCO2eEmissions: number;
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

export type ActionItemStatus = "backlog" | "in_progress" | "blocked" | "done";
export type ActionItemPriority = "low" | "medium" | "high";

export type ActionItem = {
  id: string;
  teamId: string;
  ownerUid: string;
  ownerProfileId: string;
  ownerRole: string;
  title: string;
  description?: string | null;
  status: ActionItemStatus;
  priority: ActionItemPriority;
  dueRound?: number | null;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type CompetitorNoteStatus = "observation" | "insight" | "response" | "watch";
export type CompetitorNotePriority = ActionItemPriority;

export type CompetitorNote = {
  id: string;
  teamId: string;
  ownerUid: string;
  authorName: string;
  competitor: string;
  title: string;
  summary: string;
  status: CompetitorNoteStatus;
  priority: CompetitorNotePriority;
  focusRoles: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
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
export type TaskPriority = "Critical" | "High" | "Medium" | "Low";
export type RoundRecurrence = "Once" | "RoundStart" | "Continuous";
export type TimeframeConstraint = "None" | "StartPhase" | "MidPhase" | "EndPhase";
export type CompletionType = "Manual-Tick" | "Data-Confirmed" | "System-Validated";
export type TaskType = "ERPsim Input Data" | "ERPsim Gather Data" | "Standard";
export type Role = "Procurement" | "Production" | "Logistics" | "Sales" | "Team Leader";


export type TaskDataField = {
  fieldName: string;
  dataType: "Currency" | "Integer" | "String";
  value?: number | string | null; // User-entered value
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
