import type {
  CompanyMetricTable,
  MetricFormat,
  MetricTrendPoint,
  PeerMetricPoint,
} from "@/types";
import type { LucideIcon } from "lucide-react";

export interface RoleDashboardKpi {
  id: string;
  label: string;
  value: number;
  format?: MetricFormat;
  unit?: string;
  tooltip?: string;
  icon: LucideIcon;
}

export interface RoleTrendSeries {
  id: string;
  label: string;
  format?: MetricFormat;
  color?: string;
  data: MetricTrendPoint[];
}

export interface RoleDashboardTrend {
  title: string;
  description?: string;
  series: RoleTrendSeries[];
}

export interface RolePeerComparison {
  title: string;
  description?: string;
  metricLabel: string;
  format?: MetricFormat;
  highlightName?: string;
  data: PeerMetricPoint[];
}

export interface RoleDashboardTable extends CompanyMetricTable {}

export interface RoleDashboardData {
  kpis: RoleDashboardKpi[];
  trend?: RoleDashboardTrend;
  peerComparison?: RolePeerComparison;
  table?: RoleDashboardTable;
  updatedAtLabel?: string;
}
