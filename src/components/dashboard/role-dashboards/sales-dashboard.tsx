"use client";

import { RoleDashboardLayout } from "./role-dashboard-layout";
import { useRoleDashboardData } from "@/hooks/use-role-dashboard-data";
import type { RoleDashboardData } from "./types";

interface SalesDashboardProps {
  dataOverride?: RoleDashboardData;
  isLoadingOverride?: boolean;
  errorOverride?: Error | null;
}

export function SalesDashboard({
  dataOverride,
  isLoadingOverride,
  errorOverride,
}: SalesDashboardProps) {
  const { data, isLoading, error } = useRoleDashboardData("sales");

  return (
    <RoleDashboardLayout
      title="Sales Performance"
      subtitle="Market coverage, pricing, and revenue insights sourced from company metrics."
      data={dataOverride ?? data}
      isLoading={isLoadingOverride ?? isLoading}
      errorMessage={(errorOverride ?? error)?.message}
    />
  );
}
