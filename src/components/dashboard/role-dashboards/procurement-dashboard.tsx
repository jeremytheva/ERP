"use client";

import { RoleDashboardLayout } from "./role-dashboard-layout";
import { useRoleDashboardData } from "@/hooks/use-role-dashboard-data";
import type { RoleDashboardData } from "./types";

interface ProcurementDashboardProps {
  dataOverride?: RoleDashboardData;
  isLoadingOverride?: boolean;
  errorOverride?: Error | null;
}

export function ProcurementDashboard({
  dataOverride,
  isLoadingOverride,
  errorOverride,
}: ProcurementDashboardProps) {
  const { data, isLoading, error } = useRoleDashboardData("procurement");

  return (
    <RoleDashboardLayout
      title="Procurement Overview"
      subtitle="Spend, replenishment, and sustainability performance drawn from company metrics."
      data={dataOverride ?? data}
      isLoading={isLoadingOverride ?? isLoading}
      errorMessage={(errorOverride ?? error)?.message}
    />
  );
}
