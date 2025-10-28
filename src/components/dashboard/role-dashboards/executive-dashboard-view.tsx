"use client";

import { useMemo, type ComponentType, type RefObject } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { KpiCard } from "../kpi-card";
import { RoleInsightsTable } from "./role-insights-table";
import type { GameState, RoleMetrics, Task } from "../../../types";
import type { LucideIcon } from "lucide-react";

export type NavigationControls = {
  activeTaskId: string | null;
  openedTaskId: string | null;
  setOpenedTaskId: (id: string | null) => void;
  getTaskRef: (id: string) => RefObject<HTMLDivElement>;
};

export type ExecutiveDashboardComponents = {
  TaskCard: ComponentType<any>;
  KpiCharts: ComponentType<any>;
  PeerComparisonChart: ComponentType<any>;
  icons: {
    kpi: {
      companyValuation: LucideIcon;
      netIncome: LucideIcon;
      cashBalance: LucideIcon;
      emissions: LucideIcon;
    };
    sections: {
      teamLeader: LucideIcon;
      forecasting: LucideIcon;
    };
  };
};

export interface ExecutiveDashboardViewProps {
  gameState: GameState;
  metrics?: RoleMetrics;
  tasks: Task[];
  profileId?: string;
  profileName?: string;
  teamLeaderId?: string | null;
  updateTask: (task: Task) => void;
  navigation: NavigationControls;
  components: ExecutiveDashboardComponents;
}

export function ExecutiveDashboardView({
  gameState,
  metrics,
  tasks,
  profileId,
  profileName,
  teamLeaderId,
  updateTask,
  navigation,
  components,
}: ExecutiveDashboardViewProps) {
  const { activeTaskId, openedTaskId, setOpenedTaskId, getTaskRef } = navigation;
  const { icons } = components;
  const TaskCard = components.TaskCard;
  const KpiChartsComponent = components.KpiCharts;
  const PeerComparisonComponent = components.PeerComparisonChart;
  const CompanyValuationIcon = icons.kpi.companyValuation;
  const NetIncomeIcon = icons.kpi.netIncome;
  const CashBalanceIcon = icons.kpi.cashBalance;
  const EmissionsIcon = icons.kpi.emissions;
  const TeamLeaderIcon = icons.sections.teamLeader;
  const ForecastingIcon = icons.sections.forecasting;

  const trendHistory = metrics?.trend?.length ? metrics.trend : gameState.kpiHistory;
  const currentRound = trendHistory[trendHistory.length - 1]?.round || 1;
  const isTeamLeader = profileId === teamLeaderId;

  const forecastingTasks = useMemo(() => {
    if (!profileName) return [];
    return tasks
      .filter(
        (task) =>
          task.role === profileName &&
          task.transactionCode.includes("MD61") &&
          (task.roundRecurrence === "Continuous" || (task.startRound ?? 1) <= currentRound)
      )
      .sort((a, b) => a.priority.localeCompare(b.priority));
  }, [tasks, profileName, currentRound]);

  const teamLeaderTasks = useMemo(() => {
    if (!isTeamLeader) return [];
    return tasks
      .filter(
        (task) =>
          task.role === "Team Leader" &&
          task.transactionCode.includes("ZFB50") &&
          (task.roundRecurrence === "Continuous" || (task.startRound ?? 1) <= currentRound)
      )
      .sort((a, b) => a.priority.localeCompare(b.priority));
  }, [tasks, isTeamLeader, currentRound]);

  const allTasksForPage = useMemo(
    () => [...teamLeaderTasks, ...forecastingTasks],
    [teamLeaderTasks, forecastingTasks]
  );

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
      handleFindNextTask(updatedTask.id, allTasksForPage);
    }
  };

  const createToggleHandler = (taskId: string) => (id?: string | null) => {
    if (typeof id === "string" || id === null) {
      setOpenedTaskId(id);
      return;
    }

    setOpenedTaskId(openedTaskId === taskId ? null : taskId);
  };

  const renderTaskSection = (
    taskGroup: Task[],
    title: string,
    description: string,
    Icon: LucideIcon
  ) =>
    taskGroup.length > 0 ? (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon className="h-6 w-6" />
            <CardTitle>{title}</CardTitle>
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {taskGroup.map((task) => (
            <div key={task.id} className="relative pt-6">
              <TaskCard
                ref={getTaskRef(task.id)}
                task={task}
                allTasks={tasks}
                isActive={openedTaskId === task.id}
                isCurrent={activeTaskId === task.id}
                onToggle={createToggleHandler(task.id)}
                onUpdate={handleTaskUpdate}
                onFindNext={(id: string) => handleFindNextTask(id, taskGroup)}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    ) : null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Company Valuation"
          value={gameState.companyValuation}
          icon={CompanyValuationIcon}
          format="currency"
          tooltip="The total estimated value of your company."
        />
        <KpiCard
          title="Net Income"
          value={gameState.netIncome}
          icon={NetIncomeIcon}
          format="currency"
          tooltip="Total profit after all expenses."
        />
        <KpiCard
          title="Cash Balance"
          value={gameState.cashBalance}
          icon={CashBalanceIcon}
          format="currency"
          tooltip="Cash available to fund operations and investments."
        />
        <KpiCard
          title="CO₂e Emissions"
          value={gameState.cumulativeCO2eEmissions}
          icon={EmissionsIcon}
          format="number"
          unit="kg"
          tooltip="Cumulative CO₂ equivalent emissions from operations."
        />
      </div>

      <div className="space-y-6">
        <KpiChartsComponent history={trendHistory} />
        {metrics?.peerComparison?.length ? (
          <PeerComparisonComponent
            peerData={metrics.peerComparison}
            currentUserValuation={gameState.companyValuation}
          />
        ) : null}
        {metrics?.tables.map((table) => (
          <RoleInsightsTable key={table.title} {...table} />
        ))}
      </div>

      {renderTaskSection(
        teamLeaderTasks,
        "Team Leader: Investment Tasks",
        "Finalize and confirm investment decisions.",
        TeamLeaderIcon
      )}

      {renderTaskSection(
        forecastingTasks,
        "Forecasting (MD61)",
        "Calculate and set the total sales forecast for MD61. This will be pushed to the LIT.",
        ForecastingIcon
      )}
    </div>
  );
}
