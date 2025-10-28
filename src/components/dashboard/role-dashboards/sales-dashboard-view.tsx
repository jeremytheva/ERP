"use client";

import { useMemo, type RefObject, type ComponentType } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { KpiCard } from "../kpi-card";
import { RoleInsightsTable } from "./role-insights-table";
import type { GameState, RoleMetrics, Task } from "../../../types";
import type { LucideIcon } from "lucide-react";

export type TaskNavigationControls = {
  activeTaskId: string | null;
  openedTaskId: string | null;
  setOpenedTaskId: (id: string | null) => void;
  getTaskRef: (id: string) => RefObject<HTMLDivElement>;
};

export type SalesDashboardComponents = {
  TaskCard: ComponentType<any>;
  SalesChart: ComponentType<any>;
  PeerComparisonChart: ComponentType<any>;
  icons: {
    marketShare: LucideIcon;
    priceGap: LucideIcon;
    grossRevenue: LucideIcon;
  };
};

export interface SalesDashboardViewProps {
  gameState: GameState;
  metrics?: RoleMetrics;
  tasks: Task[];
  profileName?: string;
  updateTask: (task: Task) => void;
  navigation: TaskNavigationControls;
  components: SalesDashboardComponents;
}

export function SalesDashboardView({
  gameState,
  metrics,
  tasks,
  profileName,
  updateTask,
  navigation,
  components,
}: SalesDashboardViewProps) {
  const { activeTaskId, openedTaskId, setOpenedTaskId, getTaskRef } = navigation;
  const { icons } = components;
  const TaskCard = components.TaskCard;
  const SalesChartComponent = components.SalesChart;
  const PeerComparisonComponent = components.PeerComparisonChart;
  const MarketShareIcon = icons.marketShare;
  const PriceGapIcon = icons.priceGap;
  const GrossRevenueIcon = icons.grossRevenue;

  const salesHistory = metrics?.trend?.length ? metrics.trend : gameState.kpiHistory;
  const currentRound = salesHistory[salesHistory.length - 1]?.round || 1;

  const marketAnalysisTasks = useMemo(() => {
    if (!profileName) return [];
    return tasks
      .filter(
        (task) =>
          task.role === profileName &&
          task.transactionCode.includes("ZMARKET") &&
          (task.roundRecurrence === "Continuous" || (task.startRound ?? 1) <= currentRound)
      )
      .sort((a, b) => a.priority.localeCompare(b.priority));
  }, [tasks, profileName, currentRound]);

  const handleFindNextTask = (currentTaskId: string, taskGroup: Task[]) => {
    const currentIndex = taskGroup.findIndex((t) => t.id === currentTaskId);
    if (currentIndex === -1) {
      setOpenedTaskId(null);
      return;
    }

    const nextIncompleteTask = taskGroup.slice(currentIndex + 1).find((t) => !t.completed);
    if (nextIncompleteTask) {
      setOpenedTaskId(nextIncompleteTask.id);
      const taskRef = getTaskRef(nextIncompleteTask.id);
      if (taskRef?.current) {
        taskRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } else {
      setOpenedTaskId(null);
    }
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    updateTask(updatedTask);
    if (updatedTask.completed && updatedTask.id === activeTaskId) {
      handleFindNextTask(updatedTask.id, marketAnalysisTasks);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Market Share"
          value={gameState.marketShare}
          icon={MarketShareIcon}
          format="percent"
          tooltip="Your company's sales as a percentage of total market sales."
        />
        <KpiCard
          title="Average Price Gap"
          value={gameState.averagePriceGap}
          icon={PriceGapIcon}
          format="currency"
          tooltip="The average difference between your price and the competitor's average price."
        />
        <KpiCard
          title="Gross Revenue"
          value={gameState.grossRevenue}
          icon={GrossRevenueIcon}
          format="currency"
          tooltip="Total revenue from sales before subtracting costs."
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <SalesChartComponent history={salesHistory} />
          {metrics?.tables.map((table) => (
            <RoleInsightsTable key={table.title} {...table} />
          ))}
        </div>
        {metrics?.peerComparison?.length ? (
          <PeerComparisonComponent
            peerData={metrics.peerComparison}
            currentUserValuation={gameState.companyValuation}
          />
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Market Analysis (ZMARKET)</CardTitle>
          <CardDescription>
            Extract key market data from ZMARKET to drive pricing decisions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {marketAnalysisTasks.map((task) => (
            <div key={task.id} className="relative pt-6">
              <TaskCard
                ref={getTaskRef(task.id)}
                task={task}
                allTasks={tasks}
                isActive={openedTaskId === task.id}
                isCurrent={activeTaskId === task.id}
                onToggle={(id?: string | null) => {
                  if (typeof id === "string" || id === null) {
                    setOpenedTaskId(id);
                    return;
                  }

                  setOpenedTaskId(openedTaskId === task.id ? null : task.id);
                }}
                onUpdate={handleTaskUpdate}
                onFindNext={(id: string) => handleFindNextTask(id, marketAnalysisTasks)}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
