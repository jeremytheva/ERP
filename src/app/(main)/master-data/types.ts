import type { Task as BaseTask } from "@/types";

export type GoalTargetType = "increase" | "decrease" | "maintain" | "maximize" | "minimize" | null;

export interface GoalCalculation {
  baseMetric?: string | null;
  targetType?: GoalTargetType;
  targetValue?: number | null;
  minLimit?: number | null;
  maxLimit?: number | null;
  constraints?: string[];
  formula?: string | null;
}

export type Task = BaseTask & {
  version?: number | null;
  round?: number;
  impact?: string | null;
  visibility?: string | null;
  alertKey?: string | null;
  roundStartOffsetMinutes?: number | null;
  roundDueOffsetMinutes?: number | null;
  goalMetric?: string | null;
  goalTargetType?: GoalTargetType;
  goalTargetValue?: number | null;
  goalUnit?: string | null;
  goalRationale?: string | null;
  goalCalculation?: GoalCalculation | null;
};
