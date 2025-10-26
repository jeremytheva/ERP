
"use client";

import { FirebaseClientProvider } from "@/firebase/client-provider";
import { AuthProvider } from "@/context/auth-context";
import { UserProfilesProvider } from "@/hooks/use-user-profiles";
import { TeamSettingsProvider } from "@/hooks/use-team-settings";
import { GameStateProvider } from "@/hooks/use-game-data";
import { TasksProvider } from "@/hooks/use-tasks";
import { CompetitorLogProvider } from "@/hooks/use-competitor-log";
import { TaskNavigationProvider } from "@/context/task-navigation-context";
import { Toaster } from "@/components/ui/toaster";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseClientProvider>
      <UserProfilesProvider>
        <AuthProvider>
          <TeamSettingsProvider>
            <GameStateProvider>
              <TasksProvider>
                <TaskNavigationProvider>
                    <CompetitorLogProvider>
                      {children}
                      <Toaster />
                    </CompetitorLogProvider>
                </TaskNavigationProvider>
              </TasksProvider>
            </GameStateProvider>
          </TeamSettingsProvider>
        </AuthProvider>
      </UserProfilesProvider>
    </FirebaseClientProvider>
  );
}
