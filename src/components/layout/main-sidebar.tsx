

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

const generalMenuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/key-metrics", label: "Key Metrics", icon: BarChart2 },
];

const salesMenuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/key-metrics", label: "Key Metrics", icon: BarChart2 },
  { href: "/live-inventory", label: "Inventory/Stock Status (LIT)", icon: FileText },
  { href: "/sales", label: "Market Analysis (ZMARKET)", icon: BarChart2 },
  { href: "/debriefing", label: "Forecasting (MD61)", icon: FileText },
  { href: "/strategic-advisor", label: "Pricing (VK32)", icon: BarChart2 },
  { href: "/scenario-planning", label: "Marketing (ZADS)", icon: Factory },
  { href: "/master-data", label: "Master Data", icon: Database },
];

const productionMenuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/key-metrics", label: "Key Metrics", icon: BarChart2 },
    { href: "/production", label: "Planning & Capacity", icon: Factory },
    { href: "/production", label: "MRP (MD01)", icon: Truck },
    { href: "/production", label: "Production Release (CO41)", icon: Briefcase },
    { href: "/production", label: "BOM Review (ZCS02)", icon: ShoppingCart },
    { href: "/live-inventory", label: "RM Stock Status (LIT)", icon: FileText },
    { href: "/master-data", label: "Master Data", icon: Database },
];

const procurementMenuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/key-metrics", label: "Key Metrics", icon: BarChart2 },
    { href: "/live-inventory", label: "RM Stock Status (LIT)", icon: FileText },
    { href: "/procurement", label: "Sourcing (ZME12)", icon: Users },
    { href: "/procurement", label: "Order Calculation (ME59N)", icon: BarChart2 },
    { href: "/procurement", label: "Sustainability (ZFB50)", icon: Leaf },
    { href: "/master-data", label: "Master Data", icon: Database },
];

const logisticsMenuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/key-metrics", label: "Key Metrics", icon: BarChart2 },
    { href: "/logistics", label: "Liquidity Check (ZFF7B)", icon: BarChart2 },
    { href: "/logistics", label: "Stock Transfer (ZMB1B)", icon: Truck },
    { href: "/logistics", label: "Delivery Monitoring (ZME2N)", icon: Briefcase },
    { href: "/master-data", label: "Master Data", icon: Database },
];

const teamLeaderMenuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/key-metrics", label: "Key Metrics", icon: BarChart2 },
  { href: "/action-items", label: "R&R Checklist", icon: ListTodo },
  { href: "/strategic-advisor", label: "Analysis & Strategy", icon: Lightbulb },
  { href: "/debriefing", label: "Investment Decisions (ZFB50)", icon: FileText },
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
        default: return generalMenuItems;
    }
  }, [profile, isTeamLeader]);

  const isActive = (href: string) => {
    // For production, multiple links point to the same page. We need to handle active state carefully.
    if (href.startsWith('/production') && pathname.startsWith('/production')) return true;
    if (href.startsWith('/procurement') && pathname.startsWith('/procurement')) return true;
    if (href.startsWith('/logistics') && pathname.startsWith('/logistics')) return true;
    return pathname === href;
  }

  const getHrefWithSection = (href: string, label: string) => {
    if (href === '/production') {
      if (label.includes('Planning')) return '/production?section=planning-capacity';
      if (label.includes('MRP')) return '/production?section=mrp';
      if (label.includes('Release')) return '/production?section=production-release';
      if (label.includes('BOM')) return '/production?section=bom-review';
    }
    if (href === '/procurement') {
        if (label.includes('Sourcing')) return '/procurement?section=sourcing';
        if (label.includes('Order')) return '/procurement?section=order-calculation';
        if (label.includes('Sustainability')) return '/procurement?section=sustainability';
    }
    if (href === '/logistics') {
        if (label.includes('Liquidity')) return '/logistics?section=liquidity-check';
        if (label.includes('Stock Transfer')) return '/logistics?section=stock-transfer';
        if (label.includes('Delivery')) return '/logistics?section=delivery-monitoring';
    }
    return href;
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
              const finalHref = getHrefWithSection(href, label);
              return (
                <SidebarMenuItem key={label}>
                    <Link href={finalHref} passHref>
                    <SidebarMenuButton
                        as="a"
                        isActive={isActive(finalHref)}
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

