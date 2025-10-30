import type { TaskPriority } from "@/types";

export const PRIORITY_BADGE_VARIANT: Record<
  TaskPriority,
  "destructive" | "default" | "secondary" | "outline"
> = {
  Critical: "destructive",
  High: "default",
  Medium: "secondary",
  Low: "outline",
};
