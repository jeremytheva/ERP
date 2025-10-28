"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Package, Users, Truck, Leaf, DollarSign, Warehouse } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ProcurementChart } from "@/components/dashboard/role-charts/procurement-chart";
import { PeerComparisonChart } from "@/components/dashboard/peer-comparison-chart";
import { RoleInsightsTable } from "./role-insights-table";
import { useAuth } from "@/hooks/use-auth";
import { useTasks } from "@/hooks/use-tasks";
import { useGameState } from "@/hooks/use-game-data";
import { useCompanyMetrics } from "@/hooks/use-company-metrics";
import { useTaskNavigation } from "@/context/task-navigation-context";
import type { Task } from "@/types";
import { InteractiveTaskCard } from "@/components/tasks/interactive-task-card";

export function ProcurementDashboard() {
  const { profile } = useAuth();
  const { tasks, updateTask } = useTasks();
  const { gameState } = useGameState();
  const { metrics } = useCompanyMetrics();
  const { activeTaskId, openedTaskId, setOpenedTaskId, getTaskRef } = useTaskNavigation();

  const procurementMetrics = metrics.roles.procurement;
  const procurementHistory = procurementMetrics?.trend?.length
    ? procurementMetrics.trend
    : gameState.kpiHistory;

  const currentRound = procurementHistory[procurementHistory.length - 1]?.round || 1;

  const createTaskFilter = (transactionCode: string) =>
    tasks
      .filter(
        (task) =>
          task.role === profile?.name &&
          task.transactionCode === transactionCode &&
          (task.roundRecurrence === "Continuous" || (task.startRound ?? 1) <= currentRound)
      )
      .sort((a, b) => a.priority.localeCompare(b.priority));

  const inventoryTasks = useMemo(() => createTaskFilter("ZMB52"), [tasks, profile, currentRound]);
  const sourcingTasks = useMemo(() => createTaskFilter("ZME12"), [tasks, profile, currentRound]);
  const orderTasks = useMemo(() => createTaskFilter("ME59N"), [tasks, profile, currentRound]);
  const sustainabilityTasks = useMemo(() => createTaskFilter("ZFB50"), [tasks, profile, currentRound]);

  const allTasksForPage = useMemo(
    () => [...inventoryTasks, ...sourcingTasks, ...orderTasks, ...sustainabilityTasks],
    [inventoryTasks, sourcingTasks, orderTasks, sustainabilityTasks]
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

  const renderTaskGroup = (
    taskGroup: Task[],
    title: string,
    description: string,
    Icon: typeof ShoppingCart,
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
          title="Cost of Goods Sold"
          value={gameState.cogs}
          icon={DollarSign}
          format="currency"
          tooltip="The direct costs attributable to the production of the goods sold."
        />
        <KpiCard
          title="Warehouse Costs"
          value={gameState.warehouseCosts}
          icon={Warehouse}
          format="currency"
          tooltip="Total costs associated with storing inventory."
        />
        <KpiCard
          title="CO₂e Emissions"
          value={gameState.cumulativeCO2eEmissions}
          icon={Leaf}
          format="number"
          unit="kg"
          tooltip="Cumulative CO₂ equivalent emissions from operations."
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <ProcurementChart history={procurementHistory} />
          {procurementMetrics?.tables.map((table) => (
            <RoleInsightsTable key={table.title} {...table} />
          ))}
        </div>
        {procurementMetrics?.peerComparison?.length ? (
          <PeerComparisonChart
            peerData={procurementMetrics.peerComparison}
            currentUserValuation={gameState.companyValuation}
          />
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <ShoppingCart className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="font-headline text-3xl">Procurement Manager</CardTitle>
              <CardDescription>
                RM sourcing, inventory replenishment, and sustainability investment.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {renderTaskGroup(
        inventoryTasks,
        "Inventory Check (ZMB52)",
        "Pull current raw material stock and status from the LIT.",
        Package
      )}
      {renderTaskGroup(
        sourcingTasks,
        "Sourcing (ZME12)",
        "Set the order strategy and vendor selection for each raw material.",
        Users
      )}
      {renderTaskGroup(
        orderTasks,
        "Order Calculation (ME59N)",
        "Calculate the required quantity to order based on MRP forecast and current stock.",
        Truck
      )}
      {renderTaskGroup(
        sustainabilityTasks,
        "Sustainability (ZFB50)",
        "Plan investments that reduce emissions or improve supplier ESG scores.",
        Leaf
      )}
    </div>
  );
}
