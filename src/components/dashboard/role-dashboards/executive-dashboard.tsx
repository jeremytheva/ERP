"use client";

import { RoleDashboardLayout } from "./role-dashboard-layout";
import { useRoleDashboardData } from "@/hooks/use-role-dashboard-data";
import type { RoleDashboardData } from "./types";

interface ExecutiveDashboardProps {
  dataOverride?: RoleDashboardData;
  isLoadingOverride?: boolean;
  errorOverride?: Error | null;
}

export function ExecutiveDashboard({
  dataOverride,
  isLoadingOverride,
  errorOverride,
}: ExecutiveDashboardProps) {
  const { data, isLoading, error } = useRoleDashboardData("lead");

  return (
    <RoleDashboardLayout
      title="Executive Summary"
      subtitle="Company valuation, profitability, and margin benchmarks sourced from company metrics."
      data={dataOverride ?? data}
      isLoading={isLoadingOverride ?? isLoading}
      errorMessage={(errorOverride ?? error)?.message}
    />
  );
}
