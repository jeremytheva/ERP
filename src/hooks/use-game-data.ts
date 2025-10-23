"use client";

import { useState, useEffect } from "react";
import {
  INITIAL_GAME_STATE,
  MOCK_ACTION_ITEMS,
  MOCK_COMPETITOR_LOG,
} from "@/lib/mock-data";
import type { GameState, ActionItem, CompetitorLogEntry } from "@/types";

// In a real app, these hooks would use onSnapshot from Firestore for real-time updates.

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  // Mock real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
        setGameState(prev => {
            const change = (Math.random() - 0.5) * 100000;
            const newNetIncome = prev.netIncome + change;
            const newHistoryEntry = {
                round: prev.kpiHistory.length + 1,
                companyValuation: prev.companyValuation + change * 2,
                netIncome: newNetIncome,
                inventoryValue: prev.inventoryValue + (Math.random() - 0.5) * 50000,
                totalEmissions: prev.totalEmissions + (Math.random() - 0.5) * 10,
            };

            return {
                ...prev,
                companyValuation: newHistoryEntry.companyValuation,
                netIncome: newHistoryEntry.netIncome,
                inventoryValue: newHistoryEntry.inventoryValue,
                totalEmissions: newHistoryEntry.totalEmissions,
                kpiHistory: [...prev.kpiHistory, newHistoryEntry].slice(-10) // Keep last 10 rounds
            }
        })
    }, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);
  return { gameState };
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
