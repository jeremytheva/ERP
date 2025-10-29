
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import React, { useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MainSidebar } from "@/components/layout/main-sidebar";
import { Header } from "@/components/layout/header";
import { CopilotChatWindow } from "@/components/ai/copilot-chat-window";
import { ConfirmRoundStartDialog } from "@/components/game/confirm-round-start-dialog";
import { GoToCurrentTaskButton } from "@/context/task-navigation-context";
import { useTeamSettings } from "@/hooks/use-team-settings";

const AUTH_PAGES = ["/"]; // Add any other auth-related pages here

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const { teamLeader } = useTeamSettings();
  const router = useRouter();
  const pathname = usePathname();

  const isTeamLeader = profile?.id === teamLeader;

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
    <SidebarProvider>
      <div className="flex min-h-screen">
        <MainSidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-muted/20">
            {children}
          </main>
        </div>
      </div>
      {isTeamLeader && <CopilotChatWindow />}
      <ConfirmRoundStartDialog />
      <GoToCurrentTaskButton />
    </SidebarProvider>
  );
}
