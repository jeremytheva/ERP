"use client";

import { InteractiveTaskCard } from "@/components/tasks/interactive-task-card";
import { SalesChart } from "@/components/dashboard/role-charts/sales-chart";
import { PeerComparisonChart } from "@/components/dashboard/peer-comparison-chart";
import { TrendingUp, DollarSign, Percent } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTasks } from "@/hooks/use-tasks";
import { useGameState } from "@/hooks/use-game-data";
import { useCompanyMetrics } from "@/hooks/use-company-metrics";
import { useTaskNavigation } from "@/context/task-navigation-context";
import { SalesDashboardView, type TaskNavigationControls } from "./sales-dashboard-view";

export function SalesDashboard() {
  const { profile } = useAuth();
  const { tasks, updateTask } = useTasks();
  const { gameState } = useGameState();
  const { metrics } = useCompanyMetrics();
  const { activeTaskId, openedTaskId, setOpenedTaskId, getTaskRef } = useTaskNavigation();

  const navigation: TaskNavigationControls = {
    activeTaskId,
    openedTaskId,
    setOpenedTaskId,
    getTaskRef,
  };

  return (
    <SalesDashboardView
      gameState={gameState}
      metrics={metrics.roles.sales}
      tasks={tasks}
      profileName={profile?.name}
      updateTask={updateTask}
      navigation={navigation}
      components={{
        TaskCard: InteractiveTaskCard,
        SalesChart,
        PeerComparisonChart,
        icons: {
          marketShare: TrendingUp,
          priceGap: DollarSign,
          grossRevenue: Percent,
        },
      }}
    />
  );
}
