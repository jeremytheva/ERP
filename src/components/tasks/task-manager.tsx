"use client";

import { useState } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { useGameState } from "@/hooks/use-game-data";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion } from "@/components/ui/accordion";
import { TaskCard } from "./task-card";
import { TaskFormDialog } from "./task-form-dialog";
import type { Role, Task } from "@/types";

const ROLES: Role[] = ["Sales", "Procurement", "Production", "Logistics", "Team Leader"];

export function TaskManager() {
  const { allTasks, addTask, updateTask } = useTasks();
  const { gameState } = useGameState();
  const [currentRound, setCurrentRound] = useState(gameState.kpiHistory[gameState.kpiHistory.length - 1]?.round || 1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setIsDialogOpen(true);
  };
  
  const handleSaveTask = (task: Task) => {
    if (editingTask) {
      updateTask(task);
    } else {
      addTask({ ...task, id: `T${new Date().getTime()}` });
    }
  };

  const tasksByRound = allTasks.filter(
    (task) =>
      task.roundRecurrence === "Continuous" ||
      (task.roundRecurrence === "RoundStart" && (task.startRound ?? 1) <= currentRound) ||
      (task.roundRecurrence === "Once" && (task.startRound ?? 1) === currentRound)
  );

  const tasksByRole = ROLES.reduce((acc, role) => {
    acc[role] = tasksByRound.filter((task) => task.role === role);
    return acc;
  }, {} as Record<Role, Task[]>);

  const availableRounds = Array.from({ length: gameState.kpiHistory.length }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Round</label>
          <Select value={currentRound.toString()} onValueChange={(val) => setCurrentRound(parseInt(val))}>
            <SelectTrigger className="w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableRounds.map(round => (
                <SelectItem key={round} value={round.toString()}>{round}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleAddTask}>
          <PlusCircle className="mr-2" />
          Add Task
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={["Sales", "Production"]}>
        {ROLES.map((role) => (
          tasksByRole[role].length > 0 && (
            <TaskCard key={role} role={role} tasks={tasksByRole[role]} onEditTask={handleEditTask} />
          )
        ))}
      </Accordion>

      <TaskFormDialog 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSaveTask}
        task={editingTask}
      />
    </div>
  );
}
