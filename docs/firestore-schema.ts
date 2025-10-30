import { Timestamp } from "firebase/firestore";

export interface CompanyMetricSnapshot {
  id: string;
  companyId: string;
  round: number;
  metrics: {
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
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export type CompanyMetricCollection = CompanyMetricSnapshot[];

export interface ActionItemDocument {
  id: string;
  companyId: string;
  role: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  dueRound?: number;
  owner?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface AiInsightDocument {
  id: string;
  companyId: string;
  topic: string;
  summary: string;
  confidence: number;
  actions: string[];
  createdAt: Timestamp;
}

export const firestoreContracts = {
  metrics: "companies/${companyId}/metrics" as const,
  actionItems: "companies/${companyId}/actionItems" as const,
  aiInsights: "companies/${companyId}/aiInsights" as const,
};
