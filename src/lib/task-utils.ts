import type { Task } from "@/types";

export const isTaskActiveForRound = (task: Task, round: number): boolean => {
  const startRound = task.startRound ?? 1;

  switch (task.roundRecurrence) {
    case "Continuous":
      return true;
    case "RoundStart":
      return startRound <= round;
    case "Once":
      return startRound === round;
    default:
      return false;
  }
};
