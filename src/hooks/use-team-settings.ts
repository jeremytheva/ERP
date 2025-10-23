
"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";

interface TeamSettingsContextType {
  teamLeader: string | null;
  setTeamLeader: (roleId: string) => void;
}

const TeamSettingsContext = createContext<TeamSettingsContextType | undefined>(undefined);

export const TeamSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [teamLeader, setTeamLeaderState] = useState<string | null>(null);
  
  useEffect(() => {
    const storedLeader = localStorage.getItem("teamLeader");
    if (storedLeader) {
      setTeamLeaderState(storedLeader);
    }
  }, []);

  const setTeamLeader = (roleId: string) => {
    localStorage.setItem("teamLeader", roleId);
    setTeamLeaderState(roleId);
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
