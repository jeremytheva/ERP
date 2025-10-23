"use client";

import { useState, useEffect, useCallback } from "react";
import {
  INITIAL_GAME_STATE,
  MOCK_ACTION_ITEMS,
  MOCK_COMPETITOR_LOG,
} from "@/lib/mock-data";
import type { GameState, ActionItem, CompetitorLogEntry, KpiHistoryEntry } from "@/types";

// In a real app, these hooks would use onSnapshot from Firestore for real-time updates.

const ROUND_DURATION_SECONDS = 300; // 5 minutes

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [roundTimeLeft, setRoundTimeLeft] = useState(ROUND_DURATION_SECONDS);
  const [isPaused, setIsPaused] = useState(false);

  const advanceRound = useCallback(() => {
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
    setRoundTimeLeft(ROUND_DURATION_SECONDS);
  }, []);

  useEffect(() => {
    if (isPaused) return;

    const timerInterval = setInterval(() => {
      setRoundTimeLeft(prev => {
        if (prev <= 1) {
          advanceRound();
          return ROUND_DURATION_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [isPaused, advanceRound]);

  const togglePause = () => {
    setIsPaused(prev => !prev);
  };

  const resetTimer = () => {
    setRoundTimeLeft(ROUND_DURATION_SECONDS);
  };
  
  const setRound = (newRound: number) => {
    if (newRound < 1) return;

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
     resetTimer();
  }


  return { gameState, roundTimeLeft, isPaused, togglePause, resetTimer, setRound };
}

export function useActionItems() {
  const [actionItems, setActionItems] =
    useState<ActionItem[]>(MOCK_ACTION_ITEMS);

  const addActionItem = (text: string) => {
    const newItem: ActionItem = {
      id: new Date().toISOString(),
      text,
      completed: false,
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
    setActionItems((prev) => prev.filter((item) => item.id !== id));
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
