export type UserProfile = {
  id: string;
  name: string;
  avatarUrl: string;
};

export type Kpi = {
  companyValuation: number;
  netIncome: number;
  inventoryValue: number;
  totalEmissions: number;
};

export type KpiHistory = (Kpi & { round: number })[];

export type GameState = Kpi & {
  kpiHistory: KpiHistory;
  teamStrategy: string;
};

export type ActionItem = {
  id: string;
  text: string;
  completed: boolean;
};

export type CompetitorLogEntry = {
  id: string;
  text: string;
  author: string;
  createdAt: Date;
};

export type PeerData = {
  name: string;
  companyValuation: number;
  netIncome: number;
  totalEmissions: number;
};
