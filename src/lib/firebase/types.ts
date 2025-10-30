import {
  DEFAULT_ROLE_METADATA,
  type CompanyMetricContract,
  type ActionItemContract,
  type AiInsightContract,
  type RoleMetadataContract,
} from "../../../docs/firestore-schema";
import { Timestamp } from "firebase/firestore";

export interface TimeSeriesPoint {
  date: Date;
  value: number;
}

export interface CompanyMetric
  extends Omit<CompanyMetricContract, "updatedAt" | "trend" | "deltaDirection"> {
  updatedAt: Date;
  trend: TimeSeriesPoint[];
  deltaDirection?: CompanyMetricContract["deltaDirection"];
}

export interface ActionItem
  extends Omit<ActionItemContract, "createdAt" | "dueAt"> {
  createdAt: Date;
  dueAt?: Date | null;
}

export interface AiInsight
  extends Omit<AiInsightContract, "createdAt"> {
  createdAt: Date;
}

export interface RoleMetadata extends RoleMetadataContract {}

export type FirestoreDateLike = string | Date | Timestamp | number | null | undefined;

export const DEFAULT_ROLE_METADATA_MAP = new Map<string, RoleMetadataContract>();

for (const entry of DEFAULT_ROLE_METADATA) {
  DEFAULT_ROLE_METADATA_MAP.set(entry.id, entry);
}

export function coerceDate(value: FirestoreDateLike): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "number") {
    return new Date(value);
  }

  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (value instanceof Timestamp) {
    return value.toDate();
  }

  return null;
}

export function normalizeTrend(trend?: CompanyMetricContract["trend"]): TimeSeriesPoint[] {
  if (!trend?.length) {
    return [];
  }

  return trend
    .map((point) => {
      const date = coerceDate(point.timestamp);
      if (!date) {
        return null;
      }

      return {
        date,
        value: point.value,
      } satisfies TimeSeriesPoint;
    })
    .filter((point): point is TimeSeriesPoint => Boolean(point))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function mapCompanyMetric(contract: CompanyMetricContract): CompanyMetric {
  const updatedAt = coerceDate(contract.updatedAt) ?? new Date();

  return {
    ...contract,
    updatedAt,
    trend: normalizeTrend(contract.trend),
  };
}

export function mapActionItem(contract: ActionItemContract): ActionItem {
  return {
    ...contract,
    createdAt: coerceDate(contract.createdAt) ?? new Date(),
    dueAt: coerceDate(contract.dueAt) ?? null,
  };
}

export function mapAiInsight(contract: AiInsightContract): AiInsight {
  return {
    ...contract,
    createdAt: coerceDate(contract.createdAt) ?? new Date(),
  };
}

export function resolveRoleMetadata(roleId: string): RoleMetadata | null {
  return DEFAULT_ROLE_METADATA_MAP.get(roleId) ?? null;
}
