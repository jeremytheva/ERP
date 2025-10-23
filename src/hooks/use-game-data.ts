"use client";

import { useState, useEffect } from "react";
import {
  INITIAL_GAME_STATE,
  MOCK_ACTION_ITEMS,
  MOCK_COMPETITOR_LOG,
} from "@/lib/mock-data";
import type { GameState, ActionItem, CompetitorLogEntry } from "@/types";

// In a real app, these hooks would use onSnapshot from Firestore for real-time updates.

const ROUND_DURATION_SECONDS = 300; // 5 minutes

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [roundTimeLeft, setRoundTimeLeft] = useState(ROUND_DURATION_SECONDS);

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setRoundTimeLeft(prev => {
        if (prev <= 1) {
          // Reset timer and advance round
          setGameState(prevGameState => {
              const change = (Math.random() - 0.5) * 100000;
              const newNetIncome = prevGameState.netIncome + change;
              const newHistoryEntry = {
                  round: prevGameState.kpiHistory.length + 1,
                  companyValuation: prevGameState.companyValuation + change * 2,
                  netIncome: newNetIncome,
                  inventoryValue: prevGameState.inventoryValue + (Math.random() - 0.5) * 50000,
                  totalEmissions: prevGameState.totalEmissions + (Math.random() - 0.5) * 10,
              };

              return {
                  ...prevGameState,
                  companyValuation: newHistoryEntry.companyValuation,
                  netIncome: newHistoryEntry.netIncome,
                  inventoryValue: newHistoryEntry.inventoryValue,
                  totalEmissions: newHistoryEntry.totalEmissions,
                  kpiHistory: [...prevGameState.kpiHistory, newHistoryEntry].slice(-10)
              }
          });
          return ROUND_DURATION_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  return { gameState, roundTimeLeft };
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
