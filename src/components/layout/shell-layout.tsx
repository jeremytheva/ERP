"use client";

import type { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MainSidebar } from "@/components/layout/main-sidebar";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RoleMetadata } from "@/lib/firebase";

export interface ShellLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  header?: ReactNode;
  className?: string;
  contentClassName?: string;
  roleMetadata?: RoleMetadata | null;
  footer?: ReactNode;
}

export function ShellLayout({
  children,
  sidebar,
  header,
  className,
  contentClassName,
  roleMetadata,
  footer,
}: ShellLayoutProps) {
  return (
    <SidebarProvider>
      <div className={cn("flex min-h-screen bg-muted/20", className)}>
        {sidebar ?? <MainSidebar />}
        <div className="flex flex-1 flex-col">
          {header ?? <Header />}
          {roleMetadata ? (
            <section className="border-b bg-background px-4 py-3 md:px-6">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Role Overview
                  </p>
                  <h2 className="text-lg font-semibold leading-none">
                    {roleMetadata.name}
                  </h2>
                  {roleMetadata.description ? (
                    <p className="text-sm text-muted-foreground">
                      {roleMetadata.description}
                    </p>
                  ) : null}
                </div>
                {roleMetadata.focusAreas?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {roleMetadata.focusAreas.map((area) => (
                      <Badge key={area} variant="outline" className="rounded-full">
                        {area}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}
          <main className={cn("flex-1 overflow-y-auto px-4 py-6 md:px-6 lg:px-8", contentClassName)}>
            {children}
          </main>
          {footer ? <div className="border-t bg-background px-4 py-3 md:px-6">{footer}</div> : null}
        </div>
      </div>
    </SidebarProvider>
  );
}
