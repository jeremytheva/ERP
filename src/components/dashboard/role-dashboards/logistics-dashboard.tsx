"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HandCoins, ShipWheel, Warehouse, Truck, Banknote, PackageOpen } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { LogisticsChart } from "@/components/dashboard/role-charts/logistics-chart";
import { PeerComparisonChart } from "@/components/dashboard/peer-comparison-chart";
import { RoleInsightsTable } from "./role-insights-table";
import { useAuth } from "@/hooks/use-auth";
import { useTasks } from "@/hooks/use-tasks";
import { useGameState } from "@/hooks/use-game-data";
import { useCompanyMetrics } from "@/hooks/use-company-metrics";
import { useTaskNavigation } from "@/context/task-navigation-context";
import type { Task } from "@/types";
import { InteractiveTaskCard } from "@/components/tasks/interactive-task-card";

export function LogisticsDashboard() {
  const { profile } = useAuth();
  const { tasks, updateTask } = useTasks();
  const { gameState } = useGameState();
  const { metrics } = useCompanyMetrics();
  const { activeTaskId, openedTaskId, setOpenedTaskId, getTaskRef } = useTaskNavigation();

  const logisticsMetrics = metrics.roles.logistics;
  const logisticsHistory = logisticsMetrics?.trend?.length
    ? logisticsMetrics.trend
    : gameState.kpiHistory;

  const currentRound = logisticsHistory[logisticsHistory.length - 1]?.round || 1;

  const monitoringTasks = useMemo(() => {
    if (!profile) return [];
    return tasks
      .filter(
        (task) =>
          task.role === profile.name &&
          (task.transactionCode === "ZFF7B/ZME2N" || task.transactionCode === "ZME2N (PO Status)") &&
          (task.roundRecurrence === "Continuous" || (task.startRound ?? 1) <= currentRound)
      )
      .sort((a, b) => a.priority.localeCompare(b.priority));
  }, [tasks, profile, currentRound]);

  const stockTransferTasks = useMemo(() => {
    if (!profile) return [];
    return tasks
      .filter(
        (task) =>
          task.role === profile.name &&
          task.transactionCode === "ZMB1B" &&
          (task.roundRecurrence === "Continuous" || (task.startRound ?? 1) <= currentRound)
      )
      .sort((a, b) => a.priority.localeCompare(b.priority));
  }, [tasks, profile, currentRound]);

  const allTasksForPage = useMemo(
    () => [...monitoringTasks, ...stockTransferTasks],
    [monitoringTasks, stockTransferTasks]
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

  const renderTaskSection = (
    taskGroup: Task[],
    title: string,
    description: string,
    Icon: typeof Truck
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
              <InteractiveTaskCard
                ref={getTaskRef(task.id)}
                task={task}
                allTasks={tasks}
                isActive={openedTaskId === task.id}
                isCurrent={activeTaskId === task.id}
                onToggle={() => setOpenedTaskId(openedTaskId === task.id ? null : task.id)}
                onUpdate={handleTaskUpdate}
                onFindNext={(id) => handleFindNextTask(id, taskGroup)}
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
          title="Cash Balance"
          value={gameState.cashBalance}
          icon={HandCoins}
          format="currency"
          tooltip="The total amount of cash your company has on hand."
        />
        <KpiCard
          title="On-Time Delivery Rate"
          value={gameState.onTimeDeliveryRate}
          icon={ShipWheel}
          format="percent"
          tooltip="The percentage of orders delivered to customers on time."
        />
        <KpiCard
          title="Warehouse Costs"
          value={gameState.warehouseCosts}
          icon={Warehouse}
          format="currency"
          tooltip="Total costs associated with storing inventory."
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <LogisticsChart history={logisticsHistory} />
          {logisticsMetrics?.tables.map((table) => (
            <RoleInsightsTable key={table.title} {...table} />
          ))}
        </div>
        {logisticsMetrics?.peerComparison?.length ? (
          <PeerComparisonChart
            peerData={logisticsMetrics.peerComparison}
            currentUserValuation={gameState.companyValuation}
          />
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Truck className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="font-headline text-3xl">Logistics Manager</CardTitle>
              <CardDescription>
                Finished goods transfer, cash flow monitoring, and contingency planning.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {renderTaskSection(
        monitoringTasks,
        "Liquidity & Delivery Monitoring",
        "Monitor current Cash Balance (ZFF7B) and track incoming raw material deliveries from ZME2N.",
        Banknote
      )}
      {renderTaskSection(
        stockTransferTasks,
        "Stock Transfer (ZMB1B)",
        "Calculate and plan stock transfers to DCs using ZMB1B. The Final Transfer Qty will be pushed to the LIT.",
        PackageOpen
      )}
    </div>
  );
}
