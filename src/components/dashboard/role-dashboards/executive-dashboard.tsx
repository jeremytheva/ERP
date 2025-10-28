"use client";

import { InteractiveTaskCard } from "@/components/tasks/interactive-task-card";
import { KpiCharts } from "@/components/dashboard/kpi-charts";
import { PeerComparisonChart } from "@/components/dashboard/peer-comparison-chart";
import { Target, DollarSign, HandCoins, Leaf, ListTodo, FileText } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTasks } from "@/hooks/use-tasks";
import { useGameState } from "@/hooks/use-game-data";
import { useTeamSettings } from "@/hooks/use-team-settings";
import { useCompanyMetrics } from "@/hooks/use-company-metrics";
import { useTaskNavigation } from "@/context/task-navigation-context";
import {
  ExecutiveDashboardView,
  type NavigationControls,
} from "./executive-dashboard-view";

export function ExecutiveDashboard() {
  const { profile } = useAuth();
  const { tasks, updateTask } = useTasks();
  const { gameState } = useGameState();
  const { teamLeader } = useTeamSettings();
  const { metrics } = useCompanyMetrics();
  const { activeTaskId, openedTaskId, setOpenedTaskId, getTaskRef } = useTaskNavigation();

  const navigation: NavigationControls = {
    activeTaskId,
    openedTaskId,
    setOpenedTaskId,
    getTaskRef,
  };

  return (
    <ExecutiveDashboardView
      gameState={gameState}
      metrics={metrics.roles.lead}
      tasks={tasks}
      profileId={profile?.id}
      profileName={profile?.name}
      teamLeaderId={teamLeader}
      updateTask={updateTask}
      navigation={navigation}
      components={{
        TaskCard: InteractiveTaskCard,
        KpiCharts,
        PeerComparisonChart,
        icons: {
          kpi: {
            companyValuation: Target,
            netIncome: DollarSign,
            cashBalance: HandCoins,
            emissions: Leaf,
          },
          sections: {
            teamLeader: ListTodo,
            forecasting: FileText,
          },
        },
      }}
    />
  );
}
