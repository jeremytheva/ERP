
"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { useAuth } from "./use-auth";
import { useFirestore } from "@/firebase";

const SETTINGS_ID = "default_settings";

interface TeamSettingsContextType {
  teamLeader: string | null;
  setTeamLeader: (roleId: string) => void;
}

const TeamSettingsContext = createContext<TeamSettingsContextType | undefined>(undefined);

export const TeamSettingsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const firestore = useFirestore();
  const [teamLeader, setTeamLeaderState] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !firestore) return;
    const settingsDocRef = doc(firestore, "settings", SETTINGS_ID);

    const unsubscribe = onSnapshot(settingsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setTeamLeaderState(docSnap.data().teamLeader || null);
      } else {
        setDoc(settingsDocRef, { teamLeader: null });
      }
    });

    return () => unsubscribe();
  }, [user, firestore]);

  const setTeamLeader = (roleId: string) => {
    if (!user || !firestore) return;
    const settingsDocRef = doc(firestore, "settings", SETTINGS_ID);
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
