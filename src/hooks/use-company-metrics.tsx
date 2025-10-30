"use client";

import { collection } from "firebase/firestore";
import { useMemo } from "react";
import { useCollection, useFirestore, useMemoFirebase, type WithId } from "@/firebase";
import type { CompanyMetricsDocument, RoleRoute } from "@/types";

interface UseCompanyMetricsResult {
  metrics: WithId<CompanyMetricsDocument>[];
  metricsByRole: Partial<Record<RoleRoute, WithId<CompanyMetricsDocument>>>;
  isLoading: boolean;
  error: Error | null;
}

export function useCompanyMetrics(): UseCompanyMetricsResult {
  const firestore = useFirestore();
  const metricsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, "companyMetrics");
  }, [firestore]);

  const { data, isLoading, error } = useCollection<CompanyMetricsDocument>(metricsCollection);

  const metrics = data ?? [];

  const metricsByRole = useMemo(() => {
    return metrics.reduce<Partial<Record<RoleRoute, WithId<CompanyMetricsDocument>>>>((acc, metric) => {
      acc[metric.role] = metric;
      return acc;
    }, {});
  }, [metrics]);

  return {
    metrics,
    metricsByRole,
    isLoading,
    error: error as Error | null,
  };
}
