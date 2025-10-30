
"use client";

import React, { createContext, useContext, useState, useMemo, useEffect, useRef, createRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useTasks } from '@/hooks/use-tasks';
import { useGameState } from '@/hooks/use-game-data';
import type { Task, Role } from "@/types";
import { useTeamSettings } from '@/hooks/use-team-settings';
import { Button } from '@/components/ui/button';
import { LocateFixed } from 'lucide-react';

const ROLE_PAGE_MAP: Record<Role, string> = {
    "Sales": "/sales",
    "Production": "/production",
    "Procurement": "/procurement",
    "Logistics": "/logistics",
    "Team Leader": "/strategic-advisor",
};

interface TaskNavigationContextType {
    activeTaskId: string | null;
    openedTaskId: string | null;
    setOpenedTaskId: (id: string | null) => void;
    getTaskRef: (taskId: string) => React.RefObject<HTMLDivElement>;
    activeTaskUrl: string | null;
}

const TaskNavigationContext = createContext<TaskNavigationContextType | undefined>(undefined);

export const TaskNavigationProvider = ({ children }: { children: React.ReactNode }) => {
    const { profile } = useAuth();
    const { tasks } = useTasks();
    const { teamLeader } = useTeamSettings();
    const { gameState } = useGameState();

    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
    const [openedTaskId, setOpenedTaskId] = useState<string | null>(null);
    const [activeTaskUrl, setActiveTaskUrl] = useState<string | null>(null);

    const currentRound = gameState.kpiHistory[gameState.kpiHistory.length - 1]?.round || 1;

    const isTeamLeader = profile?.id === teamLeader;

    const userRoles = useMemo(() => {
        if (!profile) {
            return [];
        }

        const roles: Role[] = [profile.name as Role];

        if (isTeamLeader) {
            roles.push("Team Leader");
        }

        return roles;
    }, [profile, isTeamLeader]);

    const allUserTasks = useMemo(() => {
        return tasks.filter(task =>
            userRoles.includes(task.role) &&
            (task.roundRecurrence === "Continuous" || (task.startRound ?? 1) <= currentRound)
        ).sort((a,b) => {
             const priorityOrder = { "Critical": 1, "High": 2, "Medium": 3, "Low": 4 };
             return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    }, [tasks, userRoles, currentRound]);
    
    useEffect(() => {
        const firstIncomplete = allUserTasks.find(t => !t.completed);
        if (firstIncomplete) {
            setActiveTaskId(firstIncomplete.id);
            if (!openedTaskId) {
                setOpenedTaskId(firstIncomplete.id);
            }
            const taskRole = firstIncomplete.role;
            let pageUrl = ROLE_PAGE_MAP[taskRole] || '/dashboard';
            
            // Special handling for some roles/t-codes that map to different pages
            if(taskRole === 'Sales' && firstIncomplete.transactionCode.includes('MD61')) {
                pageUrl = '/debriefing';
            } else if (taskRole === 'Sales' && firstIncomplete.transactionCode.includes('ZADS')) {
                 pageUrl = '/scenario-planning';
            } else if (taskRole === 'Sales' && firstIncomplete.transactionCode.includes('VK32')) {
                 pageUrl = '/strategic-advisor';
            } else if (taskRole === 'Team Leader' && firstIncomplete.transactionCode.includes('ZFB50')) {
                pageUrl = '/debriefing';
            }
            setActiveTaskUrl(pageUrl);

        } else {
            setActiveTaskId(null);
            setOpenedTaskId(null);
            setActiveTaskUrl(null);
        }
    }, [allUserTasks, openedTaskId]);


    const taskRefs = useRef<Map<string, React.RefObject<HTMLDivElement>>>(new Map());

    const getTaskRef = (taskId: string) => {
        if (!taskRefs.current.has(taskId)) {
            taskRefs.current.set(taskId, createRef<HTMLDivElement>());
        }
        return taskRefs.current.get(taskId)!;
    };


    const value = {
        activeTaskId,
        openedTaskId,
        setOpenedTaskId,
        getTaskRef,
        activeTaskUrl
    };

    return (
        <TaskNavigationContext.Provider value={value}>
            {children}
        </TaskNavigationContext.Provider>
    );
};

export const useTaskNavigation = () => {
    const context = useContext(TaskNavigationContext);
    if (context === undefined) {
        throw new Error("useTaskNavigation must be used within a TaskNavigationProvider");
    }
    return context;
};


export const GoToCurrentTaskButton = () => {
    const { activeTaskId, activeTaskUrl, getTaskRef } = useTaskNavigation();
    const router = useRouter();
    const pathname = usePathname();
    const [activeTaskIsVisible, setActiveTaskIsVisible] = useState(true);

    useEffect(() => {
        if (!activeTaskId || !activeTaskUrl) {
            // No active task, button should not be shown.
            // Setting visibility to true will hide it.
            setActiveTaskIsVisible(true);
            return;
        }
        
        // If we are not on the page of the active task, the element doesn't exist, so the button should be visible.
        if (pathname !== activeTaskUrl) {
            setActiveTaskIsVisible(false);
            return;
        }

        const activeTaskRef = getTaskRef(activeTaskId);
        const observer = new IntersectionObserver(([entry]) => {
            setActiveTaskIsVisible(entry.isIntersecting);
        }, { threshold: 0.5 });
        
        const currentRef = activeTaskRef?.current;
        if (currentRef) {
            observer.observe(currentRef);
        }
        
        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [activeTaskId, getTaskRef, activeTaskUrl, pathname]);
    
    const handleGoToTask = () => {
        if (!activeTaskId || !activeTaskUrl) return;

        if (pathname !== activeTaskUrl) {
            router.push(activeTaskUrl);
            // Scrolling will be handled by the useEffect on the destination page
        } else {
            const taskRef = getTaskRef(activeTaskId);
            if (taskRef?.current) {
                taskRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    };
    
    if (!activeTaskId || activeTaskIsVisible) {
        return null;
    }

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <Button size="lg" className="shadow-lg" onClick={handleGoToTask}>
                <LocateFixed className="mr-2 h-5 w-5" />
                Go to Current Task
            </Button>
        </div>
    );
};
