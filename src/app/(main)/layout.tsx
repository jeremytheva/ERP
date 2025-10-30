
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import React, { useEffect } from "react";
import { Header } from "@/components/layout/header";
import { AiCopilot } from "@/components/ai/ai-copilot";
import { ConfirmRoundStartDialog } from "@/components/game/confirm-round-start-dialog";
import { GoToCurrentTaskButton } from "@/context/task-navigation-context";
import { useTeamSettings, TEAM_LEADER_ROLE_ID } from "@/hooks/use-team-settings";

const AUTH_PAGES = ["/"]; // Add any other auth-related pages here

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { isRoleVisible } = useTeamSettings();
  const router = useRouter();
  const pathname = usePathname();

  const showTeamLeaderTools = isRoleVisible(TEAM_LEADER_ROLE_ID);

  useEffect(() => {
    if (!loading && !user && !AUTH_PAGES.includes(pathname)) {
      router.push("/");
    }
  }, [user, loading, router, pathname]);

  if (AUTH_PAGES.includes(pathname)) {
    return <>{children}</>;
  }

  if (loading || !user) {
    return null; // Or a loading spinner, handled by AuthProvider for now
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <Header />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        {children}
      </main>
      {showTeamLeaderTools && <AiCopilot />}
      <ConfirmRoundStartDialog />
      <GoToCurrentTaskButton />
    </div>
  );
}
