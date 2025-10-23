
"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";
import { doc, onSnapshot, writeBatch } from "firebase/firestore";
import { useAuth } from "./use-auth";
import type { GameState, KpiHistoryEntry } from "@/types";
import { INITIAL_GAME_STATE } from "@/lib/mock-data";
import { useFirestore } from "@/firebase";

const GAME_ID = "default_game"; // For now, we use a single game document

interface GameStateContextType {
  gameState: GameState;
  timeLeft: number;
  isPaused: boolean;
  isBreakActive: boolean;

  isBreakEnabled: boolean;
  roundDuration: number;
  breakDuration: number;
  togglePause: () => void;
  resetTimer: () => void;
  setRound: (newRound: number) => Promise<void>;
  setRoundDuration: (duration: number) => void;
  setBreakDuration: (duration: number) => void;
  setIsBreakEnabled: (enabled: boolean) => void;
}

const GameStateContext = createContext<GameStateContextType | undefined>(undefined);

export const GameStateProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const firestore = useFirestore();
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const {
    isPaused,
    isBreakActive,
    isBreakEnabled,
    roundDuration,
    breakDuration
  } = gameState.timerState || { isPaused: true, isBreakActive: false, isBreakEnabled: true, roundDuration: 1200, breakDuration: 300 };

  useEffect(() => {
    if (!user || !firestore) {
      setGameState(INITIAL_GAME_STATE);
      setTimeLeft(INITIAL_GAME_STATE.timerState.timeLeft);
      setIsLoading(false);
      return;
    };
    setIsLoading(true);
    const gameDocRef = doc(firestore, "games", GAME_ID);

    const unsubscribe = onSnapshot(gameDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as GameState;
        setGameState(data);
        setTimeLeft(data.timerState.timeLeft);
      } else {
        // Initialize game document if it doesn't exist
        const batch = writeBatch(firestore);
        batch.set(gameDocRef, INITIAL_GAME_STATE);
        batch.commit().then(() => setGameState(INITIAL_GAME_STATE));
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, firestore]);
  
  const updateTimerState = async (updates: Partial<GameState["timerState"]>) => {
      if (!firestore) return;
      const gameDocRef = doc(firestore, "games", GAME_ID);
      const batch = writeBatch(firestore);
      const currentTimerState = gameState.timerState;
      batch.update(gameDocRef, { timerState: { ...currentTimerState, ...updates } });
      await batch.commit();
  }

  const advanceRound = useCallback(async () => {
    if (!firestore) return;
    const gameDocRef = doc(firestore, "games", GAME_ID);
    const batch = writeBatch(firestore);

    const lastRound = gameState.kpiHistory[gameState.kpiHistory.length - 1];
    const change = (Math.random() - 0.5) * 100000;
    const newNetIncome = lastRound.netIncome + change;
    const newHistoryEntry: KpiHistoryEntry = {
        round: lastRound.round + 1,
        companyValuation: lastRound.companyValuation + change * 2,
        netIncome: newNetIncome,
        inventoryValue: lastRound.inventoryValue + (Math.random() - 0.5) * 50000,
        totalEmissions: Math.max(0, lastRound.totalEmissions + (Math.random() - 0.5) * 10),
    };

    const newKpiHistory = [...gameState.kpiHistory, newHistoryEntry].slice(-10);
    const latestKpis = newKpiHistory[newKpiHistory.length - 1];
    
    batch.update(gameDocRef, {
        companyValuation: latestKpis.companyValuation,
        netIncome: latestKpis.netIncome,
        inventoryValue: latestKpis.inventoryValue,
        totalEmissions: latestKpis.totalEmissions,
        kpiHistory: newKpiHistory,
        'timerState.isBreakActive': false,
        'timerState.timeLeft': roundDuration,
    });
    
    await batch.commit();

  }, [gameState, roundDuration, firestore]);

  const startBreak = useCallback(async () => {
    await updateTimerState({ isBreakActive: true, timeLeft: breakDuration });
  }, [breakDuration]);

  useEffect(() => {
    if (isPaused || isLoading || !firestore) return;

    const timerInterval = setInterval(() => {
        setTimeLeft(prev => {
            const newTime = prev - 1;
            if (newTime <= 0) {
                 if (isBreakActive) {
                    advanceRound();
                } else if (isBreakEnabled) {
                    startBreak();
                } else {
                    advanceRound();
                }
                return 0;
            }
             if (newTime % 5 === 0) { // Update Firestore every 5 seconds
                updateTimerState({ timeLeft: newTime });
            }
            return newTime;
        });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [isPaused, isBreakActive, isBreakEnabled, isLoading, advanceRound, startBreak, firestore]);

  const togglePause = () => {
    updateTimerState({ isPaused: !isPaused });
  };
  
  const resetTimer = () => {
    const newTimeLeft = isBreakActive ? breakDuration : roundDuration;
    updateTimerState({ timeLeft: newTimeLeft });
  };

  const setRound = async (newRound: number) => {
    if (newRound < 1 || !firestore) return;
    
    const gameDocRef = doc(firestore, "games", GAME_ID);
    const batch = writeBatch(firestore);

    let newKpiHistory: KpiHistoryEntry[];
    const currentRound = gameState.kpiHistory[gameState.kpiHistory.length - 1].round;

    if (newRound > currentRound) {
        newKpiHistory = [...gameState.kpiHistory];
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
    } else {
         // Reset to round 1 means resetting the whole game state
        if (newRound === 1) {
            batch.set(gameDocRef, INITIAL_GAME_STATE);
            await batch.commit();
            return;
        }
        newKpiHistory = gameState.kpiHistory.filter(entry => entry.round <= newRound);
    }
    
    const latestKpis = newKpiHistory[newKpiHistory.length - 1];

    batch.update(gameDocRef, {
        companyValuation: latestKpis.companyValuation,
        netIncome: latestKpis.netIncome,
        inventoryValue: latestKpis.inventoryValue,
        totalEmissions: latestKpis.totalEmissions,
        kpiHistory: newKpiHistory.slice(-10),
        'timerState.isBreakActive': false,
        'timerState.timeLeft': roundDuration,
    });
    
    await batch.commit();
  }
  
  const value = {
      gameState: isLoading ? INITIAL_GAME_STATE : gameState, // Provide initial state while loading
      timeLeft,
      isPaused,
      isBreakActive,
      isBreakEnabled,
      roundDuration,
      breakDuration,
      togglePause,
      resetTimer,
      setRound,
      setRoundDuration: (duration: number) => updateTimerState({ roundDuration: duration, timeLeft: duration }),
      setBreakDuration: (duration: number) => updateTimerState({ breakDuration: duration }),
      setIsBreakEnabled: (enabled: boolean) => updateTimerState({ isBreakEnabled: enabled }),
  };

  return (
    <GameStateContext.Provider value={value}>
        {children}
    </GameStateContext.Provider>
  )
};

export const useGameState = () => {
  const context = useContext(GameStateContext);
  if (context === undefined) {
    throw new Error("useGameState must be used within a GameStateProvider");
  }
  return context;
};
