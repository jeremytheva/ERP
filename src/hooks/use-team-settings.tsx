"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./use-auth";

const SETTINGS_ID = "default_settings";

interface TeamSettingsContextType {
  teamLeader: string | null;
  setTeamLeader: (roleId: string) => void;
}

const TeamSettingsContext = createContext<TeamSettingsContextType | undefined>(undefined);

export const TeamSettingsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [teamLeader, setTeamLeaderState] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const settingsDocRef = doc(db, "settings", SETTINGS_ID);

    const unsubscribe = onSnapshot(settingsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setTeamLeaderState(docSnap.data().teamLeader || null);
      } else {
        setDoc(settingsDocRef, { teamLeader: null });
      }
    });

    return () => unsubscribe();
  }, [user]);

  const setTeamLeader = (roleId: string) => {
    if (!user) return;
    const settingsDocRef = doc(db, "settings", SETTINGS_ID);
    setDoc(settingsDocRef, { teamLeader: roleId }, { merge: true });
  };

  return (
    <TeamSettingsContext.Provider value={{ teamLeader, setTeamLeader }}>
      {children}
    </TeamSettingsContext.Provider>
  );
};

export const useTeamSettings = () => {
  const context = useContext(TeamSettingsContext);
  if (context === undefined) {
    throw new Error("useTeamSettings must be used within a TeamSettingsProvider");
  }
  return context;
};
