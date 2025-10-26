
"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { doc, onSnapshot, setDoc, FirestoreError } from "firebase/firestore";
import { useAuth } from "./use-auth";
import { useFirestore, errorEmitter, FirestorePermissionError, useMemoFirebase } from "@/firebase";

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

  const settingsDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, "settings", SETTINGS_ID);
  }, [user, firestore]);

  useEffect(() => {
    if (!settingsDocRef) return;

    const unsubscribe = onSnapshot(settingsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setTeamLeaderState(docSnap.data().teamLeader || null);
      } else {
        // Initialize settings document if it doesn't exist
        const data = { teamLeader: null };
        setDoc(settingsDocRef, data).catch(error => {
            const contextualError = new FirestorePermissionError({
                path: settingsDocRef.path,
                operation: 'create',
                requestResourceData: data,
            });
            errorEmitter.emit('permission-error', contextualError);
        });
      }
    },
    (error: FirestoreError) => {
        const contextualError = new FirestorePermissionError({
            path: settingsDocRef.path,
            operation: 'get',
        });
        errorEmitter.emit('permission-error', contextualError);
    });

    return () => unsubscribe();
  }, [settingsDocRef]);

  const setTeamLeader = (roleId: string) => {
    if (!settingsDocRef) return;
    const data = { teamLeader: roleId };
    setDoc(settingsDocRef, data, { merge: true }).catch(error => {
        const contextualError = new FirestorePermissionError({
            path: settingsDocRef.path,
            operation: 'update',
            requestResourceData: data,
        });
        errorEmitter.emit('permission-error', contextualError);
    });
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
