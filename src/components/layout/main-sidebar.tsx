
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

const generalMenuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/key-metrics", label: "Key Metrics", icon: BarChart2 },
  { href: "/master-data", label: "Master Data", icon: Database },
  { href: "/live-inventory", label: "Live Inventory (LIT)", icon: FileText },
  { href: "/action-items", label: "Roles & Responsibilities", icon: ListTodo },
  { href: "/roles", label: "Roles", icon: Users },
];


export function MainSidebar() {
  const pathname = usePathname();
  const { profile } = useAuth();
  const { teamLeader } = useTeamSettings();

  const isTeamLeader = profile?.id === teamLeader;


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
            <SidebarGroupLabel>General</SidebarGroupLabel>
            {generalMenuItems.map(({ href, label, icon: Icon }) => (
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
