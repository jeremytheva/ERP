
"use client";

import { useState, useEffect, createContext, useContext, ReactNode, useMemo, useCallback } from "react";
import { doc, onSnapshot, setDoc, FirestoreError } from "firebase/firestore";
import { useAuth as useAppContextAuth } from "./use-auth";
import { useFirestore, errorEmitter, FirestorePermissionError, useMemoFirebase } from "@/firebase";
import { USER_PROFILES } from "./use-user-profiles";
import type { Role } from "@/types";

const SETTINGS_ID = "default_settings";
export const TEAM_LEADER_ROLE_ID = "team-leader";

const ROLE_ID_TO_ROLE: Record<string, Role> = {
  procurement: "Procurement",
  production: "Production",
  logistics: "Logistics",
  sales: "Sales",
  [TEAM_LEADER_ROLE_ID]: "Team Leader",
};

const DEFAULT_VISIBLE_ROLE_IDS = USER_PROFILES.map((profile) => profile.id);

interface TeamSettingsContextType {
  visibleRoleIds: string[];
  visibleRoles: Role[];
  isRoleVisible: (roleId: string) => boolean;
  setRoleVisibility: (roleId: string, isVisible: boolean) => void;
  teamLeader: string | null;
  setTeamLeader: (roleId: string | null) => void;
}

const TeamSettingsContext = createContext<TeamSettingsContextType | undefined>(undefined);

export const TeamSettingsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAppContextAuth();
  const firestore = useFirestore();
  const [visibleRoleIds, setVisibleRoleIds] = useState<string[]>(DEFAULT_VISIBLE_ROLE_IDS);
  const [teamLeader, setTeamLeaderState] = useState<string | null>(null);

  const settingsDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, "settings", SETTINGS_ID);
  }, [user, firestore]);

  useEffect(() => {
    if (!settingsDocRef) return;

    const unsubscribe = onSnapshot(settingsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const storedRoles = data.visibleRoleIds as string[] | undefined;
        if (storedRoles && Array.isArray(storedRoles)) {
          setVisibleRoleIds(storedRoles);
        } else {
          setVisibleRoleIds(DEFAULT_VISIBLE_ROLE_IDS);
        }
        setTeamLeaderState((data.teamLeader as string | null | undefined) ?? null);
      } else {
        // Initialize settings document if it doesn't exist
        const data = { visibleRoleIds: DEFAULT_VISIBLE_ROLE_IDS, teamLeader: null };
        setVisibleRoleIds(data.visibleRoleIds);
        setTeamLeaderState(data.teamLeader);
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
        setVisibleRoleIds(DEFAULT_VISIBLE_ROLE_IDS);
        setTeamLeaderState(null);
    });

    return () => unsubscribe();
  }, [settingsDocRef]);

  const persistRoleIds = useCallback((roleIds: string[]) => {
    if (!settingsDocRef) return;
    const data = { visibleRoleIds: roleIds };
    setDoc(settingsDocRef, data, { merge: true }).catch(error => {
        const contextualError = new FirestorePermissionError({
            path: settingsDocRef.path,
            operation: 'update',
            requestResourceData: data,
        });
        errorEmitter.emit('permission-error', contextualError);
    });
  }, [settingsDocRef]);

  const setRoleVisibility = useCallback((roleId: string, isVisible: boolean) => {
    setVisibleRoleIds((current) => {
      const hasRole = current.includes(roleId);
      let nextRoles: string[];

      if (isVisible && !hasRole) {
        nextRoles = [...current, roleId];
      } else if (!isVisible && hasRole) {
        nextRoles = current.filter((id) => id !== roleId);
      } else {
        return current;
      }

      persistRoleIds(nextRoles);
      return nextRoles;
    });
  }, [persistRoleIds]);

  const setTeamLeader = useCallback((roleId: string | null) => {
    setTeamLeaderState(roleId);
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
  }, [settingsDocRef]);

  const visibleRoles = useMemo(() => {
    return visibleRoleIds
      .map((roleId) => ROLE_ID_TO_ROLE[roleId])
      .filter((role): role is Role => Boolean(role));
  }, [visibleRoleIds]);

  const isRoleVisible = useCallback((roleId: string) => visibleRoleIds.includes(roleId), [visibleRoleIds]);

  return (
    <TeamSettingsContext.Provider value={{ visibleRoleIds, visibleRoles, isRoleVisible, setRoleVisibility, teamLeader, setTeamLeader }}>
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
