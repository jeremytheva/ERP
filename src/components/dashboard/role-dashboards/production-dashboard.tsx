"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Factory, RefreshCw, Package, FileBox, Wrench, PackageCheck, FileSignature } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ProductionChart } from "@/components/dashboard/role-charts/production-chart";
import { PeerComparisonChart } from "@/components/dashboard/peer-comparison-chart";
import { RoleInsightsTable } from "./role-insights-table";
import { useAuth } from "@/hooks/use-auth";
import { useTasks } from "@/hooks/use-tasks";
import { useGameState } from "@/hooks/use-game-data";
import { useCompanyMetrics } from "@/hooks/use-company-metrics";
import { useTaskNavigation } from "@/context/task-navigation-context";
import type { Task } from "@/types";
import { InteractiveTaskCard } from "@/components/tasks/interactive-task-card";

export function ProductionDashboard() {
  const { profile } = useAuth();
  const { tasks, updateTask } = useTasks();
  const { gameState } = useGameState();
  const { metrics } = useCompanyMetrics();
  const { activeTaskId, openedTaskId, setOpenedTaskId, getTaskRef } = useTaskNavigation();

  const productionMetrics = metrics.roles.production;
  const productionHistory = productionMetrics?.trend?.length
    ? productionMetrics.trend
    : gameState.kpiHistory;

  const currentRound = productionHistory[productionHistory.length - 1]?.round || 1;

  const planningTasks = useMemo(() => {
    if (!profile) return [];
    return tasks
      .filter(
        (task) =>
          task.role === profile.name &&
          (task.transactionCode.includes("ZMB52") || task.transactionCode.includes("ZCOOIS")) &&
          (task.roundRecurrence === "Continuous" || (task.startRound ?? 1) <= currentRound)
      )
      .sort((a, b) => a.priority.localeCompare(b.priority));
  }, [tasks, profile, currentRound]);

  const mrpTasks = useMemo(() => {
    if (!profile) return [];
    return tasks
      .filter(
        (task) =>
          task.role === profile.name &&
          task.transactionCode === "MD01" &&
          (task.roundRecurrence === "Continuous" || (task.startRound ?? 1) <= currentRound)
      )
      .sort((a, b) => a.priority.localeCompare(b.priority));
  }, [tasks, profile, currentRound]);

  const releaseTasks = useMemo(() => {
    if (!profile) return [];
    return tasks
      .filter(
        (task) =>
          task.role === profile.name &&
          task.transactionCode.startsWith("CO41") &&
          (task.roundRecurrence === "Continuous" || (task.startRound ?? 1) <= currentRound)
      )
      .sort((a, b) => a.priority.localeCompare(b.priority));
  }, [tasks, profile, currentRound]);

  const bomTasks = useMemo(() => {
    if (!profile) return [];
    return tasks
      .filter(
        (task) =>
          task.role === profile.name &&
          task.transactionCode === "ZCS02" &&
          (task.roundRecurrence === "Continuous" || (task.startRound ?? 1) <= currentRound)
      )
      .sort((a, b) => a.priority.localeCompare(b.priority));
  }, [tasks, profile, currentRound]);

  const allTasksForPage = useMemo(
    () => [...planningTasks, ...mrpTasks, ...releaseTasks, ...bomTasks],
    [planningTasks, mrpTasks, releaseTasks, bomTasks]
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
    Icon: typeof Factory
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
          title="Capacity Utilization"
          value={gameState.capacityUtilization}
          icon={Factory}
          format="percent"
          tooltip="Percentage of total production capacity being used."
        />
        <KpiCard
          title="Inventory Turnover"
          value={gameState.inventoryTurnover}
          icon={RefreshCw}
          format="number"
          tooltip="How many times inventory is sold and replaced over a period."
        />
        <KpiCard
          title="Inventory Value"
          value={gameState.inventoryValue}
          icon={Package}
          format="currency"
          tooltip="The total value of inventory on hand."
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <ProductionChart history={productionHistory} />
          {productionMetrics?.tables.map((table) => (
            <RoleInsightsTable key={table.title} {...table} />
          ))}
        </div>
        {productionMetrics?.peerComparison?.length ? (
          <PeerComparisonChart
            peerData={productionMetrics.peerComparison}
            currentUserValuation={gameState.companyValuation}
          />
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Factory className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="font-headline text-3xl">Production Manager</CardTitle>
              <CardDescription>
                Capacity, efficiency, BOM, and production release management.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {renderTaskSection(
        planningTasks,
        "Planning & Capacity",
        "Confirm capacity, set lot size strategy, and check for overstock.",
        FileBox
      )}
      {renderTaskSection(
        mrpTasks,
        "MRP (MD01)",
        "Execute the MRP run after the forecast is finalized.",
        Wrench
      )}
      {renderTaskSection(
        releaseTasks,
        "Production Release (CO41)",
        "Final step to release production orders. The output will be logged to the LIT.",
        PackageCheck
      )}
      {renderTaskSection(
        bomTasks,
        "BOM Review (ZCS02)",
        "Validate BOM accuracy and confirm component availability.",
        FileSignature
      )}
    </div>
  );
}
