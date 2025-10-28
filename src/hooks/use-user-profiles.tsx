
"use client";

import { createContext, useContext, ReactNode, useMemo } from "react";
import type { UserProfile } from "@/types";
import { ROLE_PROFILES } from "@/lib/firebase/firestore-schema";

interface UserProfilesContextType {
  profiles: UserProfile[];
  loading: boolean;
}

const UserProfilesContext = createContext<UserProfilesContextType | undefined>(undefined);

export const UserProfilesProvider = ({ children }: { children: ReactNode }) => {
  const value = useMemo(() => ({
    profiles: ROLE_PROFILES,
    loading: false,
  }), []);

  return (
    <UserProfilesContext.Provider value={value}>{children}</UserProfilesContext.Provider>
  );
};

export const useUserProfiles = () => {
  const context = useContext(UserProfilesContext);
  if (context === undefined) {
    throw new Error("useUserProfiles must be used within a UserProfilesProvider");
  }
  return context;
};
