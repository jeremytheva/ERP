
"use client";

import { useMemo } from "react";
import { ListTodo, Lightbulb } from "lucide-react";
import { TaskGroup } from "@/components/tasks/task-group";
import { useAuth } from '@/hooks/use-auth';
import { useTasks } from '@/hooks/use-tasks';
import { useGameState } from '@/hooks/use-game-data';
import type { Task, Role } from "@/types";
import { useTeamSettings } from "@/hooks/use-team-settings";
import { useTaskNavigation } from "@/context/task-navigation-context";

export default function StrategicAdvisorPage() {
    const { profile } = useAuth();
    const { tasks, allTasks, updateTask } = useTasks();
    const { gameState } = useGameState();
    const { teamLeader } = useTeamSettings();
    const { activeTaskId, openedTaskId, setOpenedTaskId, getTaskRef } = useTaskNavigation();
    
    const currentRound = gameState.kpiHistory[gameState.kpiHistory.length - 1]?.round || 1;
    const isTeamLeader = profile?.id === teamLeader;

    const userRoles = useMemo(() => {
        if (!profile) return [];
        const roles: Role[] = [profile.name as Role];
        if (isTeamLeader) {
            roles.push("Team Leader");
        }
        return roles;
    }, [profile, isTeamLeader]);

    const pricingTasks = useMemo(() => {
        if (!profile) return [];
        return tasks.filter(task =>
            userRoles.includes(task.role) &&
            task.transactionCode.includes("VK32") &&
             (task.roundRecurrence === "Continuous" || (task.startRound ?? 1) <= currentRound)
        ).sort((a,b) => a.priority.localeCompare(b.priority));
    }, [tasks, profile, currentRound, userRoles]);

    const strategyTasks = useMemo(() => {
        if (!isTeamLeader) return [];
        return tasks.filter(task =>
            task.role === "Team Leader" &&
            (task.transactionCode === "N/A (Team Coordination)" || task.transactionCode.includes("F.01") || task.transactionCode.includes("Dashboard")) &&
            (task.roundRecurrence === "Continuous" || (task.startRound ?? 1) <= currentRound)
        ).sort((a, b) => a.priority.localeCompare(b.priority));
    }, [tasks, isTeamLeader, currentRound]);
    
    const allTasksForPage = useMemo(() => [...strategyTasks, ...pricingTasks], [strategyTasks, pricingTasks]);
    
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
                    title="Team Leader: Strategy Tasks"
                    description="Review KPIs and manage overall team strategy."
                    tasks={strategyTasks}
                    allTasks={allTasks}
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
                title="Pricing (VK32)"
                description="Set the final price for all products. Use the strategy tool to stay aligned with competitor averages."
                tasks={pricingTasks}
                allTasks={allTasks}
                currentRound={currentRound}
                openedTaskId={openedTaskId}
                setOpenedTaskId={setOpenedTaskId}
                activeTaskId={activeTaskId}
                getTaskRef={getTaskRef}
                onUpdate={handleTaskUpdate}
                onFindNext={handleFindNextTask}
                titleIcon={<Lightbulb className="h-6 w-6" />}
            />
        </div>
    )
}
