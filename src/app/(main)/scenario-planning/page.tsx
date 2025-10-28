
"use client";

import { useMemo } from "react";
import { TaskGroup } from "@/components/tasks/task-group";
import { useAuth } from '@/hooks/use-auth';
import { useTasks } from '@/hooks/use-tasks';
import { useGameState } from '@/hooks/use-game-data';
import type { Task } from "@/types";
import { useTaskNavigation } from "@/context/task-navigation-context";

export default function ScenarioPlanningPage() {
    const { profile } = useAuth();
    const { tasks, updateTask } = useTasks();
    const { gameState } = useGameState();
    const { activeTaskId, openedTaskId, setOpenedTaskId, getTaskRef } = useTaskNavigation();
    
    const currentRound = gameState.kpiHistory[gameState.kpiHistory.length - 1]?.round || 1;

    const marketingTasks = useMemo(() => {
        if (!profile) return [];
        return tasks.filter(task =>
            task.role === profile.name &&
            task.transactionCode.includes("ZADS") &&
             (task.roundRecurrence === "Continuous" || (task.startRound ?? 1) <= currentRound)
        ).sort((a,b) => a.priority.localeCompare(b.priority));
    }, [tasks, profile, currentRound]);
    
    const handleFindNextTask = (currentTaskId: string, taskGroup: Task[]) => {
        const currentIndex = taskGroup.findIndex(t => t.id === currentTaskId);
        if (currentIndex === -1) {
            setOpenedTaskId(null);
            return;
        }
        const nextIncompleteTask = taskGroup.slice(currentIndex + 1).find(t => !t.completed);

        if (nextIncompleteTask) {
            setOpenedTaskId(nextIncompleteTask.id);
            const taskRef = getTaskRef(nextIncompleteTask.id);
            if(taskRef?.current) {
                taskRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } else {
            setOpenedTaskId(null);
        }
    };
    
    const handleTaskUpdate = (updatedTask: Task) => {
        updateTask(updatedTask);
        if (updatedTask.completed && updatedTask.id === activeTaskId) {
            handleFindNextTask(updatedTask.id, marketingTasks);
        }
    };

    return (
        <div className="space-y-6">
            <TaskGroup
                title="Marketing (ZADS)"
                description="Set the advertising spend for each distribution channel for ZADS."
                tasks={marketingTasks}
                allTasks={tasks}
                currentRound={currentRound}
                openedTaskId={openedTaskId}
                setOpenedTaskId={setOpenedTaskId}
                activeTaskId={activeTaskId}
                getTaskRef={getTaskRef}
                onUpdate={handleTaskUpdate}
                onFindNext={handleFindNextTask}
            />
        </div>
    )
}
