"use client";

import { RoleDashboardLayout } from "./role-dashboard-layout";
import { useRoleDashboardData } from "@/hooks/use-role-dashboard-data";
import type { RoleDashboardData } from "./types";

interface LogisticsDashboardProps {
  dataOverride?: RoleDashboardData;
  isLoadingOverride?: boolean;
  errorOverride?: Error | null;
}

export function LogisticsDashboard({
  dataOverride,
  isLoadingOverride,
  errorOverride,
}: LogisticsDashboardProps) {
  const { data, isLoading, error } = useRoleDashboardData("logistics");

  return (
    <RoleDashboardLayout
      title="Logistics & Fulfillment"
      subtitle="Liquidity, service level, and warehouse health sourced from company metrics."
      data={dataOverride ?? data}
      isLoading={isLoadingOverride ?? isLoading}
      errorMessage={(errorOverride ?? error)?.message}
    />
  );
}
