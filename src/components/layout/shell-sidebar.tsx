"use client";

import { useMemo } from "react";
import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Bot,
  LayoutDashboard,
  BarChart2,
  FileText,
  ShoppingCart,
  Factory,
  Truck,
  Lightbulb,
  Users,
  Database,
  Settings,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { RoleComponentId } from "@/lib/firebase/firestore-schema";

const NAVIGATION_COMPONENTS: Record<
  Exclude<RoleComponentId, "settings">,
  { segment: string; label: string; icon: ComponentType<{ className?: string }> }
> = {
  dashboard: { segment: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  "key-metrics": { segment: "key-metrics", label: "Key Metrics", icon: BarChart2 },
  "live-inventory": { segment: "live-inventory", label: "Inventory/Stock Status (LIT)", icon: FileText },
  procurement: { segment: "procurement", label: "Sourcing & Ordering", icon: ShoppingCart },
  production: { segment: "production", label: "Production Planning", icon: Factory },
  logistics: { segment: "logistics", label: "Liquidity & Transfers", icon: Truck },
  sales: { segment: "sales", label: "Market Analysis (ZMARKET)", icon: BarChart2 },
  debriefing: { segment: "debriefing", label: "Investment Decisions", icon: FileText },
  "scenario-planning": { segment: "scenario-planning", label: "Marketing (ZADS)", icon: Factory },
  "strategic-advisor": { segment: "strategic-advisor", label: "Analysis & Strategy", icon: Lightbulb },
  "competitor-log": { segment: "competitor-log", label: "Competitor Log", icon: Users },
  "master-data": { segment: "master-data", label: "Master Data", icon: Database },
};

interface ShellSidebarProps {
  role: string;
}

export function ShellSidebar({ role }: ShellSidebarProps) {
  const pathname = usePathname();
  const { profile } = useAuth();

  const basePath = `/app/role/${role}`;

  const items = useMemo(() => {
    if (!profile) return [];
    return profile.permittedComponents
      .filter((component): component is Exclude<RoleComponentId, "settings"> => component !== "settings" && component in NAVIGATION_COMPONENTS)
      .map((component) => NAVIGATION_COMPONENTS[component]);
  }, [profile]);

  const hasSettings = profile?.permittedComponents.includes("settings");

  const isActive = (segment: string) => {
    const href = `${basePath}/${segment}`;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const settingsActive = hasSettings && pathname.startsWith(`${basePath}/settings`);

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-10 w-10 text-primary" asChild>
            <Link href={`${basePath}/${profile?.defaultComponent ?? "dashboard"}`}>
              <Bot size={24} />
            </Link>
          </Button>
          <span className="font-semibold text-lg font-headline">ERPsim</span>
        </div>
        <SidebarTrigger className="hidden md:flex" />
      </SidebarHeader>
      <SidebarMenu className="flex-1 p-2">
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          {items.map(({ segment, label, icon: Icon }) => (
            <SidebarMenuItem key={segment}>
              <Link href={`${basePath}/${segment}`} passHref>
                <SidebarMenuButton
                  as="a"
                  isActive={isActive(segment)}
                  tooltip={{ children: label, side: "right", align: "center" }}
                  className="justify-start"
                >
                  <Icon />
                  <span>{label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarGroup>

        {hasSettings && (
          <>
            <SidebarSeparator />
            <SidebarMenuItem>
              <Link href={`${basePath}/settings`} passHref>
                <SidebarMenuButton
                  as="a"
                  isActive={settingsActive}
                  tooltip={{ children: "Settings", side: "right", align: "center" }}
                  className="justify-start"
                >
                  <Settings />
                  <span>Settings</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </>
        )}
      </SidebarMenu>
      <SidebarFooter className="p-2" />
    </Sidebar>
  );
}
