
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import React, { useEffect } from "react";
import { AiCopilot } from "@/components/ai/ai-copilot";
import { ConfirmRoundStartDialog } from "@/components/game/confirm-round-start-dialog";
import { GoToCurrentTaskButton } from "@/context/task-navigation-context";
import { useTeamSettings } from "@/hooks/use-team-settings";
import { ShellLayout } from "@/components/layout/shell-layout";
import { resolveRoleMetadata } from "@/lib/firebase";

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

  const roleMetadata = profile
    ? resolveRoleMetadata(profile.id) ?? {
        id: profile.id,
        name: profile.name,
        description: undefined,
      }
    : null;

  return (
    <>
      <ShellLayout roleMetadata={roleMetadata}>{children}</ShellLayout>
      {isTeamLeader && <AiCopilot />}
      <ConfirmRoundStartDialog />
      <GoToCurrentTaskButton />
    </>
  );
}
