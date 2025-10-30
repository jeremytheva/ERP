"use client";

import { RoleDashboardLayout } from "./role-dashboard-layout";
import { useRoleDashboardData } from "@/hooks/use-role-dashboard-data";
import type { RoleDashboardData } from "./types";

interface ProductionDashboardProps {
  dataOverride?: RoleDashboardData;
  isLoadingOverride?: boolean;
  errorOverride?: Error | null;
}

export function ProductionDashboard({
  dataOverride,
  isLoadingOverride,
  errorOverride,
}: ProductionDashboardProps) {
  const { data, isLoading, error } = useRoleDashboardData("production");

  return (
    <RoleDashboardLayout
      title="Production Performance"
      subtitle="Capacity, throughput, and inventory stability sourced from company metrics."
      data={dataOverride ?? data}
      isLoading={isLoadingOverride ?? isLoading}
      errorMessage={(errorOverride ?? error)?.message}
    />
  );
}
