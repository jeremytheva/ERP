"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MainSidebar } from "@/components/layout/main-sidebar";
import { Header } from "@/components/layout/header";
import { AiCopilot } from "@/components/ai/ai-copilot";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return null; // Or a loading spinner, handled by AuthProvider for now
  }

  return (
    <SidebarProvider>
      <MainSidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
      <AiCopilot />
    </SidebarProvider>
  );
}
