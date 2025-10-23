
"use client";

import { FirebaseClientProvider } from "@/firebase/client-provider";
import { AuthProvider } from "@/context/auth-context";
import { UserProfilesProvider } from "@/hooks/use-user-profiles";
import { TeamSettingsProvider } from "@/hooks/use-team-settings";
import { GameStateProvider } from "@/hooks/use-game-data";
import { TasksProvider } from "@/hooks/use-tasks";
import { CompetitorLogProvider } from "@/hooks/use-competitor-log";
import { Toaster } from "@/components/ui/toaster";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseClientProvider>
      <AuthProvider>
        <UserProfilesProvider>
          <TeamSettingsProvider>
            <GameStateProvider>
              <TasksProvider>
                <CompetitorLogProvider>
                  {children}
                  <Toaster />
                </CompetitorLogProvider>
              </TasksProvider>
            </GameStateProvider>
          </TeamSettingsProvider>
        </UserProfilesProvider>
      </AuthProvider>
    </FirebaseClientProvider>
  );
}
