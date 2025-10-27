
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import React, { useEffect, useMemo } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MainSidebar } from "@/components/layout/main-sidebar";
import { Header } from "@/components/layout/header";
import { AiCopilot } from "@/components/ai/ai-copilot";
import { ConfirmRoundStartDialog } from "@/components/game/confirm-round-start-dialog";
import { GoToCurrentTaskButton } from "@/context/task-navigation-context";
import { useTeamSettings } from "@/hooks/use-team-settings";
import { Loader2 } from "lucide-react";

const AUTH_ROUTES = ["/"];
const AUTH_ROUTE_PREFIXES = ["/auth"];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const { teamLeader } = useTeamSettings();
  const router = useRouter();
  const pathname = usePathname();

  const isTeamLeader = profile?.id === teamLeader;
  const isAuthRoute = useMemo(() => {
    if (!pathname) return false;

    const matchesExactRoute = AUTH_ROUTES.some((route) => pathname === route);
    if (matchesExactRoute) {
      return true;
    }

    return AUTH_ROUTE_PREFIXES.some((prefix) =>
      pathname === prefix || pathname.startsWith(`${prefix}/`)
    );
  }, [pathname]);

  useEffect(() => {
    if (!loading && !user && !isAuthRoute) {
      router.replace("/");
    }
  }, [user, loading, router, isAuthRoute]);

  if (isAuthRoute) {
    return <>{children}</>;
  }

  if (loading || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Checking authentication…</span>
        </div>
      </div>
    );
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
      {isTeamLeader && <AiCopilot />}
      <ConfirmRoundStartDialog />
      <GoToCurrentTaskButton />
    </SidebarProvider>
  );
}
