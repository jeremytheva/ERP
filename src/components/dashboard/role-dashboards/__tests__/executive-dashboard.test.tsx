import { renderToStaticMarkup } from "react-dom/server";
import { createRef } from "react";
import type { SVGProps } from "react";
import { ExecutiveDashboardView } from "../executive-dashboard-view";
import type { GameState, RoleMetrics, Task } from "@/types";
import type { LucideIcon } from "lucide-react";

const mockTasks: Task[] = [
  {
    id: "tl-task",
    title: "Approve Investment",
    description: "",
    role: "Team Leader",
    transactionCode: "ZFB50",
    priority: "High",
    estimatedTime: 5,
    roundRecurrence: "Continuous",
    dependencyIDs: [],
    completionType: "Manual-Tick",
    taskType: "Standard",
    completed: false,
  },
  {
    id: "sales-forecast",
    title: "Set Forecast",
    description: "",
    role: "Sales",
    transactionCode: "MD61",
    priority: "High",
    estimatedTime: 5,
    roundRecurrence: "Continuous",
    dependencyIDs: [],
    completionType: "Manual-Tick",
    taskType: "Standard",
    completed: false,
  },
];

const mockHistory = [
  {
    round: 1,
    companyValuation: 50000000,
    netIncome: 200000,
    inventoryValue: 250000,
    cashBalance: 450000,
    grossMargin: 0.25,
    marketShare: 0.2,
    averageSellingPrice: 45,
    inventoryTurnover: 2.5,
    capacityUtilization: 0.6,
    averagePriceGap: 1.5,
    warehouseCosts: 120000,
    onTimeDeliveryRate: 0.9,
    cumulativeCO2eEmissions: 12000,
    competitorAvgPrice: 43,
    grossRevenue: 1500000,
    cogs: 700000,
    sustainabilityInvestment: 50000,
  },
  {
    round: 2,
    companyValuation: 52000000,
    netIncome: 230000,
    inventoryValue: 245000,
    cashBalance: 470000,
    grossMargin: 0.27,
    marketShare: 0.22,
    averageSellingPrice: 47,
    inventoryTurnover: 2.7,
    capacityUtilization: 0.65,
    averagePriceGap: 1.4,
    warehouseCosts: 118000,
    onTimeDeliveryRate: 0.91,
    cumulativeCO2eEmissions: 11800,
    competitorAvgPrice: 43.5,
    grossRevenue: 1620000,
    cogs: 680000,
    sustainabilityInvestment: 55000,
  },
];

const mockGameState: GameState = {
  companyValuation: 52000000,
  netIncome: 230000,
  inventoryValue: 245000,
  cashBalance: 470000,
  grossMargin: 0.27,
  marketShare: 0.22,
  averageSellingPrice: 47,
  inventoryTurnover: 2.7,
  capacityUtilization: 0.65,
  averagePriceGap: 1.4,
  warehouseCosts: 118000,
  onTimeDeliveryRate: 0.91,
  cumulativeCO2eEmissions: 11800,
  competitorAvgPrice: 43.5,
  grossRevenue: 1620000,
  cogs: 680000,
  sustainabilityInvestment: 55000,
  kpiHistory: mockHistory,
  teamStrategy: "",
  timerState: {
    timeLeft: 0,
    isPaused: true,
    isBreakActive: false,
    isBreakEnabled: true,
    roundDuration: 1200,
    breakDuration: 300,
    confirmNextRound: true,
  },
};

const mockMetrics: RoleMetrics = {
  trend: mockHistory,
  peerComparison: [
    { name: "Team Atlas", companyValuation: 51000000 },
    { name: "Team Nova", companyValuation: 48000000 },
  ],
  tables: [
    {
      title: "Cash Flow Summary",
      description: "",
      columns: ["Metric", "Current", "Trend"],
      rows: [
        { Metric: "Operating Cash Flow", Current: "$245k", Trend: "Stable" },
      ],
    },
  ],
};

const StubTaskCard = () => <div>Task Card</div>;
const StubKpiCharts = () => <div>Trend Charts</div>;
const StubPeerComparison = () => <div>Peer Comparison: Company Valuation</div>;
const StubIcon: LucideIcon = ((props: SVGProps<SVGSVGElement>) => (
  <svg {...props} data-testid="icon" />
)) as any;

const navigation = {
  activeTaskId: null,
  openedTaskId: null,
  setOpenedTaskId: () => undefined,
  getTaskRef: () => createRef<HTMLDivElement>(),
};

const html = renderToStaticMarkup(
  <ExecutiveDashboardView
    gameState={mockGameState}
    metrics={mockMetrics}
    tasks={mockTasks}
    profileId="leader-1"
    profileName="Sales"
    teamLeaderId="leader-1"
    updateTask={() => undefined}
    navigation={navigation}
    components={{
      TaskCard: StubTaskCard,
      KpiCharts: StubKpiCharts,
      PeerComparisonChart: StubPeerComparison,
      icons: {
        kpi: {
          companyValuation: StubIcon,
          netIncome: StubIcon,
          cashBalance: StubIcon,
          emissions: StubIcon,
        },
        sections: {
          teamLeader: StubIcon,
          forecasting: StubIcon,
        },
      },
    }}
  />
);

if (!html.includes("Company Valuation")) {
  throw new Error("Expected Company Valuation KPI");
}

if (!html.includes("Peer Comparison: Company Valuation")) {
  throw new Error("Expected peer comparison chart placeholder");
}

if (!html.includes("Cash Flow Summary")) {
  throw new Error("Expected cash flow table");
}

if (!html.includes("Team Leader: Investment Tasks")) {
  throw new Error("Expected team leader task section");
}

if (!html.includes("Forecasting (MD61)")) {
  throw new Error("Expected forecasting task section");
}
