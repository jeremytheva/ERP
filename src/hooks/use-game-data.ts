
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  INITIAL_GAME_STATE,
  MOCK_COMPETITOR_LOG,
  ROLE_ACTION_ITEMS,
} from "@/lib/mock-data";
import type { GameState, ActionItem, CompetitorLogEntry, KpiHistoryEntry } from "@/types";
import { useTeamSettings } from "./use-team-settings";
import { useAuth } from "./use-auth";

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [roundDuration, setRoundDuration] = useState(1200); // 20 minutes
  const [breakDuration, setBreakDuration] = useState(300); // 5 minutes
  const [isBreakEnabled, setIsBreakEnabled] = useState(true);
  const [isBreakActive, setIsBreakActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(roundDuration);
  const [isPaused, setIsPaused] = useState(false);

  const advanceRound = useCallback(() => {
    setIsBreakActive(false);
    setGameState(prevGameState => {
        const lastRound = prevGameState.kpiHistory[prevGameState.kpiHistory.length - 1];
        const change = (Math.random() - 0.5) * 100000;
        const newNetIncome = lastRound.netIncome + change;
        const newHistoryEntry: KpiHistoryEntry = {
            round: lastRound.round + 1,
            companyValuation: lastRound.companyValuation + change * 2,
            netIncome: newNetIncome,
            inventoryValue: lastRound.inventoryValue + (Math.random() - 0.5) * 50000,
            totalEmissions: Math.max(0, lastRound.totalEmissions + (Math.random() - 0.5) * 10),
        };

        const newKpiHistory = [...prevGameState.kpiHistory, newHistoryEntry];
        const latestKpis = newKpiHistory[newKpiHistory.length - 1];

        return {
            ...prevGameState,
            ...latestKpis,
            kpiHistory: newKpiHistory.slice(-10)
        }
    });
    setTimeLeft(roundDuration);
  }, [roundDuration]);

  const startBreak = useCallback(() => {
    setIsBreakActive(true);
    setTimeLeft(breakDuration);
  }, [breakDuration]);

  useEffect(() => {
    if (isPaused) return;

    const timerInterval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (isBreakActive) {
            advanceRound();
          } else if (isBreakEnabled) {
            startBreak();
          } else {
            advanceRound();
          }
          return 0; 
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [isPaused, isBreakActive, isBreakEnabled, advanceRound, startBreak]);
  
  useEffect(() => {
    if (!isBreakActive) {
      setTimeLeft(roundDuration);
    }
  }, [roundDuration, isBreakActive]);
  
  useEffect(() => {
    if (isBreakActive) {
      setTimeLeft(breakDuration);
    }
  }, [breakDuration, isBreakActive]);

  const togglePause = () => {
    setIsPaused(prev => !prev);
  };

  const resetTimer = () => {
    setTimeLeft(isBreakActive ? breakDuration : roundDuration);
  };
  
  const setRound = (newRound: number) => {
    if (newRound < 1) return;
    setIsBreakActive(false); // Exit break if manually changing round

    setGameState(prevGameState => {
        let newKpiHistory = [...prevGameState.kpiHistory];
        const currentRound = newKpiHistory[newKpiHistory.length - 1].round;

        if (newRound > currentRound) {
            // Add new rounds
            for (let i = currentRound; i < newRound; i++) {
                const lastRound = newKpiHistory[newKpiHistory.length - 1];
                const change = (Math.random() - 0.5) * 100000;
                const newNetIncome = lastRound.netIncome + change;
                const newHistoryEntry: KpiHistoryEntry = {
                    round: lastRound.round + 1,
                    companyValuation: lastRound.companyValuation + change * 2,
                    netIncome: newNetIncome,
                    inventoryValue: lastRound.inventoryValue + (Math.random() - 0.5) * 50000,
                    totalEmissions: Math.max(0, lastRound.totalEmissions + (Math.random() - 0.5) * 10),
                };
                newKpiHistory.push(newHistoryEntry);
            }
        } else if (newRound < currentRound) {
            // Remove rounds
            newKpiHistory = newKpiHistory.filter(entry => entry.round <= newRound);
             if (newKpiHistory.length === 0) {
              newKpiHistory.push(INITIAL_GAME_STATE.kpiHistory[0]);
            }
        } else {
            return prevGameState; // No change
        }

        const latestKpis = newKpiHistory[newKpiHistory.length - 1];

        return {
            ...prevGameState,
            ...latestKpis,
            kpiHistory: newKpiHistory.slice(-10),
        };
    });
     setTimeLeft(roundDuration); // Always reset to round duration
  }


  return { 
    gameState,
    timeLeft,
    isPaused,
    isBreakActive,
    isBreakEnabled,
    roundDuration,
    breakDuration,
    togglePause,
    resetTimer,
    setRound,
    setRoundDuration,
    setBreakDuration,
    setIsBreakEnabled,
   };
}

export function useActionItems() {
  const { profile } = useAuth();
  const { teamLeader } = useTeamSettings();
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);

  useEffect(() => {
    if (profile?.id) {
      const isTeamLeader = profile.id === teamLeader;
      const roleTasks = ROLE_ACTION_ITEMS[profile.id] || [];
      const leaderTasks = isTeamLeader ? ROLE_ACTION_ITEMS.team_leader || [] : [];
      const combinedTasks = [...roleTasks, ...leaderTasks];

      // Reset state and avoid duplicates from local storage if any
      const initialItems = combinedTasks.map(task => ({
        id: `${profile.id}-${task}`,
        text: task,
        completed: false
      }));
      
      const storedItems = localStorage.getItem(`actionItems_${profile.id}`);
      if (storedItems) {
          const parsedStoredItems = JSON.parse(storedItems) as ActionItem[];
          // A simple merge: keep stored items if they exist in the initial template
          const merged = initialItems.map(item => {
              const stored = parsedStoredItems.find(s => s.id === item.id);
              return stored || item;
          });
           // Add any custom-added items from storage that are not in the template
          const customItems = parsedStoredItems.filter(s => !initialItems.some(i => i.id === s.id));
          setActionItems([...merged, ...customItems]);

      } else {
          setActionItems(initialItems);
      }
    }
  }, [profile, teamLeader]);

  useEffect(() => {
    if (profile?.id && actionItems.length > 0) {
      localStorage.setItem(`actionItems_${profile.id}`, JSON.stringify(actionItems));
    }
  }, [actionItems, profile]);


  const addActionItem = (text: string, roleId: string) => {
    const newItem: ActionItem = {
      id: new Date().toISOString(),
      text,
      completed: false,
      isCustom: true
    };
    setActionItems((prev) => [...prev, newItem]);
  };

  const toggleActionItem = (id: string) => {
    setActionItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };
  
  const removeActionItem = (id: string) => {
    setActionItems((prev) => prev.filter((item) => item.id !== id && item.isCustom));
  };


  return { actionItems, addActionItem, toggleActionItem, removeActionItem };
}

export function useCompetitorLog() {
  const [logEntries, setLogEntries] =
    useState<CompetitorLogEntry[]>(MOCK_COMPETITOR_LOG);

  const addLogEntry = (text: string, author: string) => {
    const newEntry: CompetitorLogEntry = {
      id: new Date().toISOString(),
      text,
      author,
      createdAt: new Date(),
    };
    setLogEntries((prev) => [newEntry, ...prev]);
  };

  return { logEntries, addLogEntry };
}
