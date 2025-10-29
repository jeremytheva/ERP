
"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { doc, onSnapshot, setDoc, FirestoreError } from "firebase/firestore";
import { useAuth as useAppContextAuth } from "./use-auth";
import { useFirestore, errorEmitter, FirestorePermissionError, useMemoFirebase } from "@/firebase";

const SETTINGS_ID = "default_settings";

interface TeamSettingsContextType {
  teamLeader: string | null;
  setTeamLeader: (roleId: string) => void;
  aiSuggestionsEnabled: boolean;
  setAiSuggestionsEnabled: (enabled: boolean) => void;
}

const TeamSettingsContext = createContext<TeamSettingsContextType | undefined>(undefined);

export const TeamSettingsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAppContextAuth();
  const firestore = useFirestore();
  const [teamLeader, setTeamLeaderState] = useState<string | null>(null);
  const [aiSuggestionsEnabled, setAiSuggestionsEnabledState] = useState(true);

  const settingsDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, "settings", SETTINGS_ID);
  }, [user, firestore]);

  useEffect(() => {
    if (!settingsDocRef) return;

    const unsubscribe = onSnapshot(settingsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTeamLeaderState(data.teamLeader || null);
        setAiSuggestionsEnabledState(
          data.aiSuggestionsEnabled !== undefined ? Boolean(data.aiSuggestionsEnabled) : true,
        );
      } else {
        // Initialize settings document if it doesn't exist
        const data = { teamLeader: null, aiSuggestionsEnabled: true };
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

  const setAiSuggestionsEnabled = (enabled: boolean) => {
    if (!settingsDocRef) return;
    const data = { aiSuggestionsEnabled: enabled };
    const previousValue = aiSuggestionsEnabled;
    setAiSuggestionsEnabledState(enabled);
    setDoc(settingsDocRef, data, { merge: true }).catch(error => {
      const contextualError = new FirestorePermissionError({
        path: settingsDocRef.path,
        operation: 'update',
        requestResourceData: data,
      });
      errorEmitter.emit('permission-error', contextualError);
      // Revert local state if the update fails to keep UI consistent.
      setAiSuggestionsEnabledState(previousValue);
    });
  };

  return (
    <TeamSettingsContext.Provider
      value={{ teamLeader, setTeamLeader, aiSuggestionsEnabled, setAiSuggestionsEnabled }}
    >
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
