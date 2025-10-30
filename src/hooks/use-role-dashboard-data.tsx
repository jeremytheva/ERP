"use client";

import { useMemo } from "react";
import { useCompanyMetrics } from "./use-company-metrics";
import { useGameState } from "./use-game-data";
import type { RoleDashboardData, RoleTrendSeries } from "@/components/dashboard/role-dashboards/types";
import type { CompanyMetricsDocument, RoleRoute, GameState } from "@/types";
import type { WithId } from "@/firebase";
import {
  TrendingUp,
  DollarSign,
  Percent,
  BarChart3,
  Warehouse,
  Leaf,
  Factory,
  RefreshCw,
  Package,
  HandCoins,
  ShipWheel,
  Target,
  LineChart,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const iconLibrary: Record<string, LucideIcon> = {
  TrendingUp,
  DollarSign,
  Percent,
  BarChart3,
  Warehouse,
  Leaf,
  Factory,
  RefreshCw,
  Package,
  HandCoins,
  ShipWheel,
  Target,
  LineChart,
};

const roleKpiDefaults: Record<RoleRoute, Record<string, LucideIcon>> = {
  sales: {
    marketShare: TrendingUp,
    averagePriceGap: DollarSign,
    grossRevenue: BarChart3,
  },
  procurement: {
    cogs: DollarSign,
    warehouseCosts: Warehouse,
    sustainabilityInvestment: Leaf,
  },
  production: {
    capacityUtilization: Factory,
    inventoryTurnover: RefreshCw,
    inventoryValue: Package,
  },
  logistics: {
    cashBalance: HandCoins,
    onTimeDeliveryRate: ShipWheel,
    warehouseCosts: Warehouse,
  },
  lead: {
    companyValuation: Target,
    netIncome: DollarSign,
    grossMargin: Percent,
  },
};

const resolveIcon = (role: RoleRoute, kpiId: string, iconName?: string): LucideIcon => {
  if (iconName && iconLibrary[iconName]) {
    return iconLibrary[iconName];
  }
  return roleKpiDefaults[role]?.[kpiId] ?? LineChart;
};

const formatUpdatedAt = (updatedAt?: CompanyMetricsDocument["updatedAt"]): string | undefined => {
  if (!updatedAt) return undefined;
  if (updatedAt instanceof Date) {
    return updatedAt.toLocaleString();
  }
  if (typeof updatedAt === "string") {
    return new Date(updatedAt).toLocaleString();
  }
  if (typeof updatedAt.toDate === "function") {
    return updatedAt.toDate().toLocaleString();
  }
  return undefined;
};

const mapDocumentToDashboard = (
  role: RoleRoute,
  doc: WithId<CompanyMetricsDocument>
): RoleDashboardData => {
  const kpis: RoleDashboardKpi[] = doc.kpis.map((kpi) => ({
    id: kpi.id,
    label: kpi.label,
    value: kpi.value,
    format: kpi.format,
    unit: kpi.unit,
    tooltip: kpi.tooltip,
    icon: resolveIcon(role, kpi.id, kpi.icon),
  }));

  const trendSeries = doc.trendSeries?.map<RoleTrendSeries>((series) => ({
    id: series.id,
    label: series.label,
    format: series.format,
    color: series.color,
    data: series.data,
  }));

  return {
    kpis,
    trend: trendSeries && trendSeries.length
      ? {
          title: doc.trendTitle ?? "Performance Trend",
          description: doc.trendDescription,
          series: trendSeries,
        }
      : undefined,
    peerComparison: doc.peerComparison
      ? {
          title: doc.peerTitle ?? "Peer Comparison",
          description: doc.peerDescription,
          metricLabel: doc.peerComparison.label,
          format: doc.peerComparison.format,
          highlightName: doc.peerComparison.highlightName,
          data: doc.peerComparison.data,
        }
      : undefined,
    table: doc.table,
    updatedAtLabel: formatUpdatedAt(doc.updatedAt),
  };
};

const extractSeries = (
  history: GameState["kpiHistory"],
  key: keyof GameState["kpiHistory"][number],
  format: RoleTrendSeries["format"],
  label: string
): RoleTrendSeries => ({
  id: key as string,
  label,
  format,
  data: history.map((entry) => ({
    round: entry.round,
    value: (entry[key] as number | undefined) ?? 0,
  })),
});

const buildFallbackForSales = (gameState: GameState): RoleDashboardData => {
  const history = gameState.kpiHistory;
  return {
    kpis: [
      {
        id: "marketShare",
        label: "Market Share",
        value: gameState.marketShare,
        format: "percent",
        icon: resolveIcon("sales", "marketShare"),
        tooltip: "Your company's sales as a percentage of total market sales.",
      },
      {
        id: "averagePriceGap",
        label: "Average Price Gap",
        value: gameState.averagePriceGap,
        format: "currency",
        icon: resolveIcon("sales", "averagePriceGap"),
        tooltip: "Average difference between your price and the competitor's average.",
      },
      {
        id: "grossRevenue",
        label: "Gross Revenue",
        value: gameState.grossRevenue,
        format: "currency",
        icon: resolveIcon("sales", "grossRevenue"),
        tooltip: "Total revenue before subtracting costs.",
      },
    ],
    trend: {
      title: "Sales Trend",
      description: "Market share and pricing performance by round.",
      series: [
        extractSeries(history, "marketShare", "percent", "Market Share"),
        extractSeries(history, "averageSellingPrice", "currency", "Average Selling Price"),
      ],
    },
    peerComparison: {
      title: "Market Share vs. Peers",
      description: "Compare market share against other teams.",
      metricLabel: "Market Share",
      format: "percent",
      data: [
        { name: "You", value: gameState.marketShare },
        { name: "Team Blue", value: Math.max(gameState.marketShare - 0.03, 0.05) },
        { name: "Team Gold", value: Math.min(gameState.marketShare + 0.02, 0.95) },
      ],
    },
    table: {
      title: "Recent Sales Rounds",
      caption: "Key sales metrics from the last rounds.",
      columns: [
        { key: "round", label: "Round" },
        { key: "marketShare", label: "Market Share", format: "percent" },
        { key: "averagePriceGap", label: "Avg. Price Gap", format: "currency" },
        { key: "grossRevenue", label: "Gross Revenue", format: "currency" },
      ],
      rows: history.slice(-4).map((entry) => ({
        round: entry.round,
        marketShare: entry.marketShare,
        averagePriceGap: entry.averagePriceGap,
        grossRevenue: entry.grossRevenue,
      })),
    },
  };
};

const buildFallbackForProcurement = (gameState: GameState): RoleDashboardData => {
  const history = gameState.kpiHistory;
  return {
    kpis: [
      {
        id: "cogs",
        label: "Cost of Goods Sold",
        value: gameState.cogs,
        format: "currency",
        icon: resolveIcon("procurement", "cogs"),
      },
      {
        id: "warehouseCosts",
        label: "Warehouse Costs",
        value: gameState.warehouseCosts,
        format: "currency",
        icon: resolveIcon("procurement", "warehouseCosts"),
      },
      {
        id: "sustainabilityInvestment",
        label: "Sustainability Investment",
        value: gameState.sustainabilityInvestment,
        format: "currency",
        icon: resolveIcon("procurement", "sustainabilityInvestment"),
      },
    ],
    trend: {
      title: "Procurement Spend Trend",
      description: "Track spending patterns over time.",
      series: [
        extractSeries(history, "cogs", "currency", "COGS"),
        extractSeries(history, "warehouseCosts", "currency", "Warehouse Costs"),
      ],
    },
    peerComparison: {
      title: "COGS vs. Peers",
      description: "Benchmark cost of goods sold against peers.",
      metricLabel: "COGS",
      format: "currency",
      data: [
        { name: "You", value: gameState.cogs },
        { name: "Team Blue", value: gameState.cogs * 0.92 },
        { name: "Team Gold", value: gameState.cogs * 1.05 },
      ],
    },
    table: {
      title: "Procurement Snapshot",
      caption: "Spending and investment by round.",
      columns: [
        { key: "round", label: "Round" },
        { key: "cogs", label: "COGS", format: "currency" },
        { key: "warehouseCosts", label: "Warehouse", format: "currency" },
        { key: "sustainabilityInvestment", label: "Sustainability", format: "currency" },
      ],
      rows: history.slice(-4).map((entry) => ({
        round: entry.round,
        cogs: entry.cogs,
        warehouseCosts: entry.warehouseCosts,
        sustainabilityInvestment: entry.sustainabilityInvestment,
      })),
    },
  };
};

const buildFallbackForProduction = (gameState: GameState): RoleDashboardData => {
  const history = gameState.kpiHistory;
  return {
    kpis: [
      {
        id: "capacityUtilization",
        label: "Capacity Utilization",
        value: gameState.capacityUtilization,
        format: "percent",
        icon: resolveIcon("production", "capacityUtilization"),
      },
      {
        id: "inventoryTurnover",
        label: "Inventory Turnover",
        value: gameState.inventoryTurnover,
        format: "number",
        icon: resolveIcon("production", "inventoryTurnover"),
      },
      {
        id: "inventoryValue",
        label: "Inventory Value",
        value: gameState.inventoryValue,
        format: "currency",
        icon: resolveIcon("production", "inventoryValue"),
      },
    ],
    trend: {
      title: "Production Trend",
      description: "Operational efficiency over recent rounds.",
      series: [
        extractSeries(history, "capacityUtilization", "percent", "Capacity Utilization"),
        extractSeries(history, "inventoryTurnover", "number", "Inventory Turnover"),
      ],
    },
    peerComparison: {
      title: "Inventory Turnover vs. Peers",
      metricLabel: "Inventory Turnover",
      format: "number",
      data: [
        { name: "You", value: gameState.inventoryTurnover },
        { name: "Team Blue", value: Math.max(gameState.inventoryTurnover - 0.5, 0) },
        { name: "Team Gold", value: gameState.inventoryTurnover + 0.6 },
      ],
    },
    table: {
      title: "Production Metrics",
      caption: "Capacity and inventory performance per round.",
      columns: [
        { key: "round", label: "Round" },
        { key: "capacityUtilization", label: "Capacity Util.", format: "percent" },
        { key: "inventoryTurnover", label: "Turnover", format: "number" },
        { key: "inventoryValue", label: "Inventory Value", format: "currency" },
      ],
      rows: history.slice(-4).map((entry) => ({
        round: entry.round,
        capacityUtilization: entry.capacityUtilization,
        inventoryTurnover: entry.inventoryTurnover,
        inventoryValue: entry.inventoryValue,
      })),
    },
  };
};

const buildFallbackForLogistics = (gameState: GameState): RoleDashboardData => {
  const history = gameState.kpiHistory;
  return {
    kpis: [
      {
        id: "cashBalance",
        label: "Cash Balance",
        value: gameState.cashBalance,
        format: "currency",
        icon: resolveIcon("logistics", "cashBalance"),
      },
      {
        id: "onTimeDeliveryRate",
        label: "On-Time Delivery",
        value: gameState.onTimeDeliveryRate,
        format: "percent",
        icon: resolveIcon("logistics", "onTimeDeliveryRate"),
      },
      {
        id: "warehouseCosts",
        label: "Warehouse Costs",
        value: gameState.warehouseCosts,
        format: "currency",
        icon: resolveIcon("logistics", "warehouseCosts"),
      },
    ],
    trend: {
      title: "Logistics Trend",
      description: "Delivery performance and cash flow.",
      series: [
        extractSeries(history, "cashBalance", "currency", "Cash Balance"),
        extractSeries(history, "onTimeDeliveryRate", "percent", "On-Time Delivery"),
      ],
    },
    peerComparison: {
      title: "Cash Position vs. Peers",
      metricLabel: "Cash Balance",
      format: "currency",
      data: [
        { name: "You", value: gameState.cashBalance },
        { name: "Team Blue", value: gameState.cashBalance * 0.87 },
        { name: "Team Gold", value: gameState.cashBalance * 1.08 },
      ],
    },
    table: {
      title: "Logistics Metrics",
      caption: "Cash and service levels per round.",
      columns: [
        { key: "round", label: "Round" },
        { key: "cashBalance", label: "Cash Balance", format: "currency" },
        { key: "onTimeDeliveryRate", label: "On-Time Delivery", format: "percent" },
        { key: "warehouseCosts", label: "Warehouse Costs", format: "currency" },
      ],
      rows: history.slice(-4).map((entry) => ({
        round: entry.round,
        cashBalance: entry.cashBalance,
        onTimeDeliveryRate: entry.onTimeDeliveryRate,
        warehouseCosts: entry.warehouseCosts,
      })),
    },
  };
};

const buildFallbackForLead = (gameState: GameState): RoleDashboardData => {
  const history = gameState.kpiHistory;
  return {
    kpis: [
      {
        id: "companyValuation",
        label: "Company Valuation",
        value: gameState.companyValuation,
        format: "currency",
        icon: resolveIcon("lead", "companyValuation"),
      },
      {
        id: "netIncome",
        label: "Net Income",
        value: gameState.netIncome,
        format: "currency",
        icon: resolveIcon("lead", "netIncome"),
      },
      {
        id: "grossMargin",
        label: "Gross Margin",
        value: gameState.grossMargin,
        format: "percent",
        icon: resolveIcon("lead", "grossMargin"),
      },
    ],
    trend: {
      title: "Executive Trend",
      description: "Company valuation, profitability, and margin.",
      series: [
        extractSeries(history, "companyValuation", "currency", "Company Valuation"),
        extractSeries(history, "netIncome", "currency", "Net Income"),
        extractSeries(history, "grossMargin", "percent", "Gross Margin"),
      ],
    },
    peerComparison: {
      title: "Valuation vs. Peers",
      description: "Benchmark company valuation against the market.",
      metricLabel: "Valuation",
      format: "currency",
      data: [
        { name: "You", value: gameState.companyValuation },
        { name: "Team Blue", value: gameState.companyValuation * 0.95 },
        { name: "Team Gold", value: gameState.companyValuation * 1.1 },
      ],
    },
    table: {
      title: "Executive Snapshot",
      caption: "Valuation and profitability by round.",
      columns: [
        { key: "round", label: "Round" },
        { key: "companyValuation", label: "Valuation", format: "currency" },
        { key: "netIncome", label: "Net Income", format: "currency" },
        { key: "grossMargin", label: "Gross Margin", format: "percent" },
      ],
      rows: history.slice(-4).map((entry) => ({
        round: entry.round,
        companyValuation: entry.companyValuation,
        netIncome: entry.netIncome,
        grossMargin: entry.grossMargin,
      })),
    },
  };
};

const fallbackBuilders: Record<RoleRoute, (gameState: GameState) => RoleDashboardData> = {
  sales: buildFallbackForSales,
  procurement: buildFallbackForProcurement,
  production: buildFallbackForProduction,
  logistics: buildFallbackForLogistics,
  lead: buildFallbackForLead,
};

export function useRoleDashboardData(role: RoleRoute) {
  const { metricsByRole, isLoading, error } = useCompanyMetrics();
  const { gameState } = useGameState();

  const data = useMemo(() => {
    const doc = metricsByRole[role];
    if (doc) {
      return mapDocumentToDashboard(role, doc);
    }
    return fallbackBuilders[role](gameState);
  }, [metricsByRole, role, gameState]);

  return {
    data,
    isLoading,
    error,
  };
}
