

"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Bot, LayoutDashboard, Database, FileText, ListTodo, Users, Settings, Briefcase, ShoppingCart, Factory, Truck, BarChart2, Crown, Package, Leaf, Lightbulb } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTeamSettings } from "@/hooks/use-team-settings";
import { useMemo } from "react";
import type { Role } from "@/types";

const salesMenuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/key-metrics", label: "Key Metrics", icon: BarChart2 },
  { href: "/action-items", label: "Round Tasks", icon: ListTodo },
  { href: "/live-inventory", label: "Inventory/Stock Status (LIT)", icon: FileText },
  { href: "/sales", label: "Market Analysis (ZMARKET)", icon: BarChart2 },
  { href: "/debriefing", label: "Forecasting (MD61)", icon: FileText },
  { href: "/strategic-advisor", label: "Pricing (VK32)", icon: Lightbulb },
  { href: "/scenario-planning", label: "Marketing (ZADS)", icon: Factory },
  { href: "/master-data", label: "Master Data", icon: Database },
];

const productionMenuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/key-metrics", label: "Key Metrics", icon: BarChart2 },
    { href: "/action-items", label: "Round Tasks", icon: ListTodo },
    { href: "/production", label: "Planning & Capacity", icon: Factory },
    { href: "/live-inventory", label: "RM Stock Status (LIT)", icon: FileText },
    { href: "/master-data", label: "Master Data", icon: Database },
];

const procurementMenuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/key-metrics", label: "Key Metrics", icon: BarChart2 },
    { href: "/action-items", label: "Round Tasks", icon: ListTodo },
    { href: "/procurement", label: "Sourcing & Ordering", icon: Users },
    { href: "/live-inventory", label: "RM Stock Status (LIT)", icon: FileText },
    { href: "/master-data", label: "Master Data", icon: Database },
];

const logisticsMenuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/key-metrics", label: "Key Metrics", icon: BarChart2 },
    { href: "/action-items", label: "Round Tasks", icon: ListTodo },
    { href: "/logistics", label: "Liquidity & Transfers", icon: Truck },
    { href: "/master-data", label: "Master Data", icon: Database },
];

const teamLeaderMenuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/key-metrics", label: "Key Metrics", icon: BarChart2 },
  { href: "/action-items", label: "Round Tasks", icon: ListTodo },
  { href: "/strategic-advisor", label: "Analysis & Strategy", icon: Lightbulb },
  { href: "/debriefing", label: "Investment Decisions", icon: FileText },
  { href: "/competitor-log", label: "Competitor Log", icon: Users },
];


export function MainSidebar() {
  const pathname = usePathname();
  const { profile } = useAuth();
  const { teamLeader } = useTeamSettings();

  const isTeamLeader = profile?.id === teamLeader;

  const menuItems = useMemo(() => {
    if (isTeamLeader) return teamLeaderMenuItems;
    switch (profile?.name as Role) {
        case "Sales": return salesMenuItems;
        case "Production": return productionMenuItems;
        case "Procurement": return procurementMenuItems;
        case "Logistics": return logisticsMenuItems;
        default: return [];
    }
  }, [profile, isTeamLeader]);

  const isActive = (href: string) => {
    return pathname === href;
  }

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="flex items-center justify-between">
         <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-10 w-10 text-primary" asChild>
                <Link href="/dashboard">
                    <Bot size={24}/>
                </Link>
            </Button>
            <span className="font-semibold text-lg font-headline">ERPsim</span>
         </div>
        <SidebarTrigger className="hidden md:flex" />
      </SidebarHeader>
      <SidebarMenu className="flex-1 p-2">
        <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            {menuItems.map(({ href, label, icon: Icon }) => {
              return (
                <SidebarMenuItem key={label}>
                    <Link href={href} passHref>
                    <SidebarMenuButton
                        as="a"
                        isActive={isActive(href)}
                        tooltip={{ children: label, side: "right", align:"center" }}
                        className="justify-start"
                    >
                        <Icon />
                        <span>{label}</span>
                    </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
              )
            })}
        </SidebarGroup>
        
        <SidebarSeparator />
        
        <SidebarMenuItem>
            <Link href="/settings" passHref>
                <SidebarMenuButton
                as="a"
                isActive={pathname.startsWith("/settings")}
                tooltip={{ children: "Settings", side: "right", align:"center" }}
                className="justify-start"
                >
                <Settings />
                <span>Settings</span>
                </SidebarMenuButton>
            </Link>
        </SidebarMenuItem>
        
      </SidebarMenu>
      <SidebarFooter className="p-2">
      </SidebarFooter>
    </Sidebar>
  );
}
