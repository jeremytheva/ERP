export type MetricStatus = "on-track" | "watch" | "at-risk";
export type MetricDeltaDirection = "increase" | "decrease" | "neutral";

export interface CompanyMetricContract {
  id: string;
  gameId?: string;
  label: string;
  category: "financial" | "operations" | "sustainability" | "market" | "custom";
  unit?: string | null;
  currentValue: number;
  deltaValue?: number | null;
  deltaDirection?: MetricDeltaDirection;
  deltaPeriodLabel?: string | null;
  targetValue?: number | null;
  status?: MetricStatus;
  trend: Array<{ timestamp: string; value: number }>;
  peerComparisons?: Array<{ peerId: string; peerLabel: string; value: number }>;
  updatedAt: string;
}

export type ActionItemPriority = "low" | "medium" | "high" | "critical";
export type ActionItemStatus = "not-started" | "in-progress" | "completed" | "blocked";

export interface ActionItemContract {
  id: string;
  gameId?: string;
  ownerRoleId: string;
  ownerRoleLabel: string;
  title: string;
  summary?: string | null;
  priority: ActionItemPriority;
  status: ActionItemStatus;
  relatedMetricIds?: string[];
  createdAt: string;
  dueAt?: string | null;
}

export type AiInsightImpact = "low" | "medium" | "high";

export interface AiInsightContract {
  id: string;
  gameId?: string;
  headline: string;
  summary: string;
  impact: AiInsightImpact;
  confidenceScore: number;
  recommendedActions?: string[];
  relatedMetricId?: string | null;
  tags?: string[];
  createdAt: string;
}

export interface RoleMetadataContract {
  id: string;
  name: string;
  description?: string;
  focusAreas?: string[];
  primaryMetricIds?: string[];
}

export const DEFAULT_ROLE_METADATA: RoleMetadataContract[] = [
  {
    id: "procurement",
    name: "Procurement",
    description: "Manage supplier relationships, purchasing, and material availability.",
    focusAreas: ["Supplier Reliability", "Material Costs", "Inventory Health"],
  },
  {
    id: "production",
    name: "Production",
    description: "Oversee manufacturing efficiency, capacity utilization, and output quality.",
    focusAreas: ["Capacity", "Throughput", "Quality"],
  },
  {
    id: "logistics",
    name: "Logistics",
    description: "Coordinate warehousing, transportation, and delivery performance.",
    focusAreas: ["On-Time Delivery", "Distribution Costs", "Inventory Turns"],
  },
  {
    id: "sales",
    name: "Sales",
    description: "Drive revenue growth through pricing, demand generation, and customer insights.",
    focusAreas: ["Revenue", "Market Share", "Pricing"],
  },
  {
    id: "team-leader",
    name: "Team Leader",
    description: "Align cross-functional strategy, prioritize initiatives, and guide the team.",
    focusAreas: ["Strategic Alignment", "Capital Allocation", "Team Coordination"],
  },
];
