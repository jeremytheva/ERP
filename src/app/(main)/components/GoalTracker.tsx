"use client";

import { useMemo } from "react";
import { Sparkles, AlertTriangle } from "lucide-react";
import type { UiTask, KpiValues } from "./types";

interface GoalTrackerProps {
  task: UiTask;
  kpiValues: KpiValues;
}

function formatNumber(value: number, unit?: string | null) {
  if (!Number.isFinite(value)) {
    return "—";
  }
  const formatter = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: Math.abs(value) >= 1000 ? 0 : 2,
  });
  return `${formatter.format(value)}${unit ? ` ${unit}` : ""}`.trim();
}

export function GoalTracker({ task, kpiValues }: GoalTrackerProps) {
  const requiredFields = task.requiredFields;
  const goalCalculation = task.goalCalculation;
  const hasFormula = Boolean(goalCalculation?.formula);

  const missingFields = useMemo(() => {
    return requiredFields.filter((field) => !Number.isFinite(kpiValues[field]));
  }, [requiredFields, kpiValues]);

  const evaluation = useMemo(() => {
    if (!hasFormula || !goalCalculation?.formula) {
      return { status: "no-formula" as const };
    }

    if (missingFields.length > 0) {
      return { status: "missing-fields" as const };
    }

    try {
      // eslint-disable-next-line no-new-func
      const fn = Function("\"use strict\";return (" + goalCalculation.formula + ");")();
      if (typeof fn !== "function") {
        return { status: "invalid" as const };
      }
      const result = fn(kpiValues);
      if (result === undefined || result === null) {
        return { status: "invalid" as const };
      }
      const numeric = typeof result === "number" ? result : Number(result);
      if (!Number.isFinite(numeric)) {
        return { status: "invalid" as const };
      }
      return { status: "ok" as const, value: numeric };
    } catch (error) {
      console.error("Goal formula error", error);
      return { status: "error" as const };
    }
  }, [goalCalculation, hasFormula, kpiValues, missingFields.length]);

  const goalSummary = useMemo(() => {
    const type = task.goalTargetType ?? goalCalculation?.targetType;
    const value = task.goalTargetValue ?? goalCalculation?.targetValue;
    const metric = task.goalMetric ?? goalCalculation?.baseMetric;
    if (!type || value == null || !metric) {
      return null;
    }
    const fallbackUnit = goalCalculation?.constraints?.includes("percentage") ? "%" : undefined;
    const unit = task.goalUnit ?? fallbackUnit;
    return `${type.charAt(0).toUpperCase() + type.slice(1)} ${metric} by ${value}${unit ?? ""}`;
  }, [goalCalculation, task.goalMetric, task.goalTargetType, task.goalTargetValue, task.goalUnit]);

  return (
    <div className="mt-3 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-3 text-sm">
      <div className="flex items-center gap-2 font-medium">
        <Sparkles className="h-4 w-4 text-primary" />
        <span>Goal insight</span>
      </div>
      {goalSummary && <p className="mt-1 text-muted-foreground">{goalSummary}</p>}
      {task.goalRationale && (
        <p className="mt-2 text-xs text-muted-foreground/80">{task.goalRationale}</p>
      )}
      {evaluation.status === "ok" && (
        <p className="mt-2 font-semibold text-emerald-500">
          Target result: {formatNumber(evaluation.value, task.goalUnit)}
        </p>
      )}
      {evaluation.status === "missing-fields" && missingFields.length > 0 && (
        <p className="mt-2 flex items-start gap-2 text-xs text-amber-500">
          <AlertTriangle className="mt-0.5 h-4 w-4" />
          Provide values for {missingFields.map((field) => field.replace(/_/g, " ")).join(", ")} to estimate this goal.
        </p>
      )}
      {evaluation.status === "invalid" && (
        <p className="mt-2 flex items-start gap-2 text-xs text-amber-500">
          <AlertTriangle className="mt-0.5 h-4 w-4" />
          Goal formula could not be evaluated.
        </p>
      )}
      {evaluation.status === "error" && (
        <p className="mt-2 flex items-start gap-2 text-xs text-rose-500">
          <AlertTriangle className="mt-0.5 h-4 w-4" />
          Unexpected error while evaluating this goal.
        </p>
      )}
      {evaluation.status === "no-formula" && (
        <p className="mt-2 text-xs text-muted-foreground/80">This task does not define a goal formula.</p>
      )}
    </div>
  );
}
