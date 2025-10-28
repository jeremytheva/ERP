
"use client";

import { useMemo, createRef } from "react";
import { ListTodo, FileText } from 'lucide-react';
import { TaskGroup } from "@/components/tasks/task-group";
import { useAuth } from '@/hooks/use-auth';
import { useTasks } from '@/hooks/use-tasks';
import { useGameState } from '@/hooks/use-game-data';
import type { Task, Role } from "@/types";
import { useTeamSettings } from "@/hooks/use-team-settings";
import { useTaskNavigation } from "@/context/task-navigation-context";

export default function DebriefingPage() {
    const { profile } = useAuth();
    const { tasks, updateTask } = useTasks();
    const { gameState } = useGameState();
    const { teamLeader } = useTeamSettings();
    
    const { activeTaskId, openedTaskId, setOpenedTaskId, getTaskRef } = useTaskNavigation();

    const currentRound = gameState.kpiHistory[gameState.kpiHistory.length - 1]?.round || 1;
    const isTeamLeader = profile?.id === teamLeader;

    const forecastingTasks = useMemo(() => {
        if (!profile) return [];
        return tasks.filter(task =>
            task.role === profile.name &&
            task.transactionCode.includes("MD61") &&
             (task.roundRecurrence === "Continuous" || (task.startRound ?? 1) <= currentRound)
        ).sort((a,b) => a.priority.localeCompare(b.priority));
    }, [tasks, profile, currentRound]);
    
    const teamLeaderTasks = useMemo(() => {
        if (!isTeamLeader) return [];
        return tasks.filter(task =>
            task.role === "Team Leader" &&
            task.transactionCode.includes("ZFB50") && // Investment decisions
            (task.roundRecurrence === "Continuous" || (task.startRound ?? 1) <= currentRound)
        ).sort((a, b) => a.priority.localeCompare(b.priority));
    }, [tasks, isTeamLeader, currentRound]);

    const allTasksForPage = useMemo(() => [...teamLeaderTasks, ...forecastingTasks], [teamLeaderTasks, forecastingTasks]);

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
            if (taskRef?.current) {
                taskRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } else {
            setOpenedTaskId(null);
        }
    };

    const handleTaskUpdate = (updatedTask: Task) => {
        updateTask(updatedTask);
        if (updatedTask.completed && updatedTask.id === activeTaskId) {
            handleFindNextTask(updatedTask.id, allTasksForPage);
        }
    };

    return (
        <div className="space-y-6">
            {isTeamLeader && (
                <TaskGroup
                    title="Team Leader: Investment Tasks"
                    description="Finalize and confirm investment decisions."
                    tasks={teamLeaderTasks}
                    allTasks={tasks}
                    currentRound={currentRound}
                    openedTaskId={openedTaskId}
                    setOpenedTaskId={setOpenedTaskId}
                    activeTaskId={activeTaskId}
                    getTaskRef={getTaskRef}
                    onUpdate={handleTaskUpdate}
                    onFindNext={handleFindNextTask}
                    titleIcon={<ListTodo className="h-6 w-6" />}
                />
            )}

            <TaskGroup
                title="Forecasting (MD61)"
                description="Calculate and set the total sales forecast for MD61. This will be pushed to the LIT."
                tasks={forecastingTasks}
                allTasks={tasks}
                currentRound={currentRound}
                openedTaskId={openedTaskId}
                setOpenedTaskId={setOpenedTaskId}
                activeTaskId={activeTaskId}
                getTaskRef={getTaskRef}
                onUpdate={handleTaskUpdate}
                onFindNext={handleFindNextTask}
                titleIcon={<FileText className="h-6 w-6" />}
            />
        </div>
    );
}
