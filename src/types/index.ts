
import { Timestamp } from "firebase/firestore";
import type { LucideIcon } from "lucide-react";

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
export type TaskPriority = "Critical" | "High" | "Medium" | "Low";
export type RoundRecurrence = "Once" | "RoundStart" | "Continuous";
export type TimeframeConstraint = "None" | "StartPhase" | "MidPhase" | "EndPhase";
export type CompletionType = "Manual-Tick" | "Data-Confirmed" | "System-Validated";
export type TaskType = "ERPsim Input Data" | "ERPsim Gather Data" | "Standard";
export type Role = "Procurement" | "Production" | "Logistics" | "Sales" | "Team Leader";

export type RoleRoute = "sales" | "procurement" | "production" | "logistics" | "lead";

export type MetricFormat = "currency" | "number" | "percent";

export type MetricTrendPoint = {
  round: number;
  value: number;
};

export type PeerMetricPoint = {
  name: string;
  value: number;
};

export type PeerData = PeerMetricPoint;

export interface CompanyMetricKpi {
  id: string;
  label: string;
  value: number;
  format?: MetricFormat;
  unit?: string;
  tooltip?: string;
  icon?: string;
}

export interface CompanyMetricTrendSeries {
  id: string;
  label: string;
  format?: MetricFormat;
  color?: string;
  data: MetricTrendPoint[];
}

export interface CompanyMetricPeerSeries {
  label: string;
  format?: MetricFormat;
  highlightName?: string;
  data: PeerMetricPoint[];
}

export interface CompanyMetricTableColumn {
  key: string;
  label: string;
  format?: MetricFormat;
  unit?: string;
}

export interface CompanyMetricTable {
  title?: string;
  caption?: string;
  description?: string;
  columns: CompanyMetricTableColumn[];
  rows: Array<Record<string, string | number>>;
}

export interface CompanyMetricsDocument {
  role: RoleRoute;
  kpis: CompanyMetricKpi[];
  trendSeries?: CompanyMetricTrendSeries[];
  trendTitle?: string;
  trendDescription?: string;
  peerComparison?: CompanyMetricPeerSeries;
  peerTitle?: string;
  peerDescription?: string;
  table?: CompanyMetricTable;
  updatedAt?: Timestamp | Date | string | null;
}

export type DashboardKpi = CompanyMetricKpi & { icon?: LucideIcon };


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
