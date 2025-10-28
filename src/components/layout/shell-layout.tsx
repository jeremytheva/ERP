"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ShellSidebar } from "@/components/layout/shell-sidebar";
import { Header } from "@/components/layout/header";
import { AiCopilot } from "@/components/ai/ai-copilot";
import { ConfirmRoundStartDialog } from "@/components/game/confirm-round-start-dialog";
import { GoToCurrentTaskButton } from "@/context/task-navigation-context";
import { useTeamSettings } from "@/hooks/use-team-settings";

interface ShellLayoutProps {
  role: string;
  children: React.ReactNode;
}

export function ShellLayout({ role, children }: ShellLayoutProps) {
  const { user, profile, loading } = useAuth();
  const { teamLeader } = useTeamSettings();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!loading && user && profile && profile.id !== role) {
      router.replace(`/app/role/${profile.id}`);
    }
  }, [loading, user, profile, role, router]);

  useEffect(() => {
    if (!loading && profile) {
      const basePath = `/app/role/${profile.id}`;
      if (pathname === basePath) {
        router.replace(`${basePath}/${profile.defaultComponent}`);
      }
    }
  }, [loading, profile, pathname, router]);

  if (loading || !user || !profile) {
    return null;
  }

  const isTeamLeader = profile.id === teamLeader;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <ShellSidebar role={role} />
        <div className="flex flex-1 flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto bg-muted/20 p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
      {isTeamLeader && <AiCopilot />}
      <ConfirmRoundStartDialog />
      <GoToCurrentTaskButton />
    </SidebarProvider>
  );
}
