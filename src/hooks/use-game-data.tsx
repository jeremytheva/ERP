
"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";
import { doc, onSnapshot, writeBatch, FirestoreError } from "firebase/firestore";
import { useAuth } from "./use-auth";
import type { GameState, KpiHistoryEntry } from "@/types";
import { useFirestore, errorEmitter, FirestorePermissionError, useMemoFirebase } from "@/firebase";

const GAME_ID = "default_game"; // For now, we use a single game document

const INITIAL_GAME_STATE: GameState = {
  companyValuation: 50000000,
  netIncome: 0,
  inventoryValue: 0,
  cashBalance: 500000,
  grossMargin: 0,
  marketShare: 0,
  averageSellingPrice: 0,
  inventoryTurnover: 0,
  capacityUtilization: 0,
  averagePriceGap: 0,
  warehouseCosts: 0,
  onTimeDeliveryRate: 0,
  cumulativeCO2eEmissions: 0,
  competitorAvgPrice: 0,
  grossRevenue: 0,
  cogs: 0,
  sustainabilityInvestment: 0,
  teamStrategy: "Focus on high-margin products and expand market share in Europe.",
  kpiHistory: [
    { round: 1, companyValuation: 50000000, netIncome: 0, inventoryValue: 0, cumulativeCO2eEmissions: 0, cashBalance: 500000, grossMargin: 0, marketShare: 0, averageSellingPrice: 0, inventoryTurnover: 0, capacityUtilization: 0, averagePriceGap: 0, warehouseCosts: 0, onTimeDeliveryRate: 0, competitorAvgPrice: 0, grossRevenue: 0, cogs: 0, sustainabilityInvestment: 0 },
  ],
  timerState: {
    timeLeft: 1200,
    isPaused: true,
    isBreakActive: false,
    isBreakEnabled: true,
    roundDuration: 1200, // 20 minutes
    breakDuration: 300, // 5 minutes
    confirmNextRound: true,
  }
};


interface GameStateContextType {
  gameState: GameState;
  timeLeft: number;
  isPaused: boolean;
  isBreakActive: boolean;
  isAwaitingConfirmation: boolean;
  isBreakEnabled: boolean;
  roundDuration: number;
  breakDuration: number;
  confirmNextRound: boolean;
  togglePause: () => void;
  resetTimer: () => void;
  confirmAndAdvance: () => void;
  setRound: (newRound: number) => Promise<void>;
  setRoundDuration: (duration: number) => void;
  setBreakDuration: (duration: number) => void;
  setIsBreakEnabled: (enabled: boolean) => void;
  setConfirmNextRound: (enabled: boolean) => void;
  addKpiHistoryEntry: (data: Omit<KpiHistoryEntry, 'round'>) => Promise<void>;
}

const GameStateContext = createContext<GameStateContextType | undefined>(undefined);

