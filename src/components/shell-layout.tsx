"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon, Menu } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface ShellNavItem {
  title: string;
  href: string;
  icon?: LucideIcon;
  badge?: React.ReactNode;
}

export interface ShellLayoutProps {
  title: string;
  description?: string;
  navItems?: ShellNavItem[];
  actions?: React.ReactNode;
  children: React.ReactNode;
  aside?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function ShellLayout({
  title,
  description,
  navItems = [],
  actions,
  children,
  aside,
  footer,
  className,
}: ShellLayoutProps) {
  const pathname = usePathname();
  const actionItems = React.Children.toArray(actions);

  return (
    <SidebarProvider>
      <div className={cn("flex min-h-screen bg-muted/20 text-foreground", className)}>
        <Sidebar collapsible="icon">
          <SidebarHeader className="flex items-center justify-between gap-2 border-b border-border/60 px-4 py-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Menu className="h-5 w-5 text-muted-foreground" />
              <span>Roles</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            {navItems.length > 0 && (
              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Navigation
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname?.startsWith(item.href);

                      return (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton asChild data-active={isActive}>
                            <Link href={item.href} className="flex items-center gap-2">
                              {Icon && <Icon className="h-4 w-4" />}
                              <span className="truncate text-sm font-medium">{item.title}</span>
                              {item.badge}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <div className="flex min-h-screen flex-1 flex-col bg-background">
            <header className="sticky top-0 z-20 flex flex-col gap-4 border-b border-border/60 bg-background/95 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/75 md:px-6">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="md:hidden" />
                <div>
                  <h1 className="text-xl font-semibold tracking-tight md:text-2xl">{title}</h1>
                  {description && (
                    <p className="text-sm text-muted-foreground md:text-base">{description}</p>
                  )}
                </div>
                {actionItems.length > 0 && (
                  <div className="ml-auto flex flex-wrap items-center gap-2">
                    {actionItems.map((action, index) => (
                      <React.Fragment key={index}>{action}</React.Fragment>
                    ))}
                  </div>
                )}
              </div>
              <Separator className="hidden md:block" />
            </header>
            <div className={cn("flex flex-1 flex-col gap-6 p-4 md:p-6", aside && "lg:flex-row")}> 
              <div className={cn("flex-1 space-y-6", aside && "lg:pr-6")}>{children}</div>
              {aside && (
                <aside className="w-full lg:w-80 lg:flex-none">
                  <div className="sticky top-24 space-y-4">{aside}</div>
                </aside>
              )}
            </div>
            {footer && (
              <footer className="mt-auto border-t border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground md:px-6">
                {footer}
              </footer>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
