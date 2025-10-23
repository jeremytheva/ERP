
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
import { Bot, LayoutDashboard, Database, FileText, ListTodo, Users, Settings, Briefcase, ShoppingCart, Factory, Truck, BarChart2, Crown } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTeamSettings } from "@/hooks/use-team-settings";
import { useMemo } from "react";
import type { Role } from "@/types";

type MenuItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: (Role | 'Team Leader')[];
};

const allMenuItems: MenuItem[] = [
  // General
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["Sales", "Production", "Procurement", "Logistics", "Team Leader"] },
  { href: "/key-metrics", label: "Key Metrics", icon: BarChart2, roles: ["Sales", "Production", "Procurement", "Logistics", "Team Leader"] },
  { href: "/master-data", label: "Master Data", icon: Database, roles: ["Sales", "Production", "Procurement", "Logistics"] },
  { href: "/live-inventory", label: "Live Inventory (LIT)", icon: FileText, roles: ["Sales", "Production", "Procurement", "Logistics"] },
  { href: "/action-items", label: "Roles & Responsibilities", icon: ListTodo, roles: ["Team Leader"] },
  { href: "/roles", label: "Role Views", icon: Users, roles: ["Sales", "Production", "Procurement", "Logistics", "Team Leader"] },
  
  // Specifics that might become their own pages later
  // Sales
  { href: "/roles", label: "Market Analysis", icon: BarChart2, roles: ["Sales"]},
  { href: "/roles", label: "Forecasting", icon: FileText, roles: ["Sales"]},
  { href: "/roles", label: "Pricing", icon: BarChart2, roles: ["Sales"]},
  { href: "/roles", label: "Marketing", icon: Factory, roles: ["Sales"]},
  
  // Production
  { href: "/roles", label: "Planning & Capacity", icon: Factory, roles: ["Production"]},
  { href: "/roles", label: "MRP", icon: Truck, roles: ["Production"]},
  { href: "/roles", label: "Production Release", icon: Briefcase, roles: ["Production"]},
  { href: "/roles", label: "BOM Review", icon: ShoppingCart, roles: ["Production"]},
  
  // Procurement
  { href: "/roles", label: "Sourcing", icon: Users, roles: ["Procurement"]},
  { href: "/roles", label: "Order Calculation", icon: BarChart2, roles: ["Procurement"]},
  { href: "/roles", label: "Sustainability", icon: ListTodo, roles: ["Procurement"]},
  
  // Logistics
  { href: "/roles", label: "Liquidity Check", icon: BarChart2, roles: ["Logistics"]},
  { href: "/roles", label: "Stock Transfer", icon: Truck, roles: ["Logistics"]},
  { href: "/roles", label: "Delivery Monitoring", icon: Briefcase, roles: ["Logistics"]},
];

const generalMenuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/key-metrics", label: "Key Metrics", icon: BarChart2 },
  { href: "/roles", label: "Roles", icon: Users },
];

const salesMenuItems = [
  ...generalMenuItems,
  { href: "/live-inventory", label: "Live Inventory (LIT)", icon: FileText },
  { href: "/master-data", label: "Master Data", icon: Database },
];

const productionMenuItems = [
  ...generalMenuItems,
  { href: "/live-inventory", label: "Live Inventory (LIT)", icon: FileText },
  { href: "/master-data", label: "Master Data", icon: Database },
];

const procurementMenuItems = [
    ...generalMenuItems,
    { href: "/live-inventory", label: "RM Stock Status (LIT)", icon: FileText },
    { href: "/master-data", label: "Master Data", icon: Database },
];

const logisticsMenuItems = [
    ...generalMenuItems,
    { href: "/live-inventory", label: "LIT", icon: FileText },
    { href: "/master-data", label: "Master Data", icon: Database },
];

const teamLeaderMenuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/key-metrics", label: "Key Metrics", icon: BarChart2 },
  { href: "/action-items", label: "R&R Checklist", icon: ListTodo },
  { href: "/roles", label: "Role Views", icon: Users },
];


export function MainSidebar() {
  const pathname = usePathname();
  const { profile } = useAuth();
  const { teamLeader } = useTeamSettings();

  const isTeamLeader = profile?.id === teamLeader;

  const menuItems = useMemo(() => {
    if (isTeamLeader) return teamLeaderMenuItems;
    switch (profile?.id as Role) {
        case "Sales": return salesMenuItems;
        case "Production": return productionMenuItems;
        case "Procurement": return procurementMenuItems;
        case "Logistics": return logisticsMenuItems;
        default: return generalMenuItems;
    }
  }, [profile, isTeamLeader]);


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
            {menuItems.map(({ href, label, icon: Icon }) => (
            <SidebarMenuItem key={href}>
                <Link href={href} passHref>
                <SidebarMenuButton
                    as="a"
                    isActive={pathname === href}
                    tooltip={{ children: label, side: "right", align:"center" }}
                    className="justify-start"
                >
                    <Icon />
                    <span>{label}</span>
                </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
            ))}
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