export const GameStateProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const firestore = useFirestore();
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAwaitingConfirmation, setIsAwaitingConfirmation] = useState(false);

  const gameDocRef = useMemoFirebase(() => {
      if (!user || !firestore) return null;
      return doc(firestore, "games", GAME_ID);
  }, [user, firestore]);

  const {
    isPaused,
    isBreakActive,
    isBreakEnabled,
    roundDuration,
    breakDuration,
    confirmNextRound
  } = gameState.timerState || { 
    isPaused: true, 
    isBreakActive: false, 
    isBreakEnabled: true, 
    roundDuration: 1200, 
    breakDuration: 300,
    confirmNextRound: true
  };

  useEffect(() => {
    if (!gameDocRef) {
      setGameState(INITIAL_GAME_STATE);
      setTimeLeft(INITIAL_GAME_STATE.timerState.timeLeft);
      setIsLoading(false);
      return;
    };
    setIsLoading(true);

    const unsubscribe = onSnapshot(gameDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as GameState;
        // Ensure timerState has all properties
        const timerState = { ...INITIAL_GAME_STATE.timerState, ...data.timerState };
        const fullGameState = { ...INITIAL_GAME_STATE, ...data, timerState };
        setGameState(fullGameState);
        setTimeLeft(fullGameState.timerState.timeLeft);
      } else {
        // Initialize game document if it doesn't exist
        const batch = writeBatch(firestore);
        batch.set(gameDocRef, INITIAL_GAME_STATE);
        batch.commit().then(() => {
          setGameState(INITIAL_GAME_STATE);
          setTimeLeft(INITIAL_GAME_STATE.timerState.timeLeft);
        });
      }
      setIsLoading(false);
    },
    (error: FirestoreError) => {
        const contextualError = new FirestorePermissionError({
          path: gameDocRef.path,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', contextualError);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [gameDocRef, firestore]);
  
  const updateTimerState = async (updates: Partial<GameState["timerState"]>) => {
      if (!gameDocRef) return;
      const batch = writeBatch(firestore);
      const currentTimerState = gameState.timerState;
      batch.update(gameDocRef, { timerState: { ...currentTimerState, ...updates } });
      await batch.commit().catch(error => {
        const contextualError = new FirestorePermissionError({
            path: gameDocRef.path,
            operation: 'update',
            requestResourceData: { timerState: { ...currentTimerState, ...updates } },
        });
        errorEmitter.emit('permission-error', contextualError);
      });
  }

  const addKpiHistoryEntry = async (data: Omit<KpiHistoryEntry, 'round'>) => {
    if (!gameDocRef) return;
    const batch = writeBatch(firestore);

    const newRoundNumber = (gameState.kpiHistory[gameState.kpiHistory.length - 1]?.round || 0) + 1;
    const newHistoryEntry: KpiHistoryEntry = {
        ...INITIAL_GAME_STATE.kpiHistory[0], // Use initial state as a base for all fields
        ...data,
        round: newRoundNumber,
    };
    
    const newKpiHistory = [...gameState.kpiHistory, newHistoryEntry];
    
    batch.update(gameDocRef, {
        kpiHistory: newKpiHistory,
        // Also update top-level KPIs to reflect the latest entry
        companyValuation: newHistoryEntry.companyValuation,
        netIncome: newHistoryEntry.netIncome,
        cashBalance: newHistoryEntry.cashBalance,
        marketShare: newHistoryEntry.marketShare,
        averageSellingPrice: newHistoryEntry.averageSellingPrice,
        competitorAvgPrice: newHistoryEntry.competitorAvgPrice,
        cumulativeCO2eEmissions: newHistoryEntry.cumulativeCO2eEmissions,
        warehouseCosts: newHistoryEntry.warehouseCosts
    });

    await batch.commit().catch(error => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: gameDocRef.path,
          operation: 'update',
          requestResourceData: { kpiHistory: newKpiHistory },
      }));
    });
  };

  const handleRoundEnd = () => {
    if (confirmNextRound) {
        setIsAwaitingConfirmation(true);
        updateTimerState({ isPaused: true }); // Pause timer while waiting
    } else {
        confirmAndAdvance();
    }
  };

  const confirmAndAdvance = () => {
    setIsAwaitingConfirmation(false);
    if (isBreakActive) {
        advanceRound();
    } else if (isBreakEnabled) {
        startBreak();
    } else {
        advanceRound();
    }
  };

  const advanceRound = useCallback(async () => {
    if (!gameDocRef) return;
    const batch = writeBatch(firestore);

    const lastRound = gameState.kpiHistory[gameState.kpiHistory.length - 1];
    const change = (Math.random() - 0.5) * 100000;
    const newNetIncome = lastRound.netIncome + change;
    const newHistoryEntry: KpiHistoryEntry = {
        ...lastRound,
        round: lastRound.round + 1,
        companyValuation: lastRound.companyValuation + change * 2,
        netIncome: newNetIncome,
        inventoryValue: lastRound.inventoryValue + (Math.random() - 0.5) * 50000,
    };

    const newKpiHistory = [...gameState.kpiHistory, newHistoryEntry].slice(-10);
    const latestKpis = newKpiHistory[newKpiHistory.length - 1];
    
    batch.update(gameDocRef, {
        companyValuation: latestKpis.companyValuation,
        netIncome: latestKpis.netIncome,
        inventoryValue: latestKpis.inventoryValue,
        kpiHistory: newKpiHistory,
        'timerState.isBreakActive': false,
        'timerState.timeLeft': roundDuration,
        'timerState.isPaused': false,
    });
    
    await batch.commit();

  }, [gameState, roundDuration, firestore, gameDocRef]);

  const startBreak = useCallback(async () => {
    await updateTimerState({ isBreakActive: true, timeLeft: breakDuration, isPaused: false });
  }, [breakDuration]);

  useEffect(() => {
    if (isPaused || isLoading || !firestore) return;

    const timerInterval = setInterval(() => {
        setTimeLeft(prev => {
            const newTime = prev - 1;
            if (newTime <= 0) {
                 handleRoundEnd();
                 return 0;
            }
             if (newTime % 5 === 0) { // Update Firestore every 5 seconds
                updateTimerState({ timeLeft: newTime });
            }
            return newTime;
        });
    }, 1000);

    return () => clearInterval(timerInterval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaused, isLoading, firestore]);

  const togglePause = () => {
    if(isAwaitingConfirmation) return; // Don't allow play/pause during confirmation
    updateTimerState({ isPaused: !isPaused });
  };
  
  const resetTimer = () => {
    if(isAwaitingConfirmation) return;
    const newTimeLeft = isBreakActive ? breakDuration : roundDuration;
    updateTimerState({ timeLeft: newTimeLeft });
  };

  const setRound = async (newRound: number) => {
    if (newRound < 1 || !gameDocRef) return;
    
    const batch = writeBatch(firestore);

    let newKpiHistory: KpiHistoryEntry[];
    const currentRound = gameState.kpiHistory.length > 0 ? gameState.kpiHistory[gameState.kpiHistory.length - 1].round : 0;

    if (newRound > currentRound) {
        newKpiHistory = [...gameState.kpiHistory];
        for (let i = currentRound; i < newRound; i++) {
            const lastRound = newKpiHistory[newKpiHistory.length - 1];
            const change = (Math.random() - 0.5) * 100000;
            const newNetIncome = lastRound.netIncome + change;
            const newHistoryEntry: KpiHistoryEntry = {
                ...lastRound,
                round: lastRound.round + 1,
                companyValuation: lastRound.companyValuation + change * 2,
                netIncome: newNetIncome,
            };
            newKpiHistory.push(newHistoryEntry);
        }
    } else {
        if (newRound === 0) {
            batch.set(gameDocRef, INITIAL_GAME_STATE);
            await batch.commit();
            return;
        }
        newKpiHistory = gameState.kpiHistory.filter(entry => entry.round <= newRound);
    }
    
    const latestKpis = newKpiHistory.length > 0 ? newKpiHistory[newKpiHistory.length - 1] : INITIAL_GAME_STATE.kpiHistory[0];
    
    // Preserve settings when changing rounds
    const currentTimerState = gameState.timerState;
    const newTimerState = {
        ...currentTimerState,
        isBreakActive: false,
        timeLeft: currentTimerState.roundDuration,
    };

    batch.update(gameDocRef, {
        ...latestKpis,
        kpiHistory: newKpiHistory.slice(-10),
        timerState: newTimerState,
    });
    
    await batch.commit();
  }
  
  const value = {
      gameState: isLoading ? INITIAL_GAME_STATE : gameState, // Provide initial state while loading
      timeLeft,
      isPaused,
      isBreakActive,
      isAwaitingConfirmation,
      isBreakEnabled,
      roundDuration,
      breakDuration,
      confirmNextRound,
      togglePause,
      resetTimer,
      confirmAndAdvance,
      setRound,
      setRoundDuration: (duration: number) => updateTimerState({ roundDuration: duration, timeLeft: duration }),
      setBreakDuration: (duration: number) => updateTimerState({ breakDuration: duration }),
      setIsBreakEnabled: (enabled: boolean) => updateTimerState({ isBreakEnabled: enabled }),
      setConfirmNextRound: (enabled: boolean) => updateTimerState({ confirmNextRound: enabled }),
      addKpiHistoryEntry,
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

