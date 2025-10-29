import type { Task as MasterTask } from "../master-data/types";

export type KpiValues = Record<string, number>;

export type UiTask = MasterTask & {
  requiredFields: string[];
};
